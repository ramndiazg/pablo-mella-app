import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ResidentAnnouncements() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/anuncios");
      setAnuncios(data);
    } catch {
      toast.error("Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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
        <h1 className="text-xl font-bold text-gray-900">Anuncios</h1>
        <p className="text-sm text-gray-500">
          Comunicados y alertas del residencial
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : anuncios.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">📢</p>
          <p className="text-sm">No hay anuncios activos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anuncios.map((a) => (
            <div
              key={a._id}
              className={`bg-white rounded-xl border shadow-sm p-4 ${
                a.tipo === "emergencia"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">
                  {a.tipo === "emergencia" ? "🚨" : "📢"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {a.titulo}
                    </span>
                    {a.tipo === "emergencia" && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                        Emergencia
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{a.contenido}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatFecha(a.createdAt)} ·{" "}
                    {a.creadoPor?.nombre || "Administración"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
