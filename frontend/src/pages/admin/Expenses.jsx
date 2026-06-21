import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const CATEGORIAS = [
  "electricidad",
  "plomeria",
  "limpieza",
  "materiales",
  "jardineria",
  "seguridad",
  "otro",
];

const VACIO = {
  descripcion: "",
  monto: "",
  categoria: "electricidad",
  fecha: new Date().toISOString().split("T")[0],
};

export default function Expenses() {
  const [gastos, setGastos] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [factura, setFactura] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      const hoy = new Date();
      const { data } = await api.get(
        "/gastos?mes=" + (hoy.getMonth() + 1) + "&anio=" + hoy.getFullYear(),
      );
      setGastos(data.gastos);
      setTotalGastos(data.totalGastos);
    } catch {
      toast.error("Error al cargar gastos");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion || !form.monto || !form.categoria || !form.fecha) {
      return toast.error("Completa todos los campos");
    }
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("descripcion", form.descripcion);
      formData.append("monto", form.monto);
      formData.append("categoria", form.categoria);
      formData.append("fecha", form.fecha);
      if (factura) formData.append("factura", factura);

      await api.post("/gastos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Gasto registrado");
      setShowModal(false);
      setForm(VACIO);
      setFactura(null);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al registrar");
    } finally {
      setEnviando(false);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    try {
      await api.delete("/gastos/" + id);
      toast.success("Gasto eliminado");
      cargar();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gastos</h1>
          <p className="text-sm text-gray-500">Gastos del mes actual</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Registrar gasto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Total del mes</p>
        <p className="text-2xl font-bold text-gray-900">
          RD${totalGastos.toLocaleString()}
        </p>
      </div>

      <div className="space-y-3">
        {gastos.map((g) => (
          <div
            key={g._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-semibold text-gray-900">{g.descripcion}</p>
              <p className="text-sm text-gray-500">
                {g.categoria} • {new Date(g.fecha).toLocaleDateString("es-DO")}
              </p>
              {g.factura && (
                <a
                  href={g.factura}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Ver factura
                </a>
              )}
            </div>
            <div className="text-right flex items-center gap-3">
              <p className="font-bold text-gray-900">
                RD${g.monto?.toLocaleString()}
              </p>
              <button
                onClick={() => eliminar(g._id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {gastos.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">📉</p>
            <p className="text-sm">No hay gastos registrados este mes</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Registrar gasto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Pago de electricidad"
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
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoria: e.target.value }))
                  }
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.fecha}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fecha: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factura (opcional)
                </label>
                <input
                  type="file"
                  className="w-full text-sm text-gray-500"
                  onChange={(e) => setFactura(e.target.files[0])}
                  accept="image/*,.pdf"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex-1 disabled:opacity-50"
                >
                  {enviando ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex-1"
                  onClick={() => {
                    setShowModal(false);
                    setForm(VACIO);
                    setFactura(null);
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
