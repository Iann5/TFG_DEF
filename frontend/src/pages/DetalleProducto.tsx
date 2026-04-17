import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import Carrusel from '../components/Carrusel';
import PrecioOferta from '../components/PrecioOferta';
import SeccionValoraciones from '../components/SeccionValoraciones';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { type ProductoRaw } from '../types/producto';
import { calcularMedia, getStoredUserId, mapearValoraciones, yaValoroEnLista } from '../utils/valoraciones';

export default function DetalleProducto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const { addToCart } = useCart();
    const puedeVerCreador = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [producto, setProducto] = useState<ProductoRaw | null>(null);
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
                `/valoracion_productos?producto=${encodeURIComponent(`/api/productos/${id}`)}`
            );
            setValoraciones(mapearValoraciones(Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            if (err instanceof AxiosError) {
                console.error('Error cargando valoraciones:', err.response?.data);
            } else {
                console.error('Error desconocido:', err);
            }
        }
    };

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const res = await api.get<ProductoRaw>(`/productos/${id}`);
                setProducto(res.data);
                await recargarValoraciones();
            } catch (err) {
                console.error('Error al cargar producto:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
               <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">refresh</span>
               <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando producto...</p>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-4">
                <span className="material-symbols-outlined text-error text-6xl">error</span>
                <p className="font-headline text-2xl uppercase tracking-widest text-on-surface">Producto no encontrado</p>
                <button onClick={() => navigate('/merchandising')} className="bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-3 px-6 rounded-sm transition-all duration-300">
                    Volver al Catálogo
                </button>
            </div>
        );
    }

    const nombre = producto.nombre ?? 'Sin nombre';
    const imagenPrincipal = producto.imagen ?? '';
    const imagenesAdicionales = producto.imagenes ?? [];
    const allImages = imagenPrincipal ? [imagenPrincipal, ...imagenesAdicionales] : imagenesAdicionales;
    const descripcion = producto.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = producto.precio_original ?? 0;
    const precioOferta = producto.precio_oferta ?? null;
    const stock = producto.stock ?? 0;
    const media = calcularMedia(valoraciones);
    const yaValoró = yaValoroEnLista(isLoggedIn, valoraciones, currentUserId, nombreUsuario);

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
                                <Carrusel images={allImages} alt={nombre} />
                             ) : (
                                <div className="text-outline-variant border border-outline-variant/20 bg-surface-container p-16 flex flex-col items-center justify-center relative">
                                   <div className="absolute inset-0 bg-halftone opacity-30"></div>
                                   <span className="material-symbols-outlined text-4xl relative z-10">image</span>
                                </div>
                             )}
                        </div>

                        <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col relative z-20">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                                <div className="flex-1">
                                    <div className="font-label text-primary text-[10px] uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                       <span className="w-4 h-[1px] bg-primary"></span>
                                       Tienda Oficial
                                    </div>
                                    <h1 className="font-headline text-3xl md:text-5xl font-bold uppercase tracking-wide leading-tight mb-4">{nombre}</h1>
                                    
                                    {puedeVerCreador && producto.creador?.usuario?.nombre && (
                                        <div className="flex items-center gap-2 opacity-80 mb-2">
                                            <span className="material-symbols-outlined text-[14px]">brush</span>
                                            <p className="font-body text-[10px] uppercase tracking-wider text-on-surface-variant">
                                                Arte original de: <span className="font-bold text-on-surface">{producto.creador.usuario.nombre} {producto.creador.usuario.apellidos || ''}</span>
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

                            <div className="mb-8">
                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 font-label text-[10px] uppercase tracking-widest rounded-sm border ${stock > 0 ? 'bg-primary/10 text-primary border-primary/30' : 'bg-error/10 text-error border-error/30'}`}>
                                    <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                                    {stock > 0 ? `Stock Disponible: ${stock}` : 'Sin Existencias'}
                                </span>
                            </div>

                            <div className="mb-10">
                                <div className="h-[1px] w-12 bg-primary mb-6"></div>
                                <p className="font-body text-on-surface-variant text-sm md:text-base leading-relaxed text-justify mb-8">
                                   {descripcion}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-outline-variant/20">
                                <div className="mb-6">
                                   <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} size="lg" />
                                </div>

                                <button 
                                    onClick={() => addToCart(producto, 1)}
                                    disabled={stock === 0}
                                    className={`w-full py-4 font-label text-xs uppercase tracking-widest transition-all duration-300 rounded-sm flex justify-center items-center gap-2 ${
                                       stock === 0 
                                       ? 'bg-error/20 text-error border border-error/40 cursor-not-allowed'
                                       : 'primary-gradient-cta'
                                    }`}
                                >
                                    {stock === 0 ? (
                                       <>
                                         <span className="material-symbols-outlined text-[16px]">remove_shopping_cart</span>
                                         No hay stock
                                       </>
                                    ) : (
                                       <div className="cta-content">
                                         <span>Añadir al Carrito</span>
                                         <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                       </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-10 border-b border-outline-variant/20 pb-6">
                           <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary">forum</span>
                           </div>
                           <div>
                              <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-widest text-on-surface">Reseñas de Clientes</h2>
                              <p className="font-label text-[10px] text-outline tracking-[0.2em] uppercase">Opiniones de la comunidad</p>
                           </div>
                        </div>

                        <SeccionValoraciones
                            isLoggedIn={isLoggedIn}
                            yaValoró={yaValoró}
                            valoraciones={valoraciones}
                            onValoracionEnviada={recargarValoraciones}
                            productoId={Number(id)}
                            nombreRecurso="producto"
                            valoracionApiSegment="valoracion_productos"
                            currentUserId={currentUserId}
                        />
                    </div>
                </main>

                <Footer />
            </div>
        </div>
    );
}