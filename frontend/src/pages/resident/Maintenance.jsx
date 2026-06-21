import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const TIPOS = ["electrico", "plomeria", "limpieza", "estructura", "otro"];

const VACIO = { descripcion: "", tipo: "plomeria" };

const colorEstado = {
  pendiente: "bg-yellow-100 text-yellow-700",
  en_proceso: "bg-blue-100 text-blue-700",
  resuelto: "bg-green-100 text-green-700",
};

export default function ResidentMaintenance() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [foto, setFoto] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get("/mantenimiento/mis-solicitudes");
      setSolicitudes(data);
    } catch {
      toast.error("Error al cargar solicitudes");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.tipo)
      return toast.error("Completa todos los campos");
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("descripcion", form.descripcion);
      formData.append("tipo", form.tipo);
      if (foto) formData.append("foto", foto);

      await api.post("/mantenimiento", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Solicitud enviada correctamente");
      setShowModal(false);
      setForm(VACIO);
      setFoto(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al enviar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mantenimiento</h1>
          <p className="text-sm text-gray-500">
            Mis solicitudes de mantenimiento
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nueva solicitud
        </button>
      </div>

      <div className="space-y-3">
        {solicitudes.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.descripcion}</p>
                <p className="text-sm text-gray-500">Tipo: {s.tipo}</p>
                <p className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString("es-DO")}
                </p>
              </div>
              <span
                className={
                  "text-xs px-2 py-0.5 rounded-full font-medium " +
                  colorEstado[s.estado]
                }
              >
                {s.estado.replace("_", " ")}
              </span>
            </div>
            {s.nota && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                📝 Nota del admin: {s.nota}
              </p>
            )}
            {s.foto && (
              <a
                href={s.foto}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Ver foto adjunta
              </a>
            )}
          </div>
        ))}
        {solicitudes.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">🔧</p>
            <p className="text-sm">No tienes solicitudes de mantenimiento</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Nueva solicitud</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de problema
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipo: e.target.value }))
                  }
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  placeholder="Describe el problema con detalle..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-2"
                  onChange={(e) => setFoto(e.target.files[0])}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Enviar solicitud"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(VACIO);
                    setFoto(null);
                  }}
                  className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
