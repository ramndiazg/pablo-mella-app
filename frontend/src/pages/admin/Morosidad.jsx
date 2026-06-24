import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

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

export default function Morosidad() {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");

  const cargar = async () => {
    try {
      setLoading(true);
      const { data: edifs } = await api.get("/edificios");
      const todos = [];
      for (const edif of edifs) {
        const { data } = await api.get(`/edificios/${edif._id}`);
        for (const apt of data.apartamentos || []) {
          if (!apt.residenteActualId) continue;
          try {
            const { data: moroso } = await api.get(`/pagos/moroso/${apt._id}`);
            todos.push({
              apartamento: apt,
              edificio: edif,
              residente: apt.residenteActualId,
              ...moroso,
            });
          } catch {
            // ignorar errores individuales
          }
        }
      }
      setResultados(todos);
    } catch {
      toast.error("Error al cargar datos de morosidad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = resultados.filter((r) => {
    if (filtro === "morosos") return r.esMoroso;
    if (filtro === "aldia") return !r.esMoroso;
    return true;
  });

  const totalMorosos = resultados.filter((r) => r.esMoroso).length;
  const totalAlDia = resultados.filter((r) => !r.esMoroso).length;
  const totalDeuda = resultados
    .filter((r) => r.esMoroso)
    .reduce(
      (sum, r) => sum + (r.detalle?.reduce((s, d) => s + d.monto, 0) || 0),
      0,
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Panel de Morosidad
          </h1>
          <p className="text-sm text-gray-500">
            Estado de cuenta de todos los apartamentos
          </p>
        </div>
        <button
          onClick={cargar}
          disabled={loading}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "🔄 Actualizar"}
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {resultados.length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{totalMorosos}</p>
          <p className="text-xs text-red-500 mt-0.5">Morosos</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{totalAlDia}</p>
          <p className="text-xs text-green-500 mt-0.5">Al día</p>
        </div>
      </div>

      {/* Total deuda */}
      {totalDeuda > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            💰 Total adeudado:{" "}
            <span className="font-bold text-lg">
              RD$ {totalDeuda.toLocaleString()}
            </span>
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "todos", label: "Todos" },
          { key: "morosos", label: `Morosos (${totalMorosos})` },
          { key: "aldia", label: `Al día (${totalAlDia})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={
              filtro === f.key
                ? "bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-full text-sm font-medium"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-sm">No hay resultados para este filtro</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((r, i) => {
            const deudaTotal = r.detalle?.reduce((s, d) => s + d.monto, 0) || 0;
            return (
              <div
                key={i}
                className={`bg-white rounded-xl border shadow-sm p-4 ${
                  r.esMoroso ? "border-red-200 bg-red-50/30" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        Apto {r.apartamento.numero}
                      </span>
                      <span className="text-xs text-gray-500">
                        {r.edificio.nombre || `Edif. ${r.edificio.numero}`}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.esMoroso
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {r.esMoroso ? "Moroso" : "Al día"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {r.residente?.nombre || "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {r.residente?.email || ""}
                    </p>
                    {r.multasPendientes > 0 && (
                      <p className="text-xs text-orange-600 mt-0.5">
                        🚫 {r.multasPendientes} multa(s) pendiente(s)
                      </p>
                    )}
                  </div>
                  {deudaTotal > 0 && (
                    <div className="text-right shrink-0">
                      <p className="font-bold text-red-700">
                        RD$ {deudaTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">total deuda</p>
                    </div>
                  )}
                </div>
                {r.detalle?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    {r.detalle.map((d, j) => (
                      <span
                        key={j}
                        className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                      >
                        {MESES[d.mes - 1]} {d.anio}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
