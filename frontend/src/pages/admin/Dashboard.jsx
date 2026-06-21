import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

function StatCard({ emoji, label, value, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl text-2xl ${colors[color]}`}>{emoji}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { usuario } = useAuth();
  const [stats, setStats] = useState(null);
  const [pagosRecientes, setPagosRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagos, mant, res, inc] = await Promise.allSettled([
          api.get("/pagos/pendientes"),
          api.get("/mantenimiento?estado=pendiente"),
          api.get("/reservas?estado=pendiente"),
          api.get("/incidencias?estado=pendiente"),
        ]);

        const pagosPendientes =
          pagos.status === "fulfilled" ? pagos.value.data : [];
        const mantPendientes =
          mant.status === "fulfilled" ? mant.value.data : [];
        const resPendientes = res.status === "fulfilled" ? res.value.data : [];
        const incPendientes = inc.status === "fulfilled" ? inc.value.data : [];

        setStats({
          pagosPendientes: pagosPendientes.length,
          mantPendientes: mantPendientes.length,
          resPendientes: resPendientes.length,
          incPendientes: incPendientes.length,
        });

        setPagosRecientes(pagosPendientes.slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  if (cargando)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  const mesesNombre = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-sm text-gray-500">
          Bienvenido, {usuario?.nombre} • {mesesNombre[mes - 1]} {anio}
        </p>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          emoji="🧾"
          label="Pagos por verificar"
          value={stats.pagosPendientes}
          color="yellow"
        />
        <StatCard
          emoji="🔧"
          label="Mantenimiento pendiente"
          value={stats.mantPendientes}
          color="blue"
        />
        <StatCard
          emoji="📅"
          label="Reservas por aprobar"
          value={stats.resPendientes}
          color="purple"
        />
        <StatCard
          emoji="⚠️"
          label="Incidencias abiertas"
          value={stats.incPendientes}
          color="red"
        />
      </div>

      {/* Pagos recientes pendientes */}
      {pagosRecientes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Comprobantes recientes por verificar
          </h2>
          <div className="space-y-3">
            {pagosRecientes.map((pago) => (
              <div
                key={pago._id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {pago.residenteId?.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pago.cuotaId?.descripcion} • Apto{" "}
                    {pago.apartamentoId?.numero}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    RD${pago.monto?.toLocaleString()}
                  </p>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                    Pendiente
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pagosRecientes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-medium">Todo al día</p>
          <p className="text-sm">
            No hay comprobantes pendientes por verificar
          </p>
        </div>
      )}
    </div>
  );
}
