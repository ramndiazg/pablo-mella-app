import { useState, useEffect } from "react";
import api from "../api/axios";

export default function CascadeSelect({ onSelect, soloDisponibles = false }) {
  const [edificios, setEdificios] = useState([]);
  const [apartamentos, setApartamentos] = useState([]);
  const [edificioId, setEdificioId] = useState("");
  const [apartamentoId, setApartamentoId] = useState("");
  const [cargandoApts, setCargandoApts] = useState(false);

  useEffect(() => {
    api
      .get("/edificios")
      .then(({ data }) => setEdificios(data))
      .catch(() => {});
  }, []);

  const handleEdificio = async (id) => {
    setEdificioId(id);
    setApartamentoId("");
    setApartamentos([]);
    onSelect({ edificioId: id, apartamentoId: "" });
    if (!id) return;

    setCargandoApts(true);
    try {
      const url = soloDisponibles
        ? "/apartamentos/disponibles"
        : "/apartamentos/edificio/" + id;
      const { data } = await api.get(url);
      setApartamentos(data);
    } catch {
      setApartamentos([]);
    } finally {
      setCargandoApts(false);
    }
  };

  const handleApartamento = (id) => {
    setApartamentoId(id);
    onSelect({ edificioId, apartamentoId: id });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Edificio
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={edificioId}
          onChange={(e) => handleEdificio(e.target.value)}
        >
          <option value="">Seleccionar...</option>
          {edificios.map((e) => (
            <option key={e._id} value={e._id}>
              {e.nombre || "Edificio " + e.numero}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apartamento
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={apartamentoId}
          onChange={(e) => handleApartamento(e.target.value)}
          disabled={!edificioId || cargandoApts}
        >
          <option value="">
            {cargandoApts ? "Cargando..." : "Seleccionar..."}
          </option>
          {apartamentos.map((a) => (
            <option key={a._id} value={a._id}>
              Apto {a.numero} — Nivel {a.piso}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
