import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const categoriaLabel = {
  electricidad: "Electricidad",
  plomeria: "Plomería",
  limpieza: "Limpieza",
  materiales: "Materiales",
  jardineria: "Jardinería",
  seguridad: "Seguridad",
  otro: "Otro",
};

const categoriaColor = {
  electricidad: "bg-yellow-100 text-yellow-700",
  plomeria: "bg-blue-100 text-blue-700",
  limpieza: "bg-green-100 text-green-700",
  materiales: "bg-orange-100 text-orange-700",
  jardineria: "bg-emerald-100 text-emerald-700",
  seguridad: "bg-red-100 text-red-700",
  otro: "bg-gray-100 text-gray-600",
};

export default function Accounting() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [loading, setLoading] = useState(false);
  const [resumenCuota, setResumenCuota] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [totalGastos, setTotalGastos] = useState(0);
  const [resumenGastos, setResumenGastos] = useState([]);
  const [vista, setVista] = useState("resumen");

  const cargar = async () => {
    try {
      setLoading(true);
      setResumenCuota(null);
      setGastos([]);
      setTotalGastos(0);
      setResumenGastos([]);

      const [cuotaRes, gastosRes, resumenGastosRes] = await Promise.allSettled([
        api.get(`/cuotas/resumen/${mes}/${anio}`),
        api.get(`/gastos?mes=${mes}&anio=${anio}`),
        api.get(`/gastos/resumen?mes=${mes}&anio=${anio}`),
      ]);

      if (cuotaRes.status === "fulfilled") setResumenCuota(cuotaRes.value.data);
      if (gastosRes.status === "fulfilled") {
        setGastos(gastosRes.value.data.gastos || []);
        setTotalGastos(gastosRes.value.data.totalGastos || 0);
      }
      if (resumenGastosRes.status === "fulfilled") {
        setResumenGastos(resumenGastosRes.value.data.resumen || []);
      }
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [mes, anio]);

  const totalIngresos = resumenCuota?.totalRecaudado || 0;
  const balance = totalIngresos - totalGastos;

  const formatFecha = (fecha) => {
    try {
      return format(new Date(fecha), "dd MMM yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  const imprimirReporte = () => {
    window.print();
  };

  // Años disponibles (desde 2024 hasta año actual + 1)
  const anios = [];
  for (let y = 2024; y <= hoy.getFullYear() + 1; y++) anios.push(y);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contabilidad</h1>
          <p className="text-sm text-gray-500">Balance de ingresos y gastos</p>
        </div>
        <button
          onClick={imprimirReporte}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors"
        >
          🖨️ Imprimir
        </button>
      </div>

      {/* Selector mes/año */}
      <div className="flex gap-3">
        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MESES.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {anios.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Cards resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                Ingresos
              </p>
              <p className="text-2xl font-bold text-green-700">
                RD$ {totalIngresos.toLocaleString()}
              </p>
              {resumenCuota && (
                <p className="text-xs text-green-600 mt-1">
                  {resumenCuota.totalPagaron} de{" "}
                  {resumenCuota.totalApartamentos} apartamentos pagaron
                </p>
              )}
              {!resumenCuota && (
                <p className="text-xs text-green-600 mt-1">
                  Sin cuota este mes
                </p>
              )}
            </div>

            <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-4">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                Gastos
              </p>
              <p className="text-2xl font-bold text-red-700">
                RD$ {totalGastos.toLocaleString()}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {gastos.length} gasto(s) registrado(s)
              </p>
            </div>

            <div
              className={`rounded-xl border shadow-sm p-4 ${
                balance >= 0
                  ? "bg-blue-50 border-blue-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
                  balance >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              >
                Balance
              </p>
              <p
                className={`text-2xl font-bold ${
                  balance >= 0 ? "text-blue-700" : "text-orange-700"
                }`}
              >
                RD$ {Math.abs(balance).toLocaleString()}
              </p>
              <p
                className={`text-xs mt-1 ${
                  balance >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              >
                {balance >= 0 ? "✅ Superávit" : "⚠️ Déficit"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: "resumen", label: "Resumen" },
              { key: "ingresos", label: "Ingresos" },
              { key: "gastos", label: "Gastos" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setVista(t.key)}
                className={
                  vista === t.key
                    ? "bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium"
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Vista Resumen */}
          {vista === "resumen" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h2 className="font-semibold text-gray-900 mb-3">
                  {MESES[mes - 1]} {anio} — Resumen financiero
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                    <span className="text-gray-600">
                      Total ingresos por cuotas
                    </span>
                    <span className="font-semibold text-green-700">
                      + RD$ {totalIngresos.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-gray-50">
                    <span className="text-gray-600">
                      Total gastos operativos
                    </span>
                    <span className="font-semibold text-red-700">
                      - RD$ {totalGastos.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm py-2 font-bold">
                    <span className="text-gray-900">Balance neto</span>
                    <span
                      className={
                        balance >= 0 ? "text-blue-700" : "text-orange-700"
                      }
                    >
                      RD$ {balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gastos por categoría */}
              {resumenGastos.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h2 className="font-semibold text-gray-900 mb-3">
                    Gastos por categoría
                  </h2>
                  <div className="space-y-2">
                    {resumenGastos.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoriaColor[r._id] || "bg-gray-100 text-gray-600"}`}
                          >
                            {categoriaLabel[r._id] || r._id}
                          </span>
                          <span className="text-xs text-gray-400">
                            {r.cantidad} gasto(s)
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          RD$ {r.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vista Ingresos */}
          {vista === "ingresos" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3">
                Ingresos — {MESES[mes - 1]} {anio}
              </h2>
              {!resumenCuota ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-3xl mb-2">💰</p>
                  <p className="text-sm">
                    No hay cuota registrada para este mes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {resumenCuota.totalApartamentos}
                      </p>
                      <p className="text-xs text-gray-500">Total aptos</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-green-700">
                        {resumenCuota.totalPagaron}
                      </p>
                      <p className="text-xs text-green-600">Pagaron</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-red-700">
                        {resumenCuota.totalMorosos}
                      </p>
                      <p className="text-xs text-red-600">Morosos</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-blue-700">
                        RD$ {resumenCuota.cuota?.monto?.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600">Monto cuota</p>
                    </div>
                  </div>

                  {resumenCuota.pagos?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Pagos aprobados:
                      </p>
                      {resumenCuota.pagos.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between py-2 border-b border-gray-50 text-sm"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {p.residenteId?.nombre || "—"}
                            </p>
                            <p className="text-xs text-gray-400">
                              Apto {p.apartamentoId?.numero}
                            </p>
                          </div>
                          <span className="font-semibold text-green-700">
                            RD$ {p.monto?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vista Gastos */}
          {vista === "gastos" && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3">
                Gastos — {MESES[mes - 1]} {anio}
              </h2>
              {gastos.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p className="text-3xl mb-2">📉</p>
                  <p className="text-sm">No hay gastos registrados este mes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {gastos.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between py-2 border-b border-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {g.descripcion}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoriaColor[g.categoria] || "bg-gray-100 text-gray-600"}`}
                          >
                            {categoriaLabel[g.categoria] || g.categoria}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatFecha(g.fecha || g.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-red-700 text-sm">
                          RD$ {g.monto?.toLocaleString()}
                        </span>
                        {g.factura && (
                          <a
                            href={g.factura}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            📄
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold text-sm">
                    <span className="text-gray-900">Total gastos</span>
                    <span className="text-red-700">
                      RD$ {totalGastos.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
