// src/components/TarjetaEquipo.tsx
import React from 'react';
import { type Trabajador } from '../types/trabajador';

interface Props {
    trabajador: Trabajador;
    onVerInfo: (id: number) => void;
}

const TarjetaEquipo: React.FC<Props> = ({ trabajador, onVerInfo }) => {
    return (
        <div className="glass-panel flex flex-col md:flex-row gap-6 mb-8 group hover:-translate-y-1 transition-all overflow-hidden border border-outline-variant/30">
            {/* Contenedor IMG */}
            <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 flex items-center justify-center overflow-hidden bg-surface-container relative">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500 pointer-events-none"></div>
                {trabajador.imagen ? (
                    <img src={trabajador.imagen} alt={trabajador.nombre} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" />
                ) : (
                    <span className="text-outline-variant font-headline text-4xl tracking-widest opacity-50">IMG</span>
                )}
            </div>

            {/* Contenedor Info */}
            <div className="flex-grow flex flex-col justify-between p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-primary text-3xl font-headline tracking-wide uppercase">{trabajador.nombre}</h3>
                    <button
                        onClick={() => onVerInfo(trabajador.id)}
                        className="bg-surface-container border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest px-6 py-2 transition-all group/btn relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                        <span className="relative z-10 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">visibility</span> INFO
                        </span>
                    </button>
                </div>

                <div className="bg-surface-container/50 border border-outline-variant/20 p-4 flex-grow text-on-surface font-body text-sm leading-relaxed rounded-sm">
                    {trabajador.descripcion || "Descripción del tatuador..."}
                </div>
            </div>
        </div>
    );
};

export default TarjetaEquipo;
