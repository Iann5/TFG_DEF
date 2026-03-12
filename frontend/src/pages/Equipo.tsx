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
    { value: 'az', label: 'Alfabético (A→Z)' },
    { value: 'za', label: 'Alfabético (Z→A)' },
    { value: 'val_desc', label: 'Mayor valoración' },
    { value: 'val_asc', label: 'Menor valoración' },
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
        <div className="min-h-screen relative bg-[#1C1B28] font-sans">
            {/* Fondo Manga Invertido */}
            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', filter: 'invert(1)' }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 py-8 flex-grow max-w-4xl">
                    {/* Cabecera */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <h1 className="text-4xl font-light text-white">
                            Nuestro <span className="text-sky-300 font-bold">Equipo</span>
                        </h1>
                        {!loading && (
                            <MultiSelect
                                options={ORDEN_OPTS}
                                selected={orden}
                                onChange={setOrden}
                            />
                        )}
                    </div>

                    {loading ? (
                        <p className="text-white text-center">Cargando equipo artístico...</p>
                    ) : (
                        <div className="space-y-4">
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

