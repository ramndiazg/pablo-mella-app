import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const adminLinks = [
  { to: "/admin/dashboard", emoji: "📊", label: "Dashboard" },
  { to: "/admin/residentes", emoji: "👥", label: "Residentes" },
  { to: "/admin/edificios", emoji: "🏢", label: "Edificios" },
  { to: "/admin/cuotas", emoji: "💰", label: "Cuotas" },
  { to: "/admin/pagos", emoji: "🧾", label: "Pagos" },
  { to: "/admin/gastos", emoji: "📉", label: "Gastos" },
  { to: "/admin/anuncios", emoji: "📢", label: "Anuncios" },
  { to: "/admin/mantenimiento", emoji: "🔧", label: "Mantenimiento" },
  { to: "/admin/incidencias", emoji: "⚠️", label: "Incidencias" },
  { to: "/admin/multas", emoji: "🚫", label: "Multas" },
  { to: "/admin/reservas", emoji: "📅", label: "Reservas" },
  { to: "/admin/asambleas", emoji: "🗳️", label: "Asambleas" },
  { to: "/admin/documentos", emoji: "📁", label: "Documentos" },
  { to: "/admin/mi-cuenta", emoji: "👤", label: "Mi Cuenta" },
  { to: "/admin/morosidad", emoji: "📊", label: "Morosidad" },
  { to: "/admin/contabilidad", emoji: "📒", label: "Contabilidad" },
];

const residenteLinks = [
  { to: "/residente/dashboard", emoji: "🏠", label: "Inicio" },
  { to: "/residente/mi-cuenta", emoji: "👤", label: "Mi Cuenta" },
  { to: "/residente/pagar", emoji: "💳", label: "Reportar Pago" },
  { to: "/residente/mantenimiento", emoji: "🔧", label: "Mantenimiento" },
  { to: "/residente/incidencias", emoji: "⚠️", label: "Incidencias" },
  { to: "/residente/multas", emoji: "🚫", label: "Mis Multas" },
  { to: "/residente/reservas", emoji: "📅", label: "Reservas" },
  { to: "/residente/anuncios", emoji: "📢", label: "Anuncios" },
  { to: "/residente/asambleas", emoji: "🗳️", label: "Asambleas" },
  { to: "/residente/documentos", emoji: "📁", label: "Documentos" },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { usuario, esAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const links = esAdmin ? adminLinks : residenteLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
        fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200
        z-30 flex flex-col transition-transform duration-200
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏘️</span>
            <div>
              <p className="text-xs font-bold text-gray-900 leading-tight">
                Pablo Mella Morales
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                Manzana O — Parte 1
              </p>
            </div>
          </div>
        </div>

        {/* Info usuario */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900 truncate">
            {usuario?.nombre}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              esAdmin
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {esAdmin ? "Administrador" : "Residente"}
          </span>
          {usuario?.esDirectiva && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              {usuario.cargoDirectiva || "Directiva"}
            </span>
          )}
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {links.map(({ to, emoji, label }) => (
            <NavLink
              key={to}
              to={to}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              <span>{emoji}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <span>🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
