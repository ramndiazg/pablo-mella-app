import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ESTADOS = ["todas", "pendiente", "aprobada", "rechazada", "cancelada"];

const badgeClass = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
  cancelada: "bg-gray-100 text-gray-600",
};

const espacioLabel = { gazebo: "Gazebo", salon: "Salón de Eventos" };

export default function AdminReservations() {
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("pendiente");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const params = filtro !== "todas" ? { estado: filtro } : {};
      const { data } = await api.get("/reservas", { params });
      setReservas(data);
    } catch {
      toast.error("Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtro]);

  const abrirModal = (reserva, accion) => {
    setModal({ reserva, accion });
    setMotivo("");
  };

  const cerrarModal = () => {
    setModal(null);
    setMotivo("");
  };

  const verificar = async () => {
    if (modal.accion === "rechazada" && !motivo.trim()) {
      toast.error("El motivo de rechazo es obligatorio");
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/reservas/${modal.reserva._id}/verificar`, {
        estado: modal.accion,
        motivoRechazo: modal.accion === "rechazada" ? motivo : undefined,
      });
      toast.success(
        modal.accion === "aprobada" ? "Reserva aprobada" : "Reserva rechazada",
      );
      cerrarModal();
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al procesar");
    } finally {
      setSubmitting(false);
    }
  };

  const formatFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd MMM yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Reservas de Áreas Comunes
        </h1>
        <p className="text-sm text-gray-500">
          Aprueba o rechaza solicitudes de reserva
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={
              filtro === e
                ? "bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium"
            }
          >
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reservas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm">
            No hay reservas {filtro !== "todas" ? `en estado "${filtro}"` : ""}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservas.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {espacioLabel[r.espacio] || r.espacio}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass[r.estado]}`}
                    >
                      {r.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 {formatFecha(r.fecha)} · {r.horaInicio} – {r.horaFin}
                  </p>
                  <p className="text-sm text-gray-500">
                    👤 {r.residenteId?.nombre || "—"} · Apto{" "}
                    {r.apartamentoId?.numero || "—"}
                  </p>
                  {r.descripcion && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      "{r.descripcion}"
                    </p>
                  )}
                  {r.motivoRechazo && (
                    <p className="text-sm text-red-600 mt-1">
                      Motivo: {r.motivoRechazo}
                    </p>
                  )}
                </div>

                {r.estado === "pendiente" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => abrirModal(r, "aprobada")}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => abrirModal(r, "rechazada")}
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {modal.accion === "aprobada"
                ? "✅ Aprobar reserva"
                : "❌ Rechazar reserva"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {espacioLabel[modal.reserva.espacio]} ·{" "}
              {formatFecha(modal.reserva.fecha)} · {modal.reserva.horaInicio}–
              {modal.reserva.horaFin}
            </p>

            {modal.accion === "rechazada" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Explica el motivo del rechazo..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {modal.accion === "aprobada" && (
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirmas la aprobación de esta reserva?
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={cerrarModal}
                disabled={submitting}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={verificar}
                disabled={submitting}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                  modal.accion === "aprobada"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } disabled:opacity-50`}
              >
                {submitting
                  ? "Procesando..."
                  : modal.accion === "aprobada"
                    ? "Sí, aprobar"
                    : "Sí, rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
