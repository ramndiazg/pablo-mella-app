import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CascadeSelect from "../../components/CascadeSelect";

const VACIO = { apartamentoId: "", descripcion: "", monto: "" };

export default function Fines() {
  const [multas, setMultas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const query = filtro ? "?estado=" + filtro : "";
      const { data } = await api.get("/multas" + query);
      setMultas(data);
    } catch {
      toast.error("Error al cargar multas");
    }
  };

  useEffect(() => {
    cargar();
  }, [filtro]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.apartamentoId || !form.descripcion || !form.monto) {
      return toast.error("Completa todos los campos");
    }
    setEnviando(true);
    try {
      await api.post("/multas", { ...form, monto: Number(form.monto) });
      toast.success("Multa creada");
      setShowModal(false);
      setForm(VACIO);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear multa");
    } finally {
      setEnviando(false);
    }
  };

  const anular = async (id) => {
    if (!confirm("¿Anular esta multa?")) return;
    try {
      await api.put("/multas/" + id + "/anular");
      toast.success("Multa anulada");
      cargar();
    } catch {
      toast.error("Error al anular");
    }
  };

  const colorEstado = {
    pendiente: "bg-yellow-100 text-yellow-700",
    pagada: "bg-green-100 text-green-700",
    anulada: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Multas</h1>
          <p className="text-sm text-gray-500">Infracciones y sanciones</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nueva multa
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "pendiente", "pagada", "anulada"].map((e) => (
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
            {e || "Todas"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {multas.map((m) => (
          <div
            key={m._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900">{m.descripcion}</p>
              <p className="text-sm text-gray-500">
                Apto {m.apartamentoId?.numero} • {m.residenteId?.nombre}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(m.createdAt).toLocaleDateString("es-DO")}
              </p>
              {m.comprobantePago && (
                <a
                  href={m.comprobantePago}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver comprobante
                </a>
              )}
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold text-gray-900">
                RD${m.monto?.toLocaleString()}
              </p>
              <span
                className={
                  "text-xs px-2 py-0.5 rounded-full font-medium " +
                  colorEstado[m.estado]
                }
              >
                {m.estado}
              </span>
              {m.estado === "pendiente" && (
                <div>
                  <button
                    onClick={() => anular(m._id)}
                    className="text-xs text-red-500 hover:underline block mt-1"
                  >
                    Anular
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {multas.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">🚫</p>
            <p className="text-sm">No hay multas registradas</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Nueva multa</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartamento
                </label>
                <CascadeSelect
                  onSelect={({ apartamentoId }) =>
                    setForm((f) => ({ ...f, apartamentoId }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  placeholder="Descripción de la infracción..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (RD$)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.monto}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, monto: e.target.value }))
                  }
                  placeholder="500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {enviando ? "Creando..." : "Crear multa"}
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
