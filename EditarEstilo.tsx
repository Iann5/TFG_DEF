import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import api from '../../services/api';
import Navbar from '../../components/Navbar';

export default function EditarEstilo() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fotosInputRef = useRef<HTMLInputElement>(null);

    const [nombre, setNombre] = useState('');
    const [informacion, setInformacion] = useState('');

    // Imagen principal
    const [imagenActual, setImagenActual] = useState<string | null>(null);
    const [archivoPrincipal, setArchivoPrincipal] = useState<File | null>(null);

    // Fotos de ejemplo (máx 3)
    const [fotosEjemplo, setFotosEjemplo] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

    // Cargar datos actuales
    useEffect(() => {
        if (!id) return;
        api.get(`/estilos/${id}`)
            .then(res => {
                setNombre(res.data.nombre ?? '');
                setInformacion(res.data.informacion ?? '');
                setImagenActual(res.data.imagen ?? null);
                setFotosEjemplo(res.data.imagenes ?? []);
            })
            .catch(() => setMensaje({ tipo: 'error', texto: 'No se pudo cargar el estilo.' }))
            .finally(() => setLoading(false));
    }, [id]);

    const toBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    // ── Imagen principal ─────────────────────────────────────────
    const handleFilePrincipal = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setArchivoPrincipal(e.target.files[0]);
    };

    // ── Fotos de ejemplo ─────────────────────────────────────────
    const handleAnadirFoto = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || fotosEjemplo.length >= 3) return;
        const base64 = await toBase64(e.target.files[0]);
        setFotosEjemplo(prev => [...prev, base64]);
        e.target.value = '';
    };

    const handleEliminarFoto = (idx: number) => {
        setFotosEjemplo(prev => prev.filter((_, i) => i !== idx));
    };

    // ── Guardar ──────────────────────────────────────────────────
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        setMensaje(null);

        try {
            const body: Record<string, unknown> = { nombre, informacion, imagenes: fotosEjemplo };
            if (archivoPrincipal) body.imagen = await toBase64(archivoPrincipal);

            await api.patch(`/estilos/${id}`, body, {
                headers: { 'Content-Type': 'application/merge-patch+json' },
            });

            setMensaje({ tipo: 'exito', texto: '¡Estilo actualizado correctamente!' });
            setTimeout(() => navigate('/estilos'), 1500);
        } catch (error) {
            if (error instanceof AxiosError) {
                setMensaje({ tipo: 'error', texto: `Error del servidor: ${error.response?.status}` });
            } else {
                setMensaje({ tipo: 'error', texto: 'Error inesperado.' });
            }
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] relative font-sans">
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover' }}
            />
            <Navbar />

            <main className="relative z-10 flex flex-col items-center py-10 px-4">
                {loading ? (
                    <div className="animate-spin w-12 h-12 border-4 border-sky-300 border-t-transparent rounded-full mt-20" />
                ) : (
                    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-500/30 backdrop-blur-lg border rounded-2xl p-8 shadow-2xl space-y-6">

                        {/* Cabecera */}
                        <div className="w-full bg-gray-200 rounded-xl py-4 text-center shadow-xl">
                            <h1 className="text-black text-3xl font-light tracking-wide">Editar Estilo</h1>
                        </div>

                        {mensaje && (
                            <div className={`p-4 rounded ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {mensaje.texto}
                            </div>
                        )}

                        {/* ── Nombre ── */}
                        <div className="space-y-2">
                            <label className="text-white text-xl block">Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                className="w-full bg-gradient-to-r from-[#6b7a8d] to-[#92a6b5] p-3 rounded-lg text-white outline-none shadow-inner"
                                required
                            />
                        </div>

                        {/* ── Información ── */}
                        <div className="space-y-2">
                            <label className="text-white text-xl block">Información</label>
                            <textarea
                                value={informacion}
                                onChange={e => setInformacion(e.target.value)}
                                className="w-full bg-gradient-to-r from-[#6b7a8d] to-[#92a6b5] p-3 rounded-lg text-white outline-none h-32"
                                placeholder="Describe el estilo..."
                                required
                            />
                        </div>

                        {/* ── Imagen principal ── */}
                        <div className="space-y-2">
                            <label className="text-white text-xl block">
                                Imagen principal{imagenActual ? ' (cambiar)' : ''}
                            </label>
                            {imagenActual && !archivoPrincipal && (
                                <img src={imagenActual} alt="Actual" className="w-24 h-24 object-cover rounded-lg border border-white/20 mb-1" />
                            )}
                            {archivoPrincipal && (
                                <img src={URL.createObjectURL(archivoPrincipal)} alt="Nueva" className="w-24 h-24 object-cover rounded-lg border border-sky-400 mb-1" />
                            )}
                            <div className="relative w-full bg-gradient-to-r from-[#6b7a8d] to-[#92a6b5] rounded-lg">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFilePrincipal}
                                    className="w-full p-3 opacity-0 absolute inset-0 cursor-pointer z-20"
                                />
                                <div className="p-3 text-gray-200">
                                    {archivoPrincipal ? archivoPrincipal.name : 'Elegir archivo...'}
                                </div>
                            </div>
                        </div>

                        {/* ── Fotos de ejemplo (máx 3) ── */}
                        <div className="space-y-3">
                            <label className="text-white text-xl block">
                                Fotos de ejemplo ({fotosEjemplo.length}/3)
                            </label>

                            <div className="grid grid-cols-3 gap-3">
                                {fotosEjemplo.map((foto, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-[#6b7a8d] border border-white/20">
                                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleEliminarFoto(idx)}
                                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold leading-none"
                                            title="Eliminar foto"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                {/* Slot para añadir (visible si hay < 3) */}
                                {fotosEjemplo.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => fotosInputRef.current?.click()}
                                        className="aspect-square rounded-xl border-2 border-dashed border-white/30 bg-[#6b7a8d]/30 hover:border-sky-400 hover:bg-[#6b7a8d]/50 transition flex flex-col items-center justify-center text-white/50 hover:text-sky-300"
                                    >
                                        <span className="text-3xl">+</span>
                                        <span className="text-xs mt-1">Añadir foto</span>
                                    </button>
                                )}

                                <input
                                    ref={fotosInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAnadirFoto}
                                />
                            </div>

                            {fotosEjemplo.length === 3 && (
                                <p className="text-white/40 text-xs">Máximo de 3 fotos. Elimina una para añadir otra.</p>
                            )}
                        </div>

                        {/* ── Guardar ── */}
                        <button
                            type="submit"
                            disabled={guardando}
                            className="w-full py-4 mt-2 bg-sky-600 hover:bg-blue-600 text-white text-2xl font-light rounded-xl transition-all active:scale-95"
                        >
                            {guardando ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}
