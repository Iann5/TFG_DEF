// src/components/ListaProyectos.tsx
import { type NavigateFunction } from 'react-router-dom';
import TarjetaProyecto from './TarjetaProyecto';
import { type ProyectoNormalizado } from '../types/proyecto';

interface ListaProps {
  proyectos: ProyectoNormalizado[];
  favoritos: number[];
  onToggleFav: (id: number) => void;
  puedeEditar: boolean | null;
  navigate: NavigateFunction;
  onEliminar: (id: number) => void;
}

export default function ListaProyecto({ proyectos, favoritos, onToggleFav, puedeEditar, navigate, onEliminar }: ListaProps) {
  if (proyectos.length === 0) {
    return <div className="text-gray-500 text-center text-xl py-10">No se encontraron proyectos con estos filtros.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {proyectos.map(p => (
        <TarjetaProyecto 
          key={p.id} 
          proyecto={p} 
          esFavorito={favoritos.includes(p.id)}
          onToggleFav={onToggleFav}
          puedeEditar={puedeEditar}
          navigate={navigate}
          onEliminar={onEliminar}
        />
      ))}
    </div>
  );
}