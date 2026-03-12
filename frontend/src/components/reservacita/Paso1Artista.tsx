import { User } from 'lucide-react';
import type { Trabajador } from '../../types/Citas';

interface Props {
    trabajadores: Trabajador[];
    onSelect: (id: number) => void;
}

export default function Paso1Artista({ trabajadores, onSelect }: Props) {
    return (
        <div>
            <h2 className="text-xl text-sky-400 font-bold mb-6 flex items-center gap-2">
                <User size={24} /> 1. Elige a tu Artista
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trabajadores.map(trab => (
                    <div
                        key={trab.id}
                        onClick={() => onSelect(trab.id)}
                        className="bg-[#1C1B28] border border-white/10 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center cursor-pointer transition-all hover:scale-105"
                    >
                        <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mb-4 border-2 border-sky-500/50">
                            {trab.foto_perfil ? (
                                <img src={trab.foto_perfil} alt={trab.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500">
                                    {trab.nombre.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h3 className="text-white font-bold text-lg">{trab.nombre} {trab.apellidos}</h3>
                        <p className="text-white/50 text-sm mt-2">Seleccionar para ver agenda</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
