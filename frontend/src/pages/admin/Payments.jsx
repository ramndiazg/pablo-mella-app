import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Payments() {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [motivoRechazo, setMotivoRechazo] = useState({});

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await api.get("/pagos/pendientes");
      setPagos(data);
    } catch {
      toast.error("Error al cargar pagos");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const verificar = async (id, estado) => {
    if (estado === "rechazado" && !motivoRechazo[id]) {
      toast.error("Debes indicar el motivo del rechazo");
      return;
    }
    try {
      await api.put("/pagos/" + id + "/verificar", {
        estado,
        motivoRechazo: motivoRechazo[id] || "",
      });
      toast.success(estado === "aprobado" ? "Pago aprobado" : "Pago rechazado");
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al verificar");
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Verificar Pagos</h1>
        <p className="text-sm text-gray-500">
          {pagos.length} comprobante(s) esperando verificación
        </p>
      </div>

      {pagos.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-medium">Todo al día</p>
          <p className="text-sm">No hay comprobantes pendientes</p>
        </div>
      )}

      <div className="space-y-4">
        {pagos.map((pago) => (
          <div
            key={pago._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {pago.residenteId?.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  Apto {pago.apartamentoId?.numero}
                </p>
                <p className="text-sm text-gray-500">
                  {pago.cuotaId?.descripcion}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  RD${pago.monto?.toLocaleString()}
                </p>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  Pendiente
                </span>
              </div>
            </div>

            {pago.comprobante && (
              <div>
                <a
                  href={pago.comprobante}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver comprobante
                </a>
              </div>
            )}

            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Motivo de rechazo (obligatorio si rechaza)"
              value={motivoRechazo[pago._id] || ""}
              onChange={(e) =>
                setMotivoRechazo((m) => ({ ...m, [pago._id]: e.target.value }))
              }
            />

            <div className="flex gap-3">
              <button
                onClick={() => verificar(pago._id, "aprobado")}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Aprobar
              </button>
              <button
                onClick={() => verificar(pago._id, "rechazado")}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
