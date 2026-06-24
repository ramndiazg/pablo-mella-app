import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../context/AuthContext";

const badgeClass = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aprobado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
};

export default function MyAccount() {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPassword, setModalPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formPassword, setFormPassword] = useState({
    passwordActual: "",
    passwordNuevo: "",
    confirmar: "",
  });

  const cargar = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/pagos/mispagos");
      setDatos(data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

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

  const formatFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd MMM yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-sm text-gray-500">
            Historial de pagos y configuración
          </p>
        </div>
        <button
          onClick={() => setModalPassword(true)}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
        >
          🔒 Cambiar contraseña
        </button>
      </div>

      {/* Info usuario */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{usuario?.nombre}</p>
            <p className="text-sm text-gray-500">{usuario?.email}</p>
            {usuario?.telefono && (
              <p className="text-sm text-gray-500">📞 {usuario.telefono}</p>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Estado de cuenta */}
          {datos?.resumen && (
            <div
              className={`rounded-xl border shadow-sm p-4 ${
                datos.resumen.esMoroso
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {datos.resumen.esMoroso ? "🔴" : "✅"}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">
                    {datos.resumen.esMoroso
                      ? "Cuenta en mora"
                      : "Cuenta al día"}
                  </p>
                  {datos.resumen.esMoroso && (
                    <p className="text-sm text-red-600">
                      {datos.resumen.mesesDeuda} mes(es) de deuda
                      {datos.resumen.multasPendientes > 0 &&
                        ` · ${datos.resumen.multasPendientes} multa(s) pendiente(s)`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Historial de pagos */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">
              Historial de pagos
            </h2>
            {datos?.pagos?.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
                <p className="text-3xl mb-2">🧾</p>
                <p className="text-sm">No tienes pagos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {datos?.pagos?.map((p) => (
                  <div
                    key={p._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {p.cuotaId?.tipo === "mensual"
                            ? "Cuota mensual"
                            : "Cuota extraordinaria"}
                          {p.cuotaId?.mes &&
                            ` · ${p.cuotaId.mes}/${p.cuotaId.anio}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          📅 {formatFecha(p.createdAt)} · RD${" "}
                          {p.monto?.toLocaleString()}
                        </p>
                        {p.motivoRechazo && (
                          <p className="text-sm text-red-600 mt-0.5">
                            Motivo: {p.motivoRechazo}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass[p.estado]}`}
                        >
                          {p.estado}
                        </span>
                        {p.comprobante && (
                          <a
                            href={p.comprobante}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Ver comprobante
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
