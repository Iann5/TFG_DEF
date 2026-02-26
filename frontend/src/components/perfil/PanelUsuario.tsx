import { useState, useEffect } from 'react';
import type { Cita } from '../../types/perfil';

interface Props {
    userId: number | null;
}

export default function PanelUsuario({ userId }: Props) {
    const [citas, setCitas] = useState<Cita[]>([]);

    useEffect(() => {
        // Datos de ejemplo hasta que exista el endpoint /api/citas
        setCitas([
            { id: 1, fecha: '18-03-26', hora: '16:30' },
            { id: 2, fecha: '27-05-26', hora: '18:05' },
            { id: 3, fecha: '02-10-26', hora: '20:15' },
        ]);
        void userId;
    }, [userId]);

    const handleCancelar = (id: number) => {
        setCitas(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-1">Citas</h2>
            <hr className="border-white/40 mb-4" />
            {citas.length === 0 && (
                <p className="text-white/60 text-sm">No tienes citas pendientes.</p>
            )}
            <div className="space-y-3">
                {citas.map(cita => (
                    <div
                        key={cita.id}
                        className="flex items-center justify-between bg-slate-600/50 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10"
                    >
                        <span className="text-white text-sm font-medium">
                            Cita día: {cita.fecha} Hora: {cita.hora}
                        </span>
                        <button
                            onClick={() => handleCancelar(cita.id)}
                            className="ml-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shrink-0"
                        >
                            Cancelar Cita
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
