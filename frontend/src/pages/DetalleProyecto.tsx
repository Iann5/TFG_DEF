import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import PageBackground from '../components/PageBackground';
import PrecioOferta from '../components/PrecioOferta';
import SeccionValoraciones from '../components/SeccionValoraciones';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { type DetalleRaw } from '../types/proyecto';
import { calcularMedia, mapearValoraciones } from '../utils/valoraciones';

export default function DetalleProyecto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [proyecto, setProyecto] = useState<DetalleRaw | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
    }, [isLoggedIn]);

    const recargarValoraciones = async () => {
        try {
            const res = await api.get<RawValoracion[]>(
                `/valoracion_proyectos?proyecto=${encodeURIComponent(`/api/proyectos/${id}`)}`
            );
            setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
        } catch {
            // ignorar silenciosamente
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get<DetalleRaw>(`/proyectos/${id}`);
                setProyecto(res.data);
                await recargarValoraciones();
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1C1B28] flex items-center justify-center">
                <p className="text-white animate-pulse text-xl">Cargando...</p>
            </div>
        );
    }

    if (!proyecto) {
        return (
            <div className="min-h-screen bg-[#1C1B28] flex flex-col items-center justify-center gap-4">
                <p className="text-red-400 text-lg">Proyecto no encontrado.</p>
                <button onClick={() => navigate('/proyecto')} className="text-sky-400 underline">
                    Volver a proyectos
                </button>
            </div>
        );
    }

    const titulo = proyecto.tituloTatuaje ?? proyecto.nombre ?? 'Sin título';
    const imagen = proyecto.imagen ?? '';
    const tipo = proyecto.tipo ?? 'Tatuaje';
    const artista = proyecto.autor?.usuario?.nombre
        ? `${proyecto.autor.usuario.nombre} ${proyecto.autor.usuario.apellidos || ''}`
        : proyecto.nombreTrabajador ?? 'Desconocido';
    const descripcion = proyecto.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = proyecto.precioOriginal ?? proyecto.precio_original ?? 0;
    const precioOferta = proyecto.precioOferta ?? proyecto.precio_oferta ?? null;
    const media = calcularMedia(valoraciones);
    const yaValoró = isLoggedIn && nombreUsuario != null &&
        valoraciones.some(v => v.nombreUsuario === nombreUsuario);

    return (
        <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
            <PageBackground opacity={0.12} />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 py-10 flex-grow max-w-4xl">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition mb-6 text-sm"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>

                    <div className="bg-[#323444] border border-[#3B82F6]/20 rounded-2xl overflow-hidden shadow-2xl mb-10">
                        {/* Imagen */}
                        <div className="h-80 bg-white overflow-hidden">
                            {imagen ? (
                                <img src={imagen} alt={titulo} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-black">IMG</div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <h1 className="text-3xl font-bold text-white leading-tight">{titulo}</h1>
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-xl border border-white/5 shrink-0">
                                    <StarRating value={media} size={18} />
                                    <span className="text-yellow-400 font-bold text-sm">
                                        {media > 0 ? media.toFixed(1) : 'Nuevo'}
                                    </span>
                                    <span className="text-white/30 text-xs">({valoraciones.length})</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-5 text-sm">
                                <span className="bg-sky-900/50 text-sky-300 uppercase tracking-widest font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
                                    <Tag size={12} /> {tipo}
                                </span>
                                <span className="text-white/50 flex items-center gap-1.5">
                                    <User size={14} /> {artista}
                                </span>
                            </div>

                            <p className="text-white/70 leading-relaxed mb-6">{descripcion}</p>

                            <div className="mb-6">
                                <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} />
                            </div>

                            {/* Botón Reservar cita */}
                            {isLoggedIn ? (
                                <button
                                    onClick={() => navigate('/cita', {
                                        state: {
                                            trabajadorId: proyecto.autor?.id,
                                            proyectoId: proyecto.id
                                        }
                                    })}
                                    className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition shadow-lg shadow-green-900/40 flex items-center justify-center gap-2"
                                >
                                    📅 Reservar cita
                                </button>
                            ) : (
                                <div className="p-4 bg-sky-900/20 border border-sky-500/30 rounded-xl text-center">
                                    <p className="text-sky-300 text-sm mb-2">Para reservar una cita necesitas iniciar sesión.</p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-white bg-sky-600 hover:bg-sky-500 px-6 py-2 rounded-lg font-bold transition text-sm shadow-lg shadow-sky-900/40"
                                    >
                                        Iniciar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <SeccionValoraciones
                        isLoggedIn={isLoggedIn}
                        yaValoró={yaValoró}
                        valoraciones={valoraciones}
                        onValoracionEnviada={recargarValoraciones}
                        proyectoId={Number(id)}
                        nombreRecurso="proyecto"
                    />
                </main>

                <Footer />
            </div>
        </div>
    );
}
