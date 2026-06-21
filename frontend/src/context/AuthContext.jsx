import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

// Lee la sesión guardada una sola vez al iniciar (fuera del componente)
function cargarSesionInicial() {
  try {
    const token = localStorage.getItem("token");
    const usuarioGuardado = localStorage.getItem("usuario");
    if (token && usuarioGuardado) {
      return JSON.parse(usuarioGuardado);
    }
  } catch {
    // si el JSON está corrupto, ignorar
  }
  return null;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(cargarSesionInicial);
  const [cargando] = useState(false);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // El backend devuelve todo junto: token + datos del usuario
    const { token, ...usuario } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    setUsuario(usuario);
    return usuario;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        logout,
        esAdmin: usuario?.rol === "admin",
        esResidente: usuario?.rol === "residente",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
