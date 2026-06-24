import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminAssemblies() {
  const [asambleas, setAsambleas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAsamblea, setModalAsamblea] = useState(false);
  const [modalVotacion, setModalVotacion] = useState(null);
  const [modalActa, setModalActa] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formAsamblea, setFormAsamblea] = useState({
    titulo: "",
    fecha: "",
    hora: "",
    lugar: "",
    agenda: "",
  });

  const [formVotacion, setFormVotacion] = useState({
    pregunta: "",
    opciones: "",
  });

  const cargar = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/asambleas");
      setAsambleas(data);
    } catch {
      toast.error("Error al cargar asambleas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const verDetalle = async (id) => {
    try {
      const { data } = await api.get(`/asambleas/${id}`);
      const res = {};
      for (const v of data.votaciones || []) {
        try {
          const { data: r } = await api.get(`/votaciones/${v._id}/resultados`);
          res[v._id] = r;
        } catch {
          // sin votos aún
        }
      }
      setDetalle({ ...data, resultadosVotaciones: res });
    } catch {
      toast.error("Error al cargar detalle");
    }
  };

  const crearAsamblea = async () => {
    const { titulo, fecha, hora, lugar, agenda } = formAsamblea;
    if (!titulo || !fecha || !hora || !lugar || !agenda) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/asambleas", {
        titulo,
        fecha,
        hora,
        lugar,
        agenda: agenda.trim(),
      });
      toast.success("Asamblea creada");
      setModalAsamblea(false);
      setFormAsamblea({
        titulo: "",
        fecha: "",
        hora: "",
        lugar: "",
        agenda: "",
      });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear");
    } finally {
      setSubmitting(false);
    }
  };

  const crearVotacion = async () => {
    const { pregunta, opciones } = formVotacion;
    if (!pregunta || !opciones) {
      toast.error("Completa todos los campos");
      return;
    }
    const opcionesArr = opciones
      .split("\n")
      .map((o) => o.trim())
      .filter(Boolean);
    if (opcionesArr.length < 2) {
      toast.error("Ingresa al menos 2 opciones");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/votaciones", {
        asambleaId: modalVotacion._id,
        pregunta,
        opciones: opcionesArr,
      });
      toast.success("Votación creada");
      setModalVotacion(null);
      setFormVotacion({ pregunta: "", opciones: "" });
      verDetalle(modalVotacion._id);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear votación");
    } finally {
      setSubmitting(false);
    }
  };

  const cerrarVotacion = async (votacionId, asambleaId) => {
    if (!confirm("¿Cerrar esta votación? No se podrá votar después.")) return;
    try {
      await api.put(`/votaciones/${votacionId}/cerrar`);
      toast.success("Votación cerrada");
      verDetalle(asambleaId);
    } catch {
      toast.error("Error al cerrar votación");
    }
  };

  const subirActa = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try {
      const fd = new FormData();
      fd.append("acta", archivo);
      await api.put(`/asambleas/${modalActa._id}/acta`, fd);
      toast.success("Acta subida correctamente");
      setModalActa(null);
      cargar();
    } catch {
      toast.error("Error al subir acta");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Asambleas</h1>
          <p className="text-sm text-gray-500">
            Gestiona asambleas y votaciones
          </p>
        </div>
        <button
          onClick={() => setModalAsamblea(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nueva asamblea
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : asambleas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">🗳️</p>
          <p className="text-sm">No hay asambleas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {asambleas.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{a.titulo}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    📅 {formatFecha(a.fecha)} · {a.hora} · {a.lugar}
                  </p>
                  {a.agenda && (
                    <p className="text-xs text-gray-400 mt-1">
                      Agenda: {a.agenda}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => verDetalle(a._id)}
                    className="bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
                  >
                    Ver detalle
                  </button>
                  <button
                    onClick={() => setModalVotacion(a)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    + Votación
                  </button>
                  <button
                    onClick={() => setModalActa(a)}
                    className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Subir acta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {detalle.asamblea.titulo}
              </h2>
              <button
                onClick={() => setDetalle(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              📅 {formatFecha(detalle.asamblea.fecha)} · {detalle.asamblea.hora}{" "}
              · {detalle.asamblea.lugar}
            </p>

            {detalle.asamblea.agenda && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Agenda:
                </p>
                <p className="text-sm text-gray-600">
                  {detalle.asamblea.agenda}
                </p>
              </div>
            )}

            {detalle.asamblea.actaUrl && (
              <a
                href={detalle.asamblea.actaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mb-4 text-sm text-blue-600 hover:underline"
              >
                📄 Ver acta
              </a>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Votaciones ({detalle.votaciones?.length || 0})
              </p>
              {detalle.votaciones?.length === 0 && (
                <p className="text-sm text-gray-400">Sin votaciones aún</p>
              )}
              {detalle.votaciones?.map((v) => {
                const r = detalle.resultadosVotaciones?.[v._id];
                return (
                  <div
                    key={v._id}
                    className="border border-gray-100 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {v.pregunta}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Opciones: {v.opciones?.join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.abierta ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {v.abierta ? "Abierta" : "Cerrada"}
                        </span>
                        {v.abierta && (
                          <button
                            onClick={() =>
                              cerrarVotacion(v._id, detalle.asamblea._id)
                            }
                            className="text-xs text-red-600 hover:underline"
                          >
                            Cerrar
                          </button>
                        )}
                      </div>
                    </div>

                    {r && r.totalVotos > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-500">
                          Resultados · {r.totalVotos} votos
                        </p>
                        {Object.entries(r.resultados || {}).map(
                          ([opcion, votos]) => (
                            <div key={opcion}>
                              <div className="flex justify-between text-xs text-gray-700 mb-0.5">
                                <span>{opcion}</span>
                                <span>{votos} votos</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{
                                    width:
                                      r.totalVotos > 0
                                        ? `${(votos / r.totalVotos) * 100}%`
                                        : "0%",
                                  }}
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {r && r.totalVotos === 0 && (
                      <p className="text-xs text-gray-400">Sin votos aún</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva asamblea */}
      {modalAsamblea && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Nueva Asamblea
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formAsamblea.titulo}
                  onChange={(e) =>
                    setFormAsamblea({ ...formAsamblea, titulo: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formAsamblea.fecha}
                    onChange={(e) =>
                      setFormAsamblea({
                        ...formAsamblea,
                        fecha: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formAsamblea.hora}
                    onChange={(e) =>
                      setFormAsamblea({ ...formAsamblea, hora: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar *
                </label>
                <input
                  type="text"
                  value={formAsamblea.lugar}
                  onChange={(e) =>
                    setFormAsamblea({ ...formAsamblea, lugar: e.target.value })
                  }
                  placeholder="Ej: Salón de eventos"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agenda *
                </label>
                <textarea
                  rows={4}
                  value={formAsamblea.agenda}
                  onChange={(e) =>
                    setFormAsamblea({ ...formAsamblea, agenda: e.target.value })
                  }
                  placeholder="Describe los puntos de la agenda..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setModalAsamblea(false)}
                disabled={submitting}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearAsamblea}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Creando..." : "Crear asamblea"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal nueva votación */}
      {modalVotacion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Nueva Votación
            </h2>
            <p className="text-sm text-gray-500 mb-4">{modalVotacion.titulo}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pregunta *
                </label>
                <input
                  type="text"
                  value={formVotacion.pregunta}
                  onChange={(e) =>
                    setFormVotacion({
                      ...formVotacion,
                      pregunta: e.target.value,
                    })
                  }
                  placeholder="Ej: ¿Apruebas el nuevo reglamento?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opciones *{" "}
                  <span className="text-gray-400 font-normal">
                    (una por línea)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={formVotacion.opciones}
                  onChange={(e) =>
                    setFormVotacion({
                      ...formVotacion,
                      opciones: e.target.value,
                    })
                  }
                  placeholder={"Sí\nNo\nAbstención"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setModalVotacion(null)}
                disabled={submitting}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearVotacion}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Creando..." : "Crear votación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal subir acta */}
      {modalActa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Subir Acta</h2>
            <p className="text-sm text-gray-500 mb-4">{modalActa.titulo}</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={subirActa}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setModalActa(null)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
