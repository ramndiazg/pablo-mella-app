import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const VACIO = {
  tipo: "mensual",
  mes: new Date().getMonth() + 1,
  anio: new Date().getFullYear(),
  monto: "",
  descripcion: "",
  fechaLimite: "",
};

export default function Fees() {
  const [cuotas, setCuotas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const { data } = await api.get("/cuotas");
      setCuotas(data);
    } catch {
      toast.error("Error al cargar cuotas");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.monto || !form.descripcion)
      return toast.error("Completa todos los campos");
    setEnviando(true);
    try {
      await api.post("/cuotas", { ...form, monto: Number(form.monto) });
      toast.success("Cuota creada exitosamente");
      setShowModal(false);
      setForm(VACIO);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear cuota");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cuotas</h1>
          <p className="text-sm text-gray-500">
            Cuotas mensuales y extraordinarias
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nueva cuota
        </button>
      </div>

      <div className="space-y-3">
        {cuotas.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900">{c.descripcion}</p>
              <p className="text-sm text-gray-500">
                {MESES[c.mes - 1]} {c.anio} •{" "}
                <span
                  className={
                    c.tipo === "extraordinaria"
                      ? "text-orange-600 font-medium"
                      : "text-blue-600 font-medium"
                  }
                >
                  {c.tipo}
                </span>
              </p>
              {c.fechaLimite && (
                <p className="text-xs text-gray-400">
                  Límite: {new Date(c.fechaLimite).toLocaleDateString("es-DO")}
                </p>
              )}
            </div>
            <p className="text-xl font-bold text-gray-900">
              RD${c.monto?.toLocaleString()}
            </p>
          </div>
        ))}
        {cuotas.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm">No hay cuotas creadas aún</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-2">Nueva cuota</h2>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              ⚠️ Verifica el monto antes de crear — no se puede editar después.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tipo: e.target.value }))
                  }
                >
                  <option value="mensual">Mensual</option>
                  <option value="extraordinaria">Extraordinaria</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mes
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.mes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mes: Number(e.target.value) }))
                    }
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.anio}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, anio: Number(e.target.value) }))
                    }
                  />
                </div>
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
                  placeholder="2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descripcion: e.target.value }))
                  }
                  placeholder="Cuota de mantenimiento junio 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha límite (opcional)
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.fechaLimite}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fechaLimite: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1 disabled:opacity-50"
                >
                  {enviando ? "Creando..." : "Crear cuota"}
                </button>
                <button
                  type="button"
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setForm(VACIO);
                  }}
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
