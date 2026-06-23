import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ResidentAssemblies() {
  const [asambleas, setAsambleas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);
  const [resultados, setResultados] = useState({});
  const [submitting, setSubmitting] = useState(null);

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
      setDetalle(data);
      // cargar resultados de cada votación
      const res = {};
      for (const v of data.votaciones || []) {
        try {
          const { data: r } = await api.get(`/votaciones/${v._id}/resultados`);
          res[v._id] = r;
        } catch {
          // votación sin resultados aún
        }
      }
      setResultados(res);
    } catch {
      toast.error("Error al cargar detalle");
    }
  };

  const votar = async (votacionId, opcion, asambleaId) => {
    try {
      setSubmitting(votacionId);
      await api.post(`/votaciones/${votacionId}/votar`, { opcion });
      toast.success("Voto registrado");
      verDetalle(asambleaId);
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al votar");
    } finally {
      setSubmitting(null);
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
        <h1 className="text-xl font-bold text-gray-900">Asambleas</h1>
        <p className="text-sm text-gray-500">
          Consulta asambleas y participa en votaciones
        </p>
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
                  {a.agenda?.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      Agenda:{" "}
                      {Array.isArray(a.agenda)
                        ? a.agenda.join(" · ")
                        : a.agenda}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => verDetalle(a._id)}
                  className="bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors shrink-0"
                >
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalle + votaciones */}
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

            <p className="text-sm text-gray-500 mb-3">
              📅 {formatFecha(detalle.asamblea.fecha)} · {detalle.asamblea.hora}{" "}
              · {detalle.asamblea.lugar}
            </p>

            {detalle.asamblea.agenda?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Agenda:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
                  {(Array.isArray(detalle.asamblea.agenda)
                    ? detalle.asamblea.agenda
                    : [detalle.asamblea.agenda]
                  ).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {detalle.asamblea.acta && (
              <a
                href={detalle.asamblea.acta}
                target="_blank"
                rel="noreferrer"
                className="inline-block mb-4 text-sm text-blue-600 hover:underline"
              >
                📄 Ver acta
              </a>
            )}

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">
                Votaciones ({detalle.votaciones?.length || 0})
              </p>

              {detalle.votaciones?.length === 0 && (
                <p className="text-sm text-gray-400">Sin votaciones aún</p>
              )}

              {detalle.votaciones?.map((v) => {
                const r = resultados[v._id];
                const yaVote = r?.yaVote;
                const cerrada = !v.abierta;

                return (
                  <div
                    key={v._id}
                    className="border border-gray-100 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {v.pregunta}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${v.abierta ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {v.abierta ? "Abierta" : "Cerrada"}
                      </span>
                    </div>

                    {/* Resultados si ya votó o está cerrada */}
                    {(yaVote || cerrada) && r && (
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
                        {yaVote && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Ya votaste
                          </p>
                        )}
                      </div>
                    )}

                    {/* Botones para votar */}
                    {!yaVote && !cerrada && (
                      <div className="flex flex-wrap gap-2">
                        {v.opciones?.map((opcion) => (
                          <button
                            key={opcion}
                            onClick={() =>
                              votar(v._id, opcion, detalle.asamblea._id)
                            }
                            disabled={submitting === v._id}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {submitting === v._id ? "Votando..." : opcion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
