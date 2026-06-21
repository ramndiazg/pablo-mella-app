import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const colorEstado = {
  pendiente: "bg-yellow-100 text-yellow-700",
  pagada: "bg-green-100 text-green-700",
  anulada: "bg-gray-100 text-gray-600",
};

export default function ResidentFines() {
  const [multas, setMultas] = useState([]);
  const [comprobantes, setComprobantes] = useState({});
  const [pagando, setPagando] = useState({});

  const cargar = async () => {
    try {
      const { data } = await api.get("/multas/mis-multas");
      setMultas(data);
    } catch {
      toast.error("Error al cargar multas");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const pagar = async (id) => {
    if (!comprobantes[id])
      return toast.error("Debes subir el comprobante de pago");
    setPagando((p) => ({ ...p, [id]: true }));
    try {
      const formData = new FormData();
      formData.append("comprobantePago", comprobantes[id]);
      await api.put("/multas/" + id + "/pagar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Multa pagada correctamente");
      setComprobantes((c) => ({ ...c, [id]: null }));
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al pagar");
    } finally {
      setPagando((p) => ({ ...p, [id]: false }));
    }
  };

  const pendientes = multas.filter((m) => m.estado === "pendiente");
  const historial = multas.filter((m) => m.estado !== "pendiente");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mis Multas</h1>
        <p className="text-sm text-gray-500">Infracciones y pagos</p>
      </div>

      {pendientes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700">
            ⚠️ Tienes {pendientes.length} multa(s) pendiente(s) — esto afecta tu
            capacidad de hacer reservas
          </p>
        </div>
      )}

      {pendientes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Pendientes de pago
          </h2>
          {pendientes.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-xl border border-red-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{m.descripcion}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(m.createdAt).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <p className="font-bold text-red-600">
                  RD${m.monto?.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subir comprobante de pago
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) =>
                    setComprobantes((c) => ({
                      ...c,
                      [m._id]: e.target.files[0],
                    }))
                  }
                />
                <button
                  onClick={() => pagar(m._id)}
                  disabled={pagando[m._id]}
                  className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {pagando[m._id] ? "Pagando..." : "Reportar pago de multa"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {historial.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Historial</h2>
          {historial.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-900">{m.descripcion}</p>
                <p className="text-xs text-gray-400">
                  {new Date(m.createdAt).toLocaleDateString("es-DO")}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-gray-900">
                  RD${m.monto?.toLocaleString()}
                </p>
                <span
                  className={
                    "text-xs px-2 py-0.5 rounded-full font-medium " +
                    colorEstado[m.estado]
                  }
                >
                  {m.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {multas.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm font-medium">Sin multas</p>
          <p className="text-xs mt-1">No tienes multas registradas</p>
        </div>
      )}
    </div>
  );
}
