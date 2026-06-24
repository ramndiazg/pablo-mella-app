import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import ResidentMaintenance from "./pages/resident/Maintenance";
import ResidentIncidents from "./pages/resident/Incidents";
import ResidentFines from "./pages/resident/Fines";
import AdminAssemblies from "./pages/admin/Assemblies";
import ResidentAssemblies from "./pages/resident/Assemblies";
import AdminDocuments from "./pages/admin/Documents";
import ResidentDocuments from "./pages/resident/Documents";
import MyAccount from "./pages/resident/MyAccount";

import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/Dashboard";
import Fees from "./pages/admin/Fees";
import Payments from "./pages/admin/Payments";
import Expenses from "./pages/admin/Expenses";
import Maintenance from "./pages/admin/Maintenance";
import Incidents from "./pages/admin/Incidents";
import Fines from "./pages/admin/Fines";
import Buildings from "./pages/admin/Buildings";
import Residents from "./pages/admin/Residents";
import AdminReservations from "./pages/admin/Reservations";
import ResidentReservations from "./pages/resident/Reservations";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminMyAccount from "./pages/admin/MyAccount";
import ResidentAnnouncements from "./pages/resident/Announcements";

import ResidentDashboard from "./pages/resident/Dashboard";
import ReportPayment from "./pages/resident/ReportPayment";

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

function AdminRoute({ children }) {
  return (
    <PrivateRoute rol="admin">
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

function ResidenteRoute({ children }) {
  return (
    <PrivateRoute rol="residente">
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            zIndex: 99999,
          },
        }}
        containerStyle={{ zIndex: 99999 }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaRaiz />} />

        {/* Admin */}
        <Route
          path="/admin/mi-cuenta"
          element={
            <AdminRoute>
              <AdminMyAccount />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/anuncios"
          element={
            <AdminRoute>
              <AdminAnnouncements />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/cuotas"
          element={
            <AdminRoute>
              <Fees />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pagos"
          element={
            <AdminRoute>
              <Payments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/gastos"
          element={
            <AdminRoute>
              <Expenses />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/mantenimiento"
          element={
            <AdminRoute>
              <Maintenance />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/incidencias"
          element={
            <AdminRoute>
              <Incidents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/multas"
          element={
            <AdminRoute>
              <Fines />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/edificios"
          element={
            <AdminRoute>
              <Buildings />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/residentes"
          element={
            <AdminRoute>
              <Residents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reservas"
          element={
            <AdminRoute>
              <AdminReservations />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/asambleas"
          element={
            <AdminRoute>
              <AdminAssemblies />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/documentos"
          element={
            <AdminRoute>
              <AdminDocuments />
            </AdminRoute>
          }
        />

        {/* Residente */}
        <Route
          path="/residente/anuncios"
          element={
            <ResidenteRoute>
              <ResidentAnnouncements />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/mi-cuenta"
          element={
            <ResidenteRoute>
              <MyAccount />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/dashboard"
          element={
            <ResidenteRoute>
              <ResidentDashboard />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/pagar"
          element={
            <ResidenteRoute>
              <ReportPayment />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/mantenimiento"
          element={
            <ResidenteRoute>
              <ResidentMaintenance />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/incidencias"
          element={
            <ResidenteRoute>
              <ResidentIncidents />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/multas"
          element={
            <ResidenteRoute>
              <ResidentFines />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/reservas"
          element={
            <ResidenteRoute>
              <ResidentReservations />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/asambleas"
          element={
            <ResidenteRoute>
              <ResidentAssemblies />
            </ResidenteRoute>
          }
        />
        <Route
          path="/residente/documentos"
          element={
            <ResidenteRoute>
              <ResidentDocuments />
            </ResidenteRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
