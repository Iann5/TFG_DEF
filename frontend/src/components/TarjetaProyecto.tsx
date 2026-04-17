// src/components/TarjetaProyecto.tsx
import { Heart, Star } from 'lucide-react';
import { type NavigateFunction } from 'react-router-dom';
import { type ProyectoNormalizado } from '../types/proyecto';
import { useAuth } from '../context/AuthContext';

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

  const { isLoggedIn, hasRole } = useAuth();
  const isTrabajadorOrAdmin = hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN');

  const esPlantilla = proyecto.tipo.toLowerCase().includes('plantilla');

  return (
    <div className={`glass-panel flex flex-col group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden h-full ${isTop ? 'border-primary ring-1 ring-primary/50' : 'border-outline-variant/30'}`}>

      {/* Decorative Texture Overlay */}
      <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none mix-blend-overlay"></div>

      {isTop && (
        <div className="absolute top-0 right-0 z-20 bg-primary text-on-primary text-[10px] uppercase font-label tracking-widest px-3 py-1 font-bold">
          TOP DEL MES
        </div>
      )}

      {esPlantilla && isLoggedIn && (
        <button
          onClick={() => onToggleFav(proyecto.id)}
          className="absolute top-3 right-3 z-20 p-2 bg-surface-container-highest/80 backdrop-blur-md border border-outline-variant/30 rounded-full hover:bg-surface-container hover:scale-110 transition-all duration-300"
        >
          <Heart size={18} strokeWidth={2} className={`${esFavorito ? 'fill-error text-error' : 'text-outline hover:text-on-surface'}`} />
        </button>
      )}

      <div className="h-[280px] bg-surface-container-highest border-b border-outline-variant/20 overflow-hidden relative p-6 flex items-center justify-center cursor-pointer" onClick={() => navigate(`/proyecto/${proyecto.id}`)}>
        {/* Subtle inner gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
        
        {proyecto.imagen ? (
          <img src={proyecto.imagen} alt={proyecto.titulo} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 opacity-90 filter grayscale group-hover:grayscale-0 relative z-0" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline-variant border border-outline-variant/20 bg-surface-container relative">
             <div className="absolute inset-0 bg-halftone opacity-30"></div>
             <span className="material-symbols-outlined text-4xl relative z-10">image</span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-surface-container/50 to-surface-container">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 
            className="text-on-surface font-headline text-2xl font-bold uppercase tracking-wide group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
            onClick={() => navigate(`/proyecto/${proyecto.id}`)}
          >
            {proyecto.titulo}
          </h3>
          <div className="flex items-center gap-1 bg-surface-container-highest px-2 py-1 border border-outline-variant/30 rounded-sm shrink-0">
            <Star size={14} strokeWidth={2} className={proyecto.media > 0 ? "fill-primary text-primary" : "text-outline"} />
            <span className="text-xs font-label font-bold tracking-widest text-on-surface-variant">{proyecto.media > 0 ? proyecto.media.toFixed(1) : 'NEW'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary border border-primary/30 px-2 py-0.5 rounded-sm bg-primary/5">{proyecto.tipo}</span>
          <div className="flex items-center gap-1.5 opacity-80">
             <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
             <span className="text-on-surface-variant font-body text-xs uppercase tracking-wider">Artista: <span className="text-on-surface font-semibold">{proyecto.nombreTrabajador}</span></span>
          </div>
        </div>

        {/* Precio */}
        <div className="flex justify-start items-center gap-3 mb-8 pb-4 border-b border-outline-variant/20">
          {proyecto.precioOferta != null ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-3">
              <span className="text-error font-headline text-lg line-through opacity-70">{proyecto.precioOriginal.toFixed(2)} €</span>
              <span className="text-primary font-headline text-3xl font-bold">{proyecto.precioOferta.toFixed(2)} €</span>
              <span className="bg-error/10 text-error font-label text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-error/20 rounded-sm self-center mb-1">Oferta</span>
              </div>

              {/* Descripción — sutil */}
              {proyecto.descripcion && (
                <p className="text-xs text-white/50 leading-relaxed">
                  {proyecto.descripcion}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-on-surface font-headline text-2xl font-bold">{proyecto.precioOriginal.toFixed(2)} €</span>
              {proyecto.descripcion && (
                <p className="text-xs text-white/50 leading-relaxed">
                  {proyecto.descripcion}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          {/* Botón Reservar cita */}
          {!isTrabajadorOrAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/cita');
              }}
              className="w-full primary-gradient-cta"
            >
              <div className="cta-content">
                <span>Reservar Cita</span>
                <span className="material-symbols-outlined text-sm">calendar_add_on</span>
              </div>
            </button>
          )}

          {/* Botón Ver detalles */}
          <button
            onClick={() => navigate(`/proyecto/${proyecto.id}`)}
            className="w-full py-3 bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest transition-all duration-300 rounded-sm text-center"
          >
            Ver Detalles
          </button>
          
          {puedeEditar && !isTop && (
            <div className="flex gap-3 pt-4 mt-2 border-t border-outline-variant/20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/editarProyecto/${proyecto.id}`);
                }}
                className="flex-1 py-2 bg-surface-container-highest hover:bg-white text-on-surface hover:text-background border border-outline-variant/30 hover:border-white font-label text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Editar
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEliminar(proyecto.id);
                }}
                className="flex-1 py-2 bg-error-container/50 hover:bg-error text-error hover:text-on-error border border-error/50 font-label text-[10px] uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Elimin.
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}