import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const MESES = [
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

export default function ResidentDashboard() {
  const { usuario } = useAuth();
  const [moroso, setMoroso] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const apartamentoId = usuario?.apartamentoId?._id || usuario?.apartamentoId;
    if (!apartamentoId) {
      setCargando(false);
      return;
    }

    Promise.allSettled([
      api.get(`/pagos/moroso/${apartamentoId}`),
      api.get("/anuncios"),
    ])
      .then(([morosoRes, anunciosRes]) => {
        if (morosoRes.status === "fulfilled") setMoroso(morosoRes.value.data);
        if (anunciosRes.status === "fulfilled")
          setAnuncios(anunciosRes.value.data.slice(0, 3));
      })
      .finally(() => setCargando(false));
  }, [usuario]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const esMoroso = moroso?.esMoroso;
  const totalDeuda = moroso?.detalle?.reduce((sum, d) => sum + d.monto, 0) || 0;

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

      {/* Estado de cuenta */}
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

        {esMoroso && moroso && (
          <div className="mt-3 space-y-2">
            {/* Detalle de meses que debe */}
            {moroso.detalle?.length > 0 && (
              <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                  Meses pendientes:
                </p>
                {moroso.detalle.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-red-700">
                      📅 {MESES[d.mes - 1]} {d.anio}
                    </span>
                    <span className="font-semibold text-red-700">
                      RD$ {d.monto?.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t border-red-200 pt-1.5 mt-1.5">
                  <span className="font-bold text-red-800">Total adeudado</span>
                  <span className="font-bold text-red-800">
                    RD$ {totalDeuda.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {moroso.multasPendientes > 0 && (
              <p className="text-sm text-red-600">
                🚫 {moroso.multasPendientes} multa(s) pendiente(s)
              </p>
            )}
            <p className="text-xs text-red-500">
              ⚠️ No puedes hacer reservas hasta estar al día
            </p>
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/residente/pagar"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">💳</span>
          <span className="text-sm font-medium text-gray-700">
            Reportar pago
          </span>
        </Link>
        <Link
          to="/residente/mantenimiento"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">🔧</span>
          <span className="text-sm font-medium text-gray-700">
            Mantenimiento
          </span>
        </Link>
        <Link
          to="/residente/reservas"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📅</span>
          <span className="text-sm font-medium text-gray-700">
            Hacer reserva
          </span>
        </Link>
        <Link
          to="/residente/documentos"
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <span className="text-2xl">📁</span>
          <span className="text-sm font-medium text-gray-700">Documentos</span>
        </Link>
      </div>

      {/* Anuncios recientes */}
      {anuncios.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            📢 Anuncios recientes
          </h2>
          <div className="space-y-3">
            {anuncios.map((anuncio) => (
              <div
                key={anuncio._id}
                className={`p-3 rounded-lg border-l-4 ${
                  anuncio.tipo === "emergencia"
                    ? "bg-red-50 border-red-500"
                    : "bg-blue-50 border-blue-400"
                }`}
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
