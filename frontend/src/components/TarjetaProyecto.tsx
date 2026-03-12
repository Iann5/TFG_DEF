// src/components/TarjetaProyecto.tsx
import { Heart, Star } from 'lucide-react';
import { type NavigateFunction } from 'react-router-dom';
import { type ProyectoNormalizado } from '../types/proyecto';

interface TarjetaProps {
  proyecto: ProyectoNormalizado;
  esFavorito: boolean;
  onToggleFav: (id: number) => void;
  puedeEditar: boolean | null;
  navigate: NavigateFunction;
  onEliminar: (id: number) => void;
  isTop?: boolean;
}

export default function TarjetaProyecto({
  proyecto, esFavorito, onToggleFav, puedeEditar, navigate, onEliminar, isTop = false
}: TarjetaProps) {

  const esPlantilla = proyecto.tipo.toLowerCase().includes('plantilla');

  return (
    <div className={`bg-[#323444] border ${isTop ? 'border-yellow-500/50 shadow-yellow-900/20' : 'border-[#3B82F6]/30 shadow-sky-900/20'} rounded-2xl overflow-hidden shadow-2xl flex flex-col group hover:border-sky-500 transition-all duration-300 relative`}>

      {isTop && (
        <div className="absolute top-4 left-4 z-20 bg-yellow-500 text-black text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-lg">
          Top del Mes
        </div>
      )}

      {esPlantilla && (
        <button
          onClick={() => onToggleFav(proyecto.id)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all"
        >
          <Heart size={20} className={`${esFavorito ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      )}

      <div className="h-52 bg-white overflow-hidden relative">
        {proyecto.imagen ? (
          <img src={proyecto.imagen} alt={proyecto.titulo} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 opacity-90" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 font-black text-4xl">IMG</div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-xl leading-tight group-hover:text-sky-400 transition-colors">{proyecto.titulo}</h3>
          <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
            <Star size={14} className={proyecto.media > 0 ? "fill-yellow-500 text-yellow-500" : "text-gray-500"} />
            <span className="text-xs font-bold text-white/80">{proyecto.media > 0 ? proyecto.media.toFixed(1) : 'Nuevo'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="bg-sky-900/50 text-sky-300 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded">{proyecto.tipo}</span>
          <span className="text-white/40 text-xs font-medium truncate">Artista: {proyecto.nombreTrabajador}</span>
        </div>

        {/* <p className="text-white/60 text-sm line-clamp-2 mb-4 font-light">{proyecto.descripcion}</p> */}

        {/* Precio */}
        <div className="flex items-center gap-2 mb-4">
          {proyecto.precioOferta != null ? (
            <>
              <span className="text-white/40 line-through text-sm">{proyecto.precioOriginal.toFixed(2)} €</span>
              <span className="text-green-400 font-bold">{proyecto.precioOferta.toFixed(2)} €</span>
              <span className="bg-green-900/40 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">OFERTA</span>
            </>
          ) : (
            <span className="text-white font-bold">{proyecto.precioOriginal.toFixed(2)} €</span>
          )}
        </div>

        <div className="mt-auto">
          {/* Botón Reservar cita */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering card click if there's any
              navigate('/cita');
            }}
            className="w-full py-2 mb-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            📅 Reservar cita
          </button>

          {/* Botón Ver detalles — siempre visible */}
          <button
            onClick={() => navigate(`/proyecto/${proyecto.id}`)}
            className="w-full py-2 mb-3 bg-sky-700/60 hover:bg-sky-600 text-white text-sm font-bold rounded-xl transition"
          >
            🔍 Ver detalles
          </button>
          {puedeEditar && !isTop && (
            <div className="flex gap-2 pt-4 border-t border-white/10 mt-2">
              <button
                onClick={() => navigate(`/editarProyecto/${proyecto.id}`)}
                className="flex-1 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => onEliminar(proyecto.id)}
                className="flex-1 py-1.5 bg-red-700/80 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition"
              >
                🗑 Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}