import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const VACIO = { descripcion: "", anonimo: false };

const colorEstado = {
  pendiente: "bg-yellow-100 text-yellow-700",
  en_proceso: "bg-blue-100 text-blue-700",
  resuelto: "bg-green-100 text-green-700",
};

export default function ResidentIncidents() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [enviadas, setEnviadas] = useState([]);

  const cargar = async () => {
    try {
      const { data } = await api.get("/incidencias/mis-incidencias");
      setEnviadas(data);
    } catch {
      toast.error("Error al cargar");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion) return toast.error("Describe la incidencia");
    setEnviando(true);
    try {
      await api.post("/incidencias", form);
      toast.success("Incidencia reportada correctamente");
      setShowModal(false);
      setForm(VACIO);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al reportar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Incidencias</h1>
          <p className="text-sm text-gray-500">Reporta problemas con vecinos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Reportar
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          💡 Puedes reportar de forma anónima — el administrador no verá tu
          nombre
        </p>
      </div>

      <div className="space-y-3">
        {enviadas.map((inc) => (
          <div
            key={inc._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{inc.descripcion}</p>
                <p className="text-xs text-gray-400 mt-1">
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
          </div>
        ))}
        {enviadas.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="text-sm">No has reportado incidencias</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Reportar incidencia</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  placeholder="Describe la situación con detalle..."
                />
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="anonimo"
                  checked={form.anonimo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, anonimo: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="anonimo" className="text-sm text-gray-700">
                  Reportar anónimamente — el admin no verá mi nombre
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {enviando ? "Enviando..." : "Reportar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(VACIO);
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
