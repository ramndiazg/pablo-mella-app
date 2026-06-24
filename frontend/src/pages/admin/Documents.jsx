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

export default function AdminDocuments() {
  const [documentos, setDocumentos] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    tipo: "reglamento",
    archivo: null,
  });

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

  const handleSubmit = async () => {
    const { titulo, tipo, archivo } = form;
    if (!titulo || !tipo || !archivo) {
      toast.error("Título, tipo y archivo son obligatorios");
      return;
    }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("titulo", form.titulo);
      fd.append("descripcion", form.descripcion);
      fd.append("tipo", form.tipo);
      fd.append("archivo", form.archivo);
      await api.post("/documentos", fd);
      toast.success("Documento subido correctamente");
      setModal(false);
      setForm({
        titulo: "",
        descripcion: "",
        tipo: "reglamento",
        archivo: null,
      });
      cargar();
    } catch (err) {
      console.log("Error detalle:", err.response?.data);
      toast.error(err.response?.data?.mensaje || "Error al subir documento");
    } finally {
      setSubmitting(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este documento?")) return;
    try {
      await api.delete(`/documentos/${id}`);
      toast.success("Documento eliminado");
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
          <h1 className="text-xl font-bold text-gray-900">Documentos</h1>
          <p className="text-sm text-gray-500">
            Reglamentos, actas y circulares
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Subir documento
        </button>
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
          <p className="text-sm">
            No hay documentos{" "}
            {filtro !== "todos" ? `de tipo "${tipoLabel[filtro]}"` : ""}
          </p>
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
                    📅 {formatFecha(d.createdAt)} ·{" "}
                    {d.subidoPor?.nombre || "Admin"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
                  >
                    📄 Ver
                  </a>
                  <button
                    onClick={() => eliminar(d._id)}
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

      {/* Modal subir documento */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Subir Documento
            </h2>
            <div className="space-y-3">
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
                  Tipo *
                </label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="reglamento">Reglamento</option>
                  <option value="acta">Acta</option>
                  <option value="circular">Circular</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) =>
                    setForm({ ...form, archivo: e.target.files[0] })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
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
                {submitting ? "Subiendo..." : "Subir documento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
