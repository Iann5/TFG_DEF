import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TarjetaEquipo from '../components/TarjetaEquipo';
import ModalDetalleEquipo from '../components/ModalDetalleEquipo';
import MultiSelect from '../components/MultiSelect';
import { type Trabajador } from '../types/trabajador';

// ─── Página Equipo ─────────────────────────────────────────────────────────────

const ORDEN_OPTS = [
    { value: 'az', label: 'ALFABÉTICO (A→Z)' },
    { value: 'za', label: 'ALFABÉTICO (Z→A)' },
    { value: 'val_desc', label: 'MAYOR VALORACIÓN' },
    { value: 'val_asc', label: 'MENOR VALORACIÓN' },
];

interface TrabajadorConMedia extends Trabajador {
    mediaValoracion?: number;
}

const Equipo: React.FC = () => {
    const [trabajadores, setTrabajadores] = useState<TrabajadorConMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [orden, setOrden] = useState<string[]>(['az']);
    const [modalId, setModalId] = useState<number | null>(null);

    useEffect(() => {
        const fetchEquipo = async () => {
            try {
                const response = await api.get<TrabajadorConMedia[]>('/equipo');
                const base = response.data;

                // Cargar medias de valoración para cada trabajador
                const conMedias = await Promise.all(
                    base.map(async (t) => {
                        try {
                            const vRes = await api.get<{ estrellas: number }[]>(
                                `/valoracion_trabajadors?trabajador=${encodeURIComponent(`/api/trabajadors/${t.id}`)}`
                            );
                            const vals = Array.isArray(vRes.data) ? vRes.data : [];
                            const media = vals.length
                                ? vals.reduce((a, v) => a + v.estrellas, 0) / vals.length
                                : 0;
                            return { ...t, mediaValoracion: media };
                        } catch {
                            return { ...t, mediaValoracion: 0 };
                        }
                    })
                );
                setTrabajadores(conMedias);
            } catch (err) {
                if (err instanceof AxiosError) console.error('Error cargando equipo:', err.response?.data);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipo();
    }, []);

    // Aplicar ordenación
    const trabajadoresOrdenados = (() => {
        const list = [...trabajadores];
        const activo = orden[orden.length - 1] ?? 'az';
        if (activo === 'val_desc') list.sort((a, b) => (b.mediaValoracion ?? 0) - (a.mediaValoracion ?? 0));
        else if (activo === 'val_asc') list.sort((a, b) => (a.mediaValoracion ?? 0) - (b.mediaValoracion ?? 0));
        else if (activo === 'za') list.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
        else list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        return list;
    })();

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
                    {/* Cabecera */}
                    <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-outline-variant/30 pb-6">
                        <div className="relative">
                            <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">Los Especialistas</span>
                            <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                                Nuestro<br/>
                                <span className="text-outline-variant">Equipo</span>
                            </h1>
                            {/* Decorative elements */}
                            <div className="absolute -left-4 top-0 w-1 h-32 bg-primary"></div>
                            <div className="absolute left-0 -top-4 w-12 h-1 bg-primary"></div>
                        </div>
                        {!loading && (
                            <div className="w-full md:w-80">
                                <MultiSelect
                                    options={ORDEN_OPTS}
                                    selected={orden}
                                    onChange={setOrden}
                                    placeholder="Ordernar equipo..."
                                />
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-primary font-headline text-3xl tracking-widest uppercase animate-pulse">
                            Cargando equipo...
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {trabajadoresOrdenados.map((t) => (
                                <TarjetaEquipo key={t.id} trabajador={t} onVerInfo={setModalId} />
                            ))}
                        </div>
                    )}
                </main>

                <Footer />
            </div>

            {/* Modal */}
            {modalId != null && (
                <ModalDetalleEquipo
                    trabajadorId={modalId}
                    onClose={() => setModalId(null)}
                />
            )}
        </div>
    );
};

export default Equipo;

