import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import CascadeSelect from "../../components/CascadeSelect";

const VACIO = {
  nombre: "",
  email: "",
  password: "",
  telefono: "",
  rol: "residente",
  esDirectiva: false,
  cargoDirectiva: "",
  apartamentoId: "",
};

export default function Residents() {
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/auth/perfil");
      // El backend no tiene endpoint de listar usuarios,
      // usamos los apartamentos para obtener residentes
      const { data: edifs } = await api.get("/edificios");
      const todos = [];
      for (const edif of edifs) {
        const { data: detalle } = await api.get(`/edificios/${edif._id}`);
        for (const apt of detalle.apartamentos || []) {
          if (apt.residenteActualId) {
            todos.push({
              ...apt.residenteActualId,
              apartamento: apt,
              edificio: edif,
            });
          }
        }
      }
      setResidentes(todos);
    } catch {
      toast.error("Error al cargar residentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password) {
      return toast.error("Nombre, email y contraseña son requeridos");
    }
    setEnviando(true);
    try {
      await api.post("/auth/register", {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        telefono: form.telefono || undefined,
        rol: form.rol,
        apartamentoId: form.apartamentoId || undefined,
        esDirectiva: form.esDirectiva,
        cargoDirectiva: form.cargoDirectiva || undefined,
      });
      toast.success("Residente creado exitosamente");
      setShowModal(false);
      setForm(VACIO);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al crear residente");
    } finally {
      setEnviando(false);
    }
  };

  const filtrados = residentes.filter(
    (r) =>
      r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.email?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Residentes</h1>
          <p className="text-sm text-gray-500">
            Gestión de cuentas de residentes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nuevo residente
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre o email..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm">
            {busqueda
              ? "No se encontraron residentes"
              : "No hay residentes registrados"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((r, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600 shrink-0">
                    {r.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{r.nombre}</p>
                      {r.esDirectiva && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                          {r.cargoDirectiva || "Directiva"}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.rol === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.rol}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{r.email}</p>
                    {r.telefono && (
                      <p className="text-sm text-gray-400">📞 {r.telefono}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-gray-700">
                    Apto {r.apartamento?.numero}
                  </p>
                  <p className="text-xs text-gray-400">
                    {r.edificio?.nombre || `Edif. ${r.edificio?.numero}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-screen overflow-y-auto p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Nuevo residente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="juan@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña inicial
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional)
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefono: e.target.value }))
                  }
                  placeholder="809-000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.rol}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rol: e.target.value }))
                  }
                >
                  <option value="residente">Residente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="esDirectiva"
                  checked={form.esDirectiva}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, esDirectiva: e.target.checked }))
                  }
                  className="rounded"
                />
                <label htmlFor="esDirectiva" className="text-sm text-gray-700">
                  Miembro de la directiva
                </label>
              </div>
              {form.esDirectiva && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo en directiva
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.cargoDirectiva}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cargoDirectiva: e.target.value }))
                    }
                    placeholder="Presidente, Tesorero, Secretario..."
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar apartamento (opcional)
                </label>
                <CascadeSelect
                  soloDisponibles
                  onSelect={({ apartamentoId }) =>
                    setForm((f) => ({ ...f, apartamentoId }))
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {enviando ? "Creando..." : "Crear residente"}
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
