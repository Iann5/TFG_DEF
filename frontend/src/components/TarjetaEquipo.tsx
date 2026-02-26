// src/components/TarjetaEquipo.tsx
import React from 'react';
import { type Trabajador } from '../types/trabajador';

interface Props {
    trabajador: Trabajador;
    onVerInfo: (id: number) => void;
}

const TarjetaEquipo: React.FC<Props> = ({ trabajador, onVerInfo }) => {
    return (
        <div className="bg-[#2D2C3E]/80 backdrop-blur-sm border-2 border-[#4A495C] rounded-2xl p-4 flex gap-4 shadow-xl mb-6">
            {/* Contenedor IMG */}
            <div className="w-32 h-32 bg-[#9CA3AF] rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-500">
                {trabajador.imagen ? (
                    <img src={trabajador.imagen} alt={trabajador.nombre} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-700 font-bold">IMG</span>
                )}
            </div>

            {/* Contenedor Info */}
            <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white text-xl font-medium">{trabajador.nombre}</h3>
                    {/* Botón +INFO celeste */}
                    <button
                        onClick={() => onVerInfo(trabajador.id)}
                        className="bg-[#4DB8CC] hover:bg-[#2c8393] text-black text-xs font-bold px-3 py-1 rounded-md transition-colors"
                    >
                        +INFO
                    </button>
                </div>

                {/* Bloque de Descripción Gris */}
                <div className="bg-[#9CA3AF] rounded-lg p-3 flex-grow text-gray-800 text-sm italic">
                    {trabajador.descripcion || "Descripción del tatuador..."}
                </div>
            </div>
        </div>
    );
};

export default TarjetaEquipo;
