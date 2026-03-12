import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import PageBackground from '../components/PageBackground';
import Carrusel from '../components/Carrusel';
import PrecioOferta from '../components/PrecioOferta';
import SeccionValoraciones from '../components/SeccionValoraciones';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';
import { type ProductoRaw } from '../types/producto';
import { calcularMedia, mapearValoraciones } from '../utils/valoraciones';

export default function DetalleProducto() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn, hasRole } = useAuth();
    const puedeVerCreador = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [producto, setProducto] = useState<ProductoRaw | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

    useEffect(() => {
        setNombreUsuario(isLoggedIn ? localStorage.getItem('userName') : null);
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
            <div className="min-h-screen bg-[#1C1B28] flex items-center justify-center">
                <p className="text-white animate-pulse text-xl">Cargando...</p>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="min-h-screen bg-[#1C1B28] flex flex-col items-center justify-center gap-4">
                <p className="text-red-400 text-lg">Producto no encontrado.</p>
                <button onClick={() => navigate('/merchandising')} className="text-sky-400 underline">
                    Volver a productos
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
                        {/* Carrusel */}
                        <div className="h-80 bg-white overflow-hidden relative group">
                            <Carrusel images={allImages} alt={nombre} />
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white leading-tight">{nombre}</h1>
                                    {puedeVerCreador && producto.creador?.usuario?.nombre && (
                                        <p className="text-sky-400 font-medium text-sm mt-1">
                                            Creado por: {producto.creador.usuario.nombre} {producto.creador.usuario.apellidos || ''}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-xl border border-white/5 shrink-0">
                                    <StarRating value={media} size={18} />
                                    <span className="text-yellow-400 font-bold text-sm">
                                        {media > 0 ? media.toFixed(1) : 'Nuevo'}
                                    </span>
                                    <span className="text-white/30 text-xs">({valoraciones.length})</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-5 text-sm">
                                <span className="text-white/50 flex items-center gap-1.5">
                                    <ShoppingCart size={14} /> Stock: {stock} unidades
                                </span>
                            </div>

                            <p className="text-white/70 leading-relaxed mb-6">{descripcion}</p>

                            <PrecioOferta precioOriginal={precioOriginal} precioOferta={precioOferta} />
                        </div>
                    </div>

                    <SeccionValoraciones
                        isLoggedIn={isLoggedIn}
                        yaValoró={yaValoró}
                        valoraciones={valoraciones}
                        onValoracionEnviada={recargarValoraciones}
                        productoId={Number(id)}
                        nombreRecurso="producto"
                    />
                </main>

                <Footer />
            </div>
        </div>
    );
}