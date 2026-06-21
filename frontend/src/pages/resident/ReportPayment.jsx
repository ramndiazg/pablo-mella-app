import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function ReportPayment() {
  const { usuario } = useAuth();
  const [cuotas, setCuotas] = useState([]);
  const [form, setForm] = useState({ cuotaId: "", monto: "" });
  const [comprobante, setComprobante] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get("/cuotas")
      .then(({ data }) => setCuotas(data))
      .catch(() => toast.error("Error al cargar cuotas"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cuotaId) return toast.error("Selecciona una cuota");
    if (!form.monto) return toast.error("Ingresa el monto");
    if (!comprobante) return toast.error("El comprobante es obligatorio");
    if (!usuario?.apartamentoId)
      return toast.error("No tienes apartamento asignado");

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("cuotaId", form.cuotaId);
      formData.append(
        "apartamentoId",
        usuario.apartamentoId._id || usuario.apartamentoId,
      );
      formData.append("monto", form.monto);
      formData.append("comprobante", comprobante);

      await api.post("/pagos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        "Pago reportado correctamente. El admin lo verificará pronto.",
      );
      setForm({ cuotaId: "", monto: "" });
      setComprobante(null);
      document.getElementById("comprobante-input").value = "";
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al reportar pago");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Reportar Pago</h1>
        <p className="text-sm text-gray-500">
          Sube tu comprobante para que el administrador lo verifique
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          📋 Tu apartamento:{" "}
          <span className="font-semibold">
            {usuario?.apartamentoId?.numero
              ? "Apto " + usuario.apartamentoId.numero
              : "No asignado"}
          </span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuota a pagar
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.cuotaId}
              onChange={(e) =>
                setForm((f) => ({ ...f, cuotaId: e.target.value }))
              }
            >
              <option value="">Seleccionar cuota...</option>
              {cuotas.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.descripcion} — RD${c.monto?.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto pagado (RD$)
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.monto}
              onChange={(e) =>
                setForm((f) => ({ ...f, monto: e.target.value }))
              }
              placeholder="2500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comprobante de pago
            </label>
            <input
              id="comprobante-input"
              type="file"
              accept="image/*,.pdf"
              className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2"
              onChange={(e) => setComprobante(e.target.files[0])}
            />
            <p className="text-xs text-gray-400 mt-1">
              Imagen o PDF del comprobante de transferencia
            </p>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Reportar pago"}
          </button>
        </form>
      </div>
    </div>
  );
}
