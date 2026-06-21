import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function ResidentDashboard() {
  const { usuario } = useAuth();
  const [resumen, setResumen] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.get("/pagos/mispagos"), api.get("/anuncios")])
      .then(([pagos, anunciosRes]) => {
        if (pagos.status === "fulfilled") setResumen(pagos.value.data.resumen);
        if (anunciosRes.status === "fulfilled")
          setAnuncios(anunciosRes.value.data.slice(0, 3));
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const esMoroso = resumen?.esMoroso;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hola, {usuario?.nombre} 👋
        </h1>
        <p className="text-sm text-gray-500">
          Bienvenido al sistema de gestión
        </p>
      </div>

      <div
        className={`rounded-xl p-5 border ${esMoroso ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
      >
        <p
          className={`font-bold text-lg ${esMoroso ? "text-red-700" : "text-green-700"}`}
        >
          {esMoroso
            ? "🔴 Cuenta con deuda pendiente"
            : "✅ Al día con sus pagos"}
        </p>
        {esMoroso && resumen && (
          <div className="mt-2 space-y-1">
            {resumen.mesesDeuda > 0 && (
              <p className="text-sm text-red-600">
                • {resumen.mesesDeuda} mes(es) sin pagar
              </p>
            )}
            {resumen.multasPendientes > 0 && (
              <p className="text-sm text-red-600">
                • {resumen.multasPendientes} multa(s) pendiente(s)
              </p>
            )}
            <p className="text-xs text-red-500">
              ⚠️ No puedes hacer reservas hasta estar al día
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/residente/pagar"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">💳</span>
          <span className="text-sm font-medium text-gray-700">
            Reportar pago
          </span>
        </a>
        <a
          href="/residente/mantenimiento"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">🔧</span>
          <span className="text-sm font-medium text-gray-700">
            Mantenimiento
          </span>
        </a>
        <a
          href="/residente/reservas"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium text-gray-700">
            Hacer reserva
          </span>
        </a>
        <a
          href="/residente/documentos"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📁</span>
          <span className="text-sm font-medium text-gray-700">Documentos</span>
        </a>
      </div>

      {anuncios.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            📢 Anuncios recientes
          </h2>
          <div className="space-y-3">
            {anuncios.map((anuncio) => (
              <div
                key={anuncio._id}
                className={`p-3 rounded-lg border-l-4 ${anuncio.tipo === "emergencia" ? "bg-red-50 border-red-500" : "bg-blue-50 border-blue-400"}`}
              >
                <p className="text-sm font-semibold text-gray-800">
                  {anuncio.titulo}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {anuncio.contenido}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {anuncios.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No hay anuncios recientes</p>
        </div>
      )}
    </div>
  );
}
