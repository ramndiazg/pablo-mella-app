import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TIPOS = ["todos", "reglamento", "acta", "circular", "otro"];

const tipoLabel = {
  reglamento: "Reglamento",
  acta: "Acta",
  circular: "Circular",
  otro: "Otro",
};

const tipoColor = {
  reglamento: "bg-purple-100 text-purple-700",
  acta: "bg-blue-100 text-blue-700",
  circular: "bg-yellow-100 text-yellow-700",
  otro: "bg-gray-100 text-gray-600",
};

export default function ResidentDocuments() {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const params = filtro !== "todos" ? { tipo: filtro } : {};
      const { data } = await api.get("/documentos", { params });
      setDocumentos(data);
    } catch {
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [filtro]);

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
        <h1 className="text-xl font-bold text-gray-900">Documentos</h1>
        <p className="text-sm text-gray-500">
          Reglamentos, actas y circulares del residencial
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <button
            key={t}
            onClick={() => setFiltro(t)}
            className={
              filtro === t
                ? "bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium"
            }
          >
            {t === "todos" ? "Todos" : tipoLabel[t]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : documentos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">📁</p>
          <p className="text-sm">No hay documentos disponibles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documentos.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {d.titulo}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColor[d.tipo]}`}
                    >
                      {tipoLabel[d.tipo]}
                    </span>
                  </div>
                  {d.descripcion && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {d.descripcion}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    📅 {formatFecha(d.creadoEn || d.createdAt)}
                  </p>
                </div>
                <a
                  href={d.archivo}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
                >
                  📄 Ver
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
