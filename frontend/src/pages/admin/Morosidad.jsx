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
  const [, setEdificios] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState("todos");

  const cargar = async () => {
    try {
      setLoading(true);
      const { data: edifs } = await api.get("/edificios");
      setEdificios(edifs);

      // Para cada edificio obtener sus apartamentos y verificar morosidad
      const todos = [];
      for (const edif of edifs) {
        const { data } = await api.get(`/edificios/${edif._id}`);
        for (const apt of data.apartamentos || []) {
          if (!apt.residenteActualId) continue; // sin residente
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
          <p className="text-xs text-gray-500 mt-0.5">Total apartamentos</p>
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
            💰 Total adeudado por morosos:{" "}
            <span className="font-bold text-lg">
              RD$ {totalDeuda.toLocaleString()}
            </span>
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Encabezado tabla */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-1">Apto</div>
            <div className="col-span-2">Edificio</div>
            <div className="col-span-3">Residente</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2">Meses que debe</div>
            <div className="col-span-2 text-right">Total deuda</div>
          </div>

          {/* Filas */}
          {filtrados.map((r, i) => {
            const deudaTotal = r.detalle?.reduce((s, d) => s + d.monto, 0) || 0;
            return (
              <div
                key={i}
                className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 text-sm items-start ${
                  r.esMoroso ? "bg-red-50/30" : ""
                }`}
              >
                <div className="col-span-1 font-medium text-gray-900">
                  {r.apartamento.numero}
                </div>
                <div className="col-span-2 text-gray-600">
                  {r.edificio.nombre || `Edif. ${r.edificio.numero}`}
                </div>
                <div className="col-span-3 text-gray-700">
                  <p className="truncate">{r.residente?.nombre || "—"}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {r.residente?.email || ""}
                  </p>
                </div>
                <div className="col-span-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      r.esMoroso
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {r.esMoroso ? "Moroso" : "Al día"}
                  </span>
                  {r.multasPendientes > 0 && (
                    <p className="text-xs text-orange-600 mt-0.5">
                      {r.multasPendientes} multa(s)
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  {r.detalle?.length > 0 ? (
                    <div className="space-y-0.5">
                      {r.detalle.map((d, j) => (
                        <p key={j} className="text-xs text-red-600">
                          {MESES[d.mes - 1]} {d.anio}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  {deudaTotal > 0 ? (
                    <span className="font-semibold text-red-700">
                      RD$ {deudaTotal.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
