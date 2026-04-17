// src/hooks/useEstilosInicio.ts
import { useEffect, useState } from "react";
import api from "../services/api";
import { type EstiloData } from "../types/EstiloInterface";

export function useEstilosInicio() {
  const [estilos, setEstilos] = useState<EstiloData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarEstilos = async () => {
      try {
        const res = await api.get('/estilos');
        const data: EstiloData[] = Array.isArray(res.data) ? res.data : (res.data['hydra:member'] || []);
        setEstilos(data);
      } catch (error) {
        console.error("Error al cargar estilos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstilos();
  }, []);

  return {
    estiloPrincipal: estilos.length > 0 ? estilos[0] : null,
    estilosSolicitados: estilos.slice(1, 4),
    loading
  };
}