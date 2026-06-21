import { useState, useEffect } from "react";
import api from "../api/axios";

export default function AlertBanner() {
  const [emergencias, setEmergencias] = useState([]);
  const [cerradas, setCerradas] = useState(new Set());

  useEffect(() => {
    api
      .get("/anuncios/emergencias")
      .then(({ data }) => setEmergencias(data))
      .catch(() => {});
  }, []);

  const activas = emergencias.filter((e) => !cerradas.has(e._id));

  if (activas.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {activas.map((emergencia) => (
        <div
          key={emergencia._id}
          className="bg-red-600 text-white px-4 py-3 flex items-start gap-3"
        >
          <span className="text-lg flex-shrink-0">🚨</span>
          <div className="flex-1">
            <span className="font-semibold">{emergencia.titulo}: </span>
            <span className="text-red-100">{emergencia.contenido}</span>
          </div>
          <button
            onClick={() =>
              setCerradas((prev) => new Set([...prev, emergencia._id]))
            }
            className="flex-shrink-0 text-red-200 hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
