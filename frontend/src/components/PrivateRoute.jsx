import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, rol }) {
  const { usuario } = useAuth();

  // Si no hay sesión, manda al login
  if (!usuario) return <Navigate to="/login" replace />;

  // Si hay sesión pero el rol no coincide, manda al dashboard correcto
  if (rol && usuario.rol !== rol) {
    return (
      <Navigate
        to={
          usuario.rol === "admin" ? "/admin/dashboard" : "/residente/dashboard"
        }
        replace
      />
    );
  }

  return children;
}
