import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function AdminAnnouncements() {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    contenido: "",
    tipo: "normal",
  });

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

  const handleSubmit = async () => {
    if (!form.titulo || !form.contenido) {
      toast.error("Título y contenido son obligatorios");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/anuncios", form);
      toast.success("Anuncio publicado");
      setModal(false);
      setForm({ titulo: "", contenido: "", tipo: "normal" });
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al publicar");
    } finally {
      setSubmitting(false);
    }
  };

  const desactivar = async (id) => {
    if (!confirm("¿Desactivar este anuncio?")) return;
    try {
      await api.put(`/anuncios/${id}/desactivar`);
      toast.success("Anuncio desactivado");
      cargar();
    } catch {
      toast.error("Error al desactivar");
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este anuncio?")) return;
    try {
      await api.delete(`/anuncios/${id}`);
      toast.success("Anuncio eliminado");
      cargar();
    } catch {
      toast.error("Error al eliminar");
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
          <h1 className="text-xl font-bold text-gray-900">Anuncios</h1>
          <p className="text-sm text-gray-500">
            Publica anuncios y alertas de emergencia
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuevo anuncio
        </button>
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
                a.tipo === "emergencia" ? "border-red-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {a.titulo}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        a.tipo === "emergencia"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {a.tipo === "emergencia" ? "🚨 Emergencia" : "📢 Normal"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{a.contenido}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatFecha(a.createdAt)} ·{" "}
                    {a.creadoPor?.nombre || "Admin"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => desactivar(a._id)}
                    className="bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
                  >
                    Desactivar
                  </button>
                  <button
                    onClick={() => eliminar(a._id)}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Nuevo Anuncio
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido *
                </label>
                <textarea
                  rows={4}
                  value={form.contenido}
                  onChange={(e) =>
                    setForm({ ...form, contenido: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {form.tipo === "emergencia" && (
                <p className="text-xs text-red-600">
                  🚨 Este anuncio aparecerá en rojo en la parte superior de
                  todas las páginas.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setModal(false)}
                disabled={submitting}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
