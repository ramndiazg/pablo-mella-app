import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function AdminMyAccount() {
  const { usuario } = useAuth();
  const [modalPassword, setModalPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formPassword, setFormPassword] = useState({
    passwordActual: "",
    passwordNuevo: "",
    confirmar: "",
  });

  const cambiarPassword = async () => {
    const { passwordActual, passwordNuevo, confirmar } = formPassword;
    if (!passwordActual || !passwordNuevo || !confirmar) {
      toast.error("Completa todos los campos");
      return;
    }
    if (passwordNuevo !== confirmar) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordNuevo.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      setSubmitting(true);
      await api.put("/auth/cambiar-password", {
        passwordActual,
        passwordNuevo,
      });
      toast.success("Contraseña actualizada correctamente");
      setModalPassword(false);
      setFormPassword({ passwordActual: "", passwordNuevo: "", confirmar: "" });
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error al cambiar contraseña");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mi Cuenta</h1>
        <p className="text-sm text-gray-500">Información y configuración</p>
      </div>

      {/* Info usuario */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{usuario?.nombre}</p>
            <p className="text-sm text-gray-500">{usuario?.email}</p>
            {usuario?.telefono && (
              <p className="text-sm text-gray-500">📞 {usuario.telefono}</p>
            )}
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                Administrador
              </span>
              {usuario?.esDirectiva && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  {usuario.cargoDirectiva || "Directiva"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Contraseña</p>
            <p className="text-sm text-gray-500">
              Actualiza tu contraseña de acceso
            </p>
          </div>
          <button
            onClick={() => setModalPassword(true)}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
          >
            🔒 Cambiar
          </button>
        </div>
      </div>

      {/* Modal cambiar contraseña */}
      {modalPassword && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Cambiar Contraseña
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña actual *
                </label>
                <input
                  type="password"
                  value={formPassword.passwordActual}
                  onChange={(e) =>
                    setFormPassword({
                      ...formPassword,
                      passwordActual: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña *
                </label>
                <input
                  type="password"
                  value={formPassword.passwordNuevo}
                  onChange={(e) =>
                    setFormPassword({
                      ...formPassword,
                      passwordNuevo: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar nueva contraseña *
                </label>
                <input
                  type="password"
                  value={formPassword.confirmar}
                  onChange={(e) =>
                    setFormPassword({
                      ...formPassword,
                      confirmar: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => {
                  setModalPassword(false);
                  setFormPassword({
                    passwordActual: "",
                    passwordNuevo: "",
                    confirmar: "",
                  });
                }}
                disabled={submitting}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={cambiarPassword}
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
