import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft,  /*Star,*/ Calendar, ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import PageBackground from '../components/PageBackground';
import Carrusel from '../components/Carrusel';
import PrecioOferta from '../components/PrecioOferta';
import SeccionValoraciones from '../components/SeccionValoraciones';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PackDetalle } from '../types/Pack';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { calcularMedia, mapearValoraciones } from '../utils/valoraciones';

export default function DetallePack() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const puedeVerCreador = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [pack, setPack] = useState<PackDetalle | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
    }, [isLoggedIn]);

    const recargarValoraciones = async () => {
        try {
            const res = await api.get<RawValoracion[]>(
                `/valoracion_packs?pack=${encodeURIComponent(`/api/packs/${id}`)}`
            );
            setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            console.error('Error recargando valoraciones', err);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const resPack = await api.get<PackDetalle>(`/packs/${id}`);
                setPack(resPack.data);
                await recargarValoraciones();
            } catch (err) {
                console.error('Error cargando datos del pack', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1C1B28] flex items-center justify-center">
                <p className="text-sky-400 font-bold animate-pulse">CARGANDO PACK...</p>
            </div>
        );
    }

    if (!pack) {
        return (
            <div className="min-h-screen bg-[#1C1B28] flex flex-col items-center justify-center gap-4">
                <p className="text-red-400 text-lg">Pack no encontrado.</p>
                <button onClick={() => navigate('/merchandising')} className="text-sky-400 underline">
                    Volver a merchandising
                </button>
            </div>
        );
    }

    const titulo = pack.titulo ?? 'Sin título';
    const imagen = pack.imagen ?? '';
    const imagenes = pack.imagenes ?? [];
    const allImages = imagen ? [imagen, ...imagenes] : imagenes;
    const descripcion = pack.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = pack.precioOriginal ?? 0;
    const precioOferta = pack.precioOferta ?? null;
    const stock = pack.stock ?? 0;
    const tipoPack = pack.tipoPack ?? 'Pack';
    const esServicio = tipoPack.toLowerCase().includes('tatuaje') || tipoPack.toLowerCase().includes('plantilla');
    const listaProductos = Array.isArray(pack.productos) ? pack.productos : [];
    const listaProyectos = Array.isArray(pack.proyectos) ? pack.proyectos : [];
    const tieneContenido = listaProductos.length > 0 || listaProyectos.length > 0;
    const media = calcularMedia(valoraciones);
    const yaValoró = isLoggedIn && nombreUsuario != null &&
        valoraciones.some(v => v.nombreUsuario === nombreUsuario);

    return (
        <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
            <PageBackground opacity={0.12} />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 py-10 flex-grow max-w-4xl">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-6 text-sm">
                        <ArrowLeft size={16} /> <span>Volver</span>
                    </button>

                    <div className="bg-[#323444] border border-[#3B82F6]/20 rounded-2xl overflow-hidden shadow-2xl mb-10">
                        {/* Carrusel */}
                        <div className="h-80 bg-white overflow-hidden relative group">
                            <Carrusel images={allImages} alt={titulo} />
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-sky-500 font-black text-xs uppercase tracking-[0.2em] mb-1 block">{tipoPack}</span>
                                    <h1 className="text-3xl font-bold text-white leading-tight">{titulo}</h1>
                                    {puedeVerCreador && pack.creador?.usuario?.nombre && (
                                        <p className="text-sky-400 font-medium text-sm mt-1">
                                            Pack creado por: {pack.creador.usuario.nombre} {pack.creador.usuario.apellidos || ''}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-xl border border-white/5 shrink-0">
                                    <StarRating value={media} size={18} />
                                    <span className="text-yellow-400 font-bold text-sm">{media > 0 ? media.toFixed(1) : 'Nuevo'}</span>
                                    <span className="text-white/30 text-xs">({valoraciones.length})</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-5 text-sm">
                                <span className="text-white/50 flex items-center gap-1.5">
                                    <ShoppingCart size={14} /> Stock: {stock} unidades
                                </span>
                            </div>

                            <p className="text-white/70 leading-relaxed mb-6">{descripcion}</p>

                            {/* Contenido del pack */}
                            <div className="mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Contenido del Pack</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {tieneContenido ? (
                                        <>
                                            {listaProductos.map(p => (
                                                <div key={`prod-${p.id}`} className="flex items-center gap-2 text-sm text-white/80">
                                                    <span className="text-sky-500">📦</span> {p.nombre}
                                                </div>
                                            ))}
                                            {listaProyectos.map(pj => (
                                                <div key={`proj-${pj.id}`} className="flex items-center gap-2 text-sm text-white/80">
                                                    <span className="text-purple-400">🎨</span> {pj.tituloTatuaje}
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 text-xs italic">Contenido variado según disponibilidad</p>
                                    )}
                                </div>
                            </div>

                            {/* Precio y acción */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
                                <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} />

                                {isLoggedIn ? (
                                    <button
                                        onClick={() => {
                                            if (esServicio) {
                                                navigate('/cita', {
                                                    state: {
                                                        trabajadorId: pack.creador?.id,
                                                        packId: pack.id
                                                    }
                                                });
                                            }
                                            // compra: sin lógica por ahora
                                        }}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95 ${esServicio ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}
                                    >
                                        {esServicio ? <Calendar size={18} /> : <ShoppingCart size={18} />}
                                        {esServicio ? 'Reservar Cita' : 'Añadir al carro'}
                                    </button>
                                ) : (
                                    <div className="p-4 bg-sky-900/20 border border-sky-500/30 rounded-xl text-center">
                                        <p className="text-sky-300 text-sm mb-2">Para {esServicio ? 'reservar' : 'comprar'} necesitas iniciar sesión.</p>
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
                    </div>

                    <SeccionValoraciones
                        isLoggedIn={isLoggedIn}
                        yaValoró={yaValoró}
                        valoraciones={valoraciones}
                        onValoracionEnviada={recargarValoraciones}
                        packId={Number(id)}
                        nombreRecurso="pack"
                    />
                </main>

                <Footer />
            </div>
        </div>
    );
}
