import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const VACIO = { numero: "", nombre: "", aptasPorPiso: "4" };

export default function Buildings() {
  const [edificios, setEdificios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [apartamentos, setApartamentos] = useState({});

  const cargar = async () => {
    try {
      const { data } = await api.get("/edificios");
      setEdificios(data);
    } catch {
      toast.error("Error al cargar edificios");
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const verApartamentos = async (id) => {
    if (expandido === id) {
      setExpandido(null);
      return;
    }
    setExpandido(id);
    if (apartamentos[id]) return;
    try {
      const { data } = await api.get("/edificios/" + id);
      setApartamentos((a) => ({ ...a, [id]: data.apartamentos }));
    } catch {
      toast.error("Error al cargar apartamentos");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numero || !form.nombre || !form.aptasPorPiso) {
      return toast.error("Completa todos los campos");
    }
    setEnviando(true);
    try {
      await api.post("/edificios", {
        ...form,
        numero: Number(form.numero),
        aptasPorPiso: Number(form.aptasPorPiso),
      });
      toast.success("Edificio creado con sus apartamentos");
      setShowModal(false);
      setForm(VACIO);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear edificio");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edificios</h1>
          <p className="text-sm text-gray-500">
            {edificios.length} edificios registrados
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuevo edificio
        </button>
      </div>

      <div className="space-y-3">
        {edificios.map((e) => (
          <div
            key={e._id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => verApartamentos(e._id)}
            >
              <div>
                <p className="font-semibold text-gray-900">{e.nombre}</p>
                <p className="text-sm text-gray-500">
                  Edificio {e.numero} • {e.aptasPorPiso} aptos/piso •{" "}
                  {e.totalPisos} pisos
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  {e.aptasPorPiso * e.totalPisos} aptos
                </span>
                <span className="text-gray-400">
                  {expandido === e._id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandido === e._id && apartamentos[e._id] && (
              <div className="border-t border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Apartamentos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {apartamentos[e._id].map((a) => (
                    <div
                      key={a._id}
                      className={
                        "rounded-lg p-2 text-center text-sm " +
                        (a.residenteActualId
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-50 text-gray-400")
                      }
                    >
                      <p className="font-medium">Apto {a.numero}</p>
                      <p className="text-xs truncate">
                        {a.residenteActualId
                          ? a.residenteActualId.nombre.split(" ")[0]
                          : "Disponible"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {edificios.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
            <p className="text-3xl mb-2">🏢</p>
            <p className="text-sm">No hay edificios registrados</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-1">Nuevo edificio</h2>
            <p className="text-sm text-gray-500 mb-4">
              Se crearán los apartamentos automáticamente
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de edificio
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.numero}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, numero: e.target.value }))
                  }
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  placeholder="Edificio A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apartamentos por piso
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.aptasPorPiso}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, aptasPorPiso: e.target.value }))
                  }
                >
                  <option value="2">
                    2 apartamentos por piso (8 en total)
                  </option>
                  <option value="4">
                    4 apartamentos por piso (16 en total)
                  </option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {enviando ? "Creando..." : "Crear edificio"}
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
