// src/pages/DetalleProyecto.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Tag, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import ListaComentarios from '../components/ListaComentarios';
import FormularioValoracion from '../components/FormularioValoracion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { type DetalleRaw } from '../types/proyecto';


function calcularMedia(vals: ValoracionDetalle[]): number {
    if (!vals.length) return 0;
    return vals.reduce((acc, v) => acc + v.estrellas, 0) / vals.length;
}

function mapearValoraciones(raw: RawValoracion[]): ValoracionDetalle[] {
    return raw.map(v => ({
        id: v.id,
        estrellas: v.estrellas,
        comentario: v.comentario,
        fecha: v.fecha,
        nombreUsuario: v.usuario?.nombre ?? 'Usuario',
    }));
}

export default function DetalleProyecto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [proyecto, setProyecto] = useState<DetalleRaw | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

    // Leer el nombre del usuario desde localStorage (guardado en el login)
    useEffect(() => {
        if (isLoggedIn) {
            setNombreUsuario(localStorage.getItem('userName'));
        } else {
            setNombreUsuario(null);
        }
    }, [isLoggedIn]);

    const cargarProyecto = async () => {
        try {
            const res = await api.get<DetalleRaw>(`/proyectos/${id}`);
            setProyecto(res.data);
        } finally {
            setLoading(false);
        }
    };

    const recargarValoraciones = async () => {
        try {
            // El filtro usa formato IRI: /api/proyectos/X
            const res = await api.get<RawValoracion[]>(
                `/valoracion_proyectos?proyecto=${encodeURIComponent(`/api/proyectos/${id}`)}`
            );
            const raw = Array.isArray(res.data) ? res.data : [];
            setValoraciones(mapearValoraciones(raw));
        } catch {
            // Si falla el filtro, ignorar silenciosamente
        }
    };

    useEffect(() => {
        cargarProyecto();
        recargarValoraciones();
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
                <button onClick={() => navigate('/proyecto')} className="text-sky-400 underline">Volver a proyectos</button>
            </div>
        );
    }

    const titulo = proyecto.tituloTatuaje ?? proyecto.nombre ?? 'Sin título';
    const imagen = proyecto.imagen ?? '';
    const tipo = proyecto.tipo ?? 'Tatuaje';
    const artista = proyecto.nombreTrabajador ?? 'Desconocido';
    const descripcion = proyecto.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = proyecto.precioOriginal ?? proyecto.precio_original ?? 0;
    const precioOferta = proyecto.precioOferta ?? proyecto.precio_oferta ?? null;
    const media = calcularMedia(valoraciones);
    // El usuario ya valoró si su nombre aparece en alguna valoración
    const yaValoró = isLoggedIn && nombreUsuario != null &&
        valoraciones.some(v => v.nombreUsuario === nombreUsuario);

    return (
        <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
            {/* Fondo */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', opacity: 0.12, filter: 'invert(1)' }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 py-10 flex-grow max-w-4xl">
                    {/* Botón volver */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/50 hover:text-white transition mb-6 text-sm"
                    >
                        <ArrowLeft size={16} /> Volver
                    </button>

                    {/* Tarjeta principal */}
                    <div className="bg-[#323444] border border-[#3B82F6]/20 rounded-2xl overflow-hidden shadow-2xl mb-10">
                        {/* Imagen */}
                        <div className="h-80 bg-white overflow-hidden">
                            {imagen ? (
                                <img src={imagen} alt={titulo} className="w-full h-full object-contain" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-black">IMG</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <h1 className="text-3xl font-bold text-white leading-tight">{titulo}</h1>
                                {/* Estrellas + media */}
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

                            {/* Precios */}
                            <div className="flex items-center gap-3">
                                {precioOferta != null ? (
                                    <>
                                        <span className="text-white/40 line-through text-sm">{precioOriginal.toFixed(2)} €</span>
                                        <span className="text-green-400 font-bold text-xl">{precioOferta.toFixed(2)} €</span>
                                        <span className="bg-green-900/40 text-green-400 text-xs font-bold px-2 py-0.5 rounded">OFERTA</span>
                                    </>
                                ) : (
                                    <span className="text-white font-bold text-xl">{precioOriginal.toFixed(2)} €</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección valoraciones */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Star className="fill-yellow-400 text-yellow-400" size={22} />
                            Valoraciones
                        </h2>

                        {/* Formulario — oculto si el usuario ya valoró */}
                        <div className="mb-8">
                            {yaValoró ? (
                                <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-5 text-center text-sky-300 font-semibold">
                                    ✅ Ya has dejado tu valoración para este proyecto.
                                </div>
                            ) : (
                                <FormularioValoracion
                                    proyectoId={Number(id)}
                                    onValoracionEnviada={recargarValoraciones}
                                />
                            )}
                        </div>

                        {/* Lista de comentarios */}
                        <ListaComentarios valoraciones={valoraciones} />
                    </section>
                </main>

                <Footer />
            </div>
        </div>
    );
}
