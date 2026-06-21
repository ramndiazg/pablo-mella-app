import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import ResidentDashboard from "./pages/resident/Dashboard";

function RutaRaiz() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={usuario.rol === "admin" ? "/admin/dashboard" : "/residente/dashboard"}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Raíz → redirige según rol */}
        <Route path="/" element={<RutaRaiz />} />

        {/* Rutas admin */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute rol="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Rutas residente */}
        <Route
          path="/residente/dashboard"
          element={
            <PrivateRoute rol="residente">
              <Layout>
                <ResidentDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Cualquier ruta desconocida → raíz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
