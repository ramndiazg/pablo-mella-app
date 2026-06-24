import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const ESTADOS = ["pendiente", "en_proceso", "resuelto"];

export default function Incidents() {
  const [incidencias, setIncidencias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const query = filtro ? "?estado=" + filtro : "";
      const { data } = await api.get("/incidencias" + query);
      setIncidencias(data);
    } catch {
      toast.error("Error al cargar");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtro]);

  const actualizar = async (id, estado) => {
    try {
      await api.put("/incidencias/" + id, { estado });
      toast.success("Incidencia actualizada");
      cargar();
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const colorEstado = {
    pendiente: "bg-yellow-100 text-yellow-700",
    en_proceso: "bg-blue-100 text-blue-700",
    resuelto: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Incidencias</h1>
        <p className="text-sm text-gray-500">Reportes entre vecinos</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", ...ESTADOS].map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors " +
              (filtro === e
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50")
            }
          >
            {e || "Todos"}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {incidencias.map((inc) => (
            <div
              key={inc._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {inc.descripcion}
                  </p>
                  <p className="text-sm text-gray-500">
                    Reportado por:{" "}
                    {inc.anonimo ? "🕵️ Anónimo" : inc.reportadoPor?.nombre}
                  </p>
                  {!inc.anonimo && inc.apartamentoId && (
                    <p className="text-xs text-gray-400">
                      Edif.{" "}
                      {inc.apartamentoId?.edificioId?.nombre ||
                        inc.apartamentoId?.edificioId?.numero}{" "}
                      — Apto {inc.apartamentoId?.numero}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(inc.createdAt).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <span
                  className={
                    "text-xs px-2 py-0.5 rounded-full font-medium " +
                    colorEstado[inc.estado]
                  }
                >
                  {inc.estado.replace("_", " ")}
                </span>
              </div>

              {inc.estado !== "resuelto" && (
                <div className="flex gap-2">
                  {inc.estado === "pendiente" && (
                    <button
                      onClick={() => actualizar(inc._id, "en_proceso")}
                      className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Poner en proceso
                    </button>
                  )}
                  <button
                    onClick={() => actualizar(inc._id, "resuelto")}
                    className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Marcar resuelto
                  </button>
                </div>
              )}
            </div>
          ))}
          {incidencias.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
              <p className="text-3xl mb-2">⚠️</p>
              <p className="text-sm">
                No hay incidencias {filtro && 'con estado "' + filtro + '"'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
