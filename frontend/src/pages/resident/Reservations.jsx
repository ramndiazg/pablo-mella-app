import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";

const espacioLabel = { gazebo: "Gazebo", salon: "Salón de Eventos" };

const badgeClass = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
  cancelada: "bg-gray-100 text-gray-600",
};

export default function ResidentReservations() {
  const [misReservas, setMisReservas] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mesActual] = useState(new Date());

  const [form, setForm] = useState({
    espacio: "gazebo",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    descripcion: "",
  });

  const cargar = async () => {
    try {
      setLoading(true);
      const mes = mesActual.getMonth() + 1;
      const anio = mesActual.getFullYear();
      const [resReservas, resCal] = await Promise.all([
        api.get("/reservas/mis-reservas"),
        api.get("/reservas/calendario", { params: { mes, anio } }),
      ]);
      setMisReservas(resReservas.data);
      setCalendario(resCal.data);
    } catch {
      toast.error("Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async () => {
    const { espacio, fecha, horaInicio, horaFin } = form;
    if (!espacio || !fecha || !horaInicio || !horaFin) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/reservas", form);
      toast.success("Reserva solicitada correctamente");
      setModal(false);
      setForm({
        espacio: "gazebo",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        descripcion: "",
      });
      cargar();
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("No puedes reservar: tienes deudas o multas pendientes");
      } else {
        toast.error(err.response?.data?.mensaje || "Error al crear reserva");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const cancelar = async (id) => {
    if (!confirm("¿Cancelar esta reserva?")) return;
    try {
      await api.put(`/reservas/${id}/cancelar`);
      toast.success("Reserva cancelada");
      cargar();
    } catch {
      toast.error("Error al cancelar");
    }
  };

  const formatFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd MMM yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  // Construir grilla del calendario
  const diasDelMes = eachDayOfInterval({
    start: startOfMonth(mesActual),
    end: endOfMonth(mesActual),
  });

  const reservasPorDia = (dia) => {
    const diaStr = format(dia, "yyyy-MM-dd");
    return calendario.filter((r) => r.fecha?.startsWith(diaStr));
  };

  const primerDia = getDay(startOfMonth(mesActual)); // 0=dom

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Reservas de Áreas Comunes
          </h1>
          <p className="text-sm text-gray-500">Gazebo y Salón de Eventos</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nueva reserva
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Calendario */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3">
              📅 {format(mesActual, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
                <div key={d} className="font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: primerDia }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {diasDelMes.map((dia) => {
                const reservas = reservasPorDia(dia);
                const tieneReserva = reservas.length > 0;
                return (
                  <div
                    key={dia.toString()}
                    className={`rounded-lg p-1 min-h-10 text-xs ${
                      tieneReserva
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="font-medium text-gray-700">
                      {format(dia, "d")}
                    </div>
                    {reservas.map((r, i) => (
                      <div
                        key={i}
                        className="text-blue-600 truncate leading-tight"
                      >
                        {espacioLabel[r.espacio] || r.espacio}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mis reservas */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">
              Mis solicitudes
            </h2>
            {misReservas.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-sm">No tienes reservas aún</p>
              </div>
            ) : (
              <div className="space-y-3">
                {misReservas.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
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
                          📅 {formatFecha(r.fecha)} · {r.horaInicio} –{" "}
                          {r.horaFin}
                        </p>
                        {r.descripcion && (
                          <p className="text-sm text-gray-500 italic mt-1">
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
                        <button
                          onClick={() => cancelar(r._id)}
                          className="text-sm text-red-600 hover:underline shrink-0"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal nueva reserva */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Nueva Reserva
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espacio
                </label>
                <select
                  value={form.espacio}
                  onChange={(e) =>
                    setForm({ ...form, espacio: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gazebo">Gazebo</option>
                  <option value="salon">Salón de Eventos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) =>
                      setForm({ ...form, horaInicio: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora fin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={form.horaFin}
                    onChange={(e) =>
                      setForm({ ...form, horaFin: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  placeholder="Ej: Reunión familiar, cumpleaños..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              ⚠️ Si tienes deudas o multas pendientes no podrás hacer reservas.
            </p>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setModal(false)}
                disabled={submitting}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Solicitar reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
