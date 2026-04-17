import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import Carrusel from '../components/Carrusel';
import PrecioOferta from '../components/PrecioOferta';
import SeccionValoraciones from '../components/SeccionValoraciones';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { PackDetalle } from '../types/Pack';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { calcularMedia, getStoredUserId, mapearValoraciones, yaValoroEnLista } from '../utils/valoraciones';

export default function DetallePack() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const { addPackToCart } = useCart();
    const puedeVerCreador = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [pack, setPack] = useState<PackDetalle | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
        setCurrentUserId(isLoggedIn ? getStoredUserId() : null);
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
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">refresh</span>
                <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando pack...</p>
            </div>
        );
    }

    if (!pack) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
                <span className="material-symbols-outlined text-error text-6xl">error</span>
                <p className="font-headline text-2xl uppercase tracking-widest text-on-surface">Pack no encontrado</p>
                <button
                    onClick={() => navigate('/ofertasYpacks')}
                    className="bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-3 px-6 rounded-sm transition-all duration-300"
                >
                    Volver a Ofertas y Packs
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
    const sinStock = stock <= 0;
    const media = calcularMedia(valoraciones);
    const yaValoró = yaValoroEnLista(isLoggedIn, valoraciones, currentUserId, nombreUsuario);
    const creadorObj = typeof pack.creador === 'object' && pack.creador !== null ? pack.creador : null;
    const creadorNombre = creadorObj?.usuario?.nombre;
    const creadorApellidos = creadorObj?.usuario?.apellidos || '';
    const creadorTrabajadorId = (() => {
        const creador = pack.creador as unknown;
        if (creador && typeof creador === 'object') {
            const id = (creador as { id?: number }).id;
            return typeof id === 'number' ? id : null;
        }
        if (typeof creador === 'string') {
            const last = creador.split('/').filter(Boolean).pop();
            const n = last ? Number(last) : NaN;
            return Number.isFinite(n) ? n : null;
        }
        return null;
    })();

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1400px] w-full mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest mb-8 transition-colors group w-fit"
                    >
                        <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Volver
                    </button>

                    <div className="glass-panel overflow-hidden mb-16 flex flex-col lg:flex-row relative">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

                        {/* Carrusel */}
                        <div className="lg:w-1/2 bg-surface-container-highest border-b lg:border-b-0 lg:border-r border-outline-variant/30 flex items-center justify-center p-8 min-h-[400px] lg:min-h-[500px] relative">
                            <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none mix-blend-overlay"></div>
                            {allImages.length > 0 ? (
                                <Carrusel images={allImages} alt={titulo} />
                            ) : (
                                <div className="text-outline-variant border border-outline-variant/20 bg-surface-container p-16 flex flex-col items-center justify-center relative">
                                    <div className="absolute inset-0 bg-halftone opacity-30"></div>
                                    <span className="material-symbols-outlined text-4xl relative z-10">image</span>
                                </div>
                            )}

                            {/* Overlay de "agotado" para packs sin stock, incluidos plantilla/tatuaje */}
                            {sinStock && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-20">
                                    <span className="text-error font-headline text-3xl font-black uppercase tracking-[0.2em] -rotate-12 border-2 border-error px-4 py-2 bg-background/50">
                                        Agotado
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col relative z-20">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                                <div className="flex-1">
                                    <div className="font-label text-primary text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                        <span className="w-4 h-[1px] bg-primary"></span>
                                        {esServicio ? 'Servicio' : 'Pack de productos'}
                                    </div>
                                    <h1 className="font-headline text-3xl md:text-5xl font-bold uppercase tracking-wide leading-tight mb-4">{titulo}</h1>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="bg-secondary-container/20 text-sky-200 border border-secondary/30 font-label text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-sm">
                                            {tipoPack}
                                        </span>
                                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest rounded-sm border ${stock > 0 ? 'bg-primary/10 text-primary border-primary/30' : 'bg-error/10 text-error border-error/30'}`}>
                                                <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                                {stock > 0 ? `Stock Disponible: ${stock}` : 'Sin Existencias'}
                                            </span>
                                    </div>

                                    {puedeVerCreador && creadorNombre && (
                                        <div className="flex items-center gap-2 opacity-80">
                                            <span className="material-symbols-outlined text-[14px]">brush</span>
                                            <p className="font-body text-[10px] uppercase tracking-wider text-on-surface-variant">
                                                Creado por: <span className="font-bold text-on-surface">{creadorNombre} {creadorApellidos}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 border border-outline-variant/30 rounded-sm">
                                        <StarRating value={media} size={16} />
                                        <span className="text-on-surface font-label font-bold text-sm tracking-widest leading-none mt-0.5">
                                            {media > 0 ? media.toFixed(1) : 'NEW'}
                                        </span>
                                    </div>
                                    <span className="text-outline font-body text-[10px] tracking-wider uppercase">({valoraciones.length} Reseñas)</span>
                                </div>
                            </div>

                            <div className="mb-10">
                                <div className="h-[1px] w-12 bg-primary mb-6"></div>
                                <p className="font-body text-on-surface-variant text-sm md:text-base leading-relaxed text-justify mb-8 whitespace-pre-line">
                                    {descripcion}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-outline-variant/20">
                                <div className="mb-6">
                                    <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} size="lg" />
                                </div>

                                {isLoggedIn ? (
                                    <button
                                        onClick={() => {
                                            if (sinStock) return;
                                            if (esServicio) {
                                                navigate('/cita', {
                                                    state: {
                                                        trabajadorId: creadorTrabajadorId ?? undefined,
                                                        packId: pack.id
                                                    }
                                                });
                                            } else {
                                                addPackToCart({
                                                    id: pack.id,
                                                    titulo,
                                                    imagen,
                                                    precioOriginal,
                                                    precioOferta,
                                                    stock,
                                                }, 1);
                                                navigate('/carrito');
                                            }
                                        }}
                                        disabled={sinStock}
                                        className={`w-full py-4 font-label text-xs uppercase tracking-widest transition-all duration-300 rounded-sm flex justify-center items-center gap-2 ${
                                            sinStock
                                                ? 'bg-error/20 text-error border border-error/40 cursor-not-allowed'
                                                : (esServicio ? 'bg-secondary-container/20 hover:bg-secondary-container/40 border border-secondary/30 text-secondary' : 'primary-gradient-cta')
                                        }`}
                                    >
                                        {sinStock ? (
                                            <>
                                                <span className="material-symbols-outlined text-[16px]">remove_shopping_cart</span>
                                                No hay stock
                                            </>
                                        ) : esServicio ? (
                                            <div className="cta-content">
                                                <span>Reservar Cita</span>
                                                <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                                            </div>
                                        ) : (
                                            <div className="cta-content">
                                                <span>Añadir al Carrito</span>
                                                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                            </div>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login', { state: { returnTo: `/merchandising/pack/${pack.id}` } })}
                                        className="w-full py-4 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">{esServicio ? 'calendar_month' : 'shopping_cart'}</span>
                                        Iniciar Sesión
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contenido del pack */}
                    {/* Contenido del pack eliminado: se describe en "descripcion" */}

                    {/* Valoraciones */}
                    <div className="glass-panel p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/20 pb-6">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary">forum</span>
                            </div>
                            <div>
                                <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-widest text-on-surface">Reseñas de clientes</h2>
                                <p className="font-label text-[10px] text-outline tracking-[0.2em] uppercase">Opiniones de la comunidad</p>
                            </div>
                        </div>

                        <SeccionValoraciones
                            isLoggedIn={isLoggedIn}
                            yaValoró={yaValoró}
                            valoraciones={valoraciones}
                            onValoracionEnviada={recargarValoraciones}
                            packId={Number(id)}
                            nombreRecurso="pack"
                            valoracionApiSegment="valoracion_packs"
                            currentUserId={currentUserId}
                        />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}
