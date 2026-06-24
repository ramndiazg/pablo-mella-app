import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function ReportPayment() {
  const { usuario } = useAuth();
  const [cuotas, setCuotas] = useState([]);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(null);
  const [comprobante, setComprobante] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api
      .get("/cuotas")
      .then(({ data }) => setCuotas(data))
      .catch(() => toast.error("Error al cargar cuotas"));
  }, []);

  const handleCuotaChange = (e) => {
    const id = e.target.value;
    const cuota = cuotas.find((c) => c._id === id);
    setCuotaSeleccionada(cuota || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cuotaSeleccionada) return toast.error("Selecciona una cuota");
    if (!comprobante) return toast.error("El comprobante es obligatorio");
    if (!usuario?.apartamentoId)
      return toast.error("No tienes apartamento asignado");

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("cuotaId", cuotaSeleccionada._id);
      formData.append(
        "apartamentoId",
        usuario.apartamentoId._id || usuario.apartamentoId,
      );
      formData.append("monto", cuotaSeleccionada.monto);
      formData.append("comprobante", comprobante);

      await api.post("/pagos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(
        "Pago reportado correctamente. El admin lo verificará pronto.",
      );
      setCuotaSeleccionada(null);
      setComprobante(null);
      document.getElementById("comprobante-input").value = "";
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al reportar pago");
    } finally {
      setEnviando(false);
    }
  };

  const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

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
              value={cuotaSeleccionada?._id || ""}
              onChange={handleCuotaChange}
            >
              <option value="">Seleccionar cuota...</option>
              {cuotas.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.tipo === "mensual"
                    ? `${MESES[c.mes - 1]} ${c.anio} — ${c.descripcion}`
                    : c.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Detalle de la cuota seleccionada */}
          {cuotaSeleccionada && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Detalle de la cuota:
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Descripción</span>
                <span className="text-gray-900 font-medium">
                  {cuotaSeleccionada.descripcion}
                </span>
              </div>
              {cuotaSeleccionada.mes && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Período</span>
                  <span className="text-gray-900 font-medium">
                    {MESES[cuotaSeleccionada.mes - 1]} {cuotaSeleccionada.anio}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo</span>
                <span className="text-gray-900 font-medium capitalize">
                  {cuotaSeleccionada.tipo}
                </span>
              </div>
              {cuotaSeleccionada.fechaLimite && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fecha límite</span>
                  <span className="text-red-600 font-medium">
                    {new Date(cuotaSeleccionada.fechaLimite).toLocaleDateString(
                      "es-DO",
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-700 font-semibold">
                  Monto a pagar
                </span>
                <span className="text-blue-600 font-bold text-lg">
                  RD$ {cuotaSeleccionada.monto?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comprobante de pago <span className="text-red-500">*</span>
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

          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠️ El monto es fijo según la cuota seleccionada y no puede
            modificarse.
          </p>

          <button
            type="submit"
            disabled={enviando || !cuotaSeleccionada}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {enviando
              ? "Enviando..."
              : `Reportar pago — RD$ ${cuotaSeleccionada?.monto?.toLocaleString() || "0"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
