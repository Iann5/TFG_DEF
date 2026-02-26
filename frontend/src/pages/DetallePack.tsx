import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';
import ListaComentarios from '../components/ListaComentarios';
import FormularioValoracion from '../components/FormularioValoracion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { PackDetalle } from '../types/Pack';
import { type ValoracionDetalle, type RawValoracion } from '../types/Valoracion';


// ─── INTERFACES ESTRICTAS (Solo lo necesario) ───────────────────────────────

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

export default function DetallePack() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const [pack, setPack] = useState<PackDetalle | null>(null);
    const [valoraciones, setValoraciones] = useState<ValoracionDetalle[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            setNombreUsuario(localStorage.getItem('userName'));
        } else {
            setNombreUsuario(null);
        }
    }, [isLoggedIn]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar Pack
            const resPack = await api.get<PackDetalle>(`/packs/${id}`);
            setPack(resPack.data);

            // Cargar Valoraciones
            // Intentamos cargar valoraciones específicas de packs
            const resVal = await api.get<RawValoracion[]>(
                `/valoracion_packs?pack=${encodeURIComponent(`/api/packs/`)}`
            );
            const raw = Array.isArray(resVal.data) ? resVal.data : [];
            setValoraciones(mapearValoraciones(raw));
        } catch (err) {
            console.error("Error cargando datos del pack", err);
        } finally {
            setLoading(false);
        }
    };

    const recargarValoraciones = async () => {
        try {
            const res = await api.get<RawValoracion[]>(
                `/valoracion_packs?pack=${encodeURIComponent(`/api/packs/`)}`
            );
            const raw = Array.isArray(res.data) ? res.data : [];
            setValoraciones(mapearValoraciones(raw));
        } catch (err) {
            console.error("Error recargando valoraciones", err);
        }
    };

    useEffect(() => {
        cargarDatos();
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
                <button onClick={() => navigate('/merchandising')} className="text-sky-400 underline">Volver a merchandising</button>
            </div>
        );
    }

    // Datos del pack
    const titulo = pack.titulo ?? 'Sin título';
    const imagen = pack.imagen ?? '';
    const descripcion = pack.descripcion ?? 'Sin descripción disponible.';
    const precioOriginal = pack.precioOriginal ?? 0;
    const precioOferta = pack.precioOferta ?? null;
    const stock = pack.stock ?? 0;
    const tipoPack = pack.tipoPack ?? 'Pack';

    // Lógica para que no explote si productos o proyectos vienen como null/undefined
    const listaProductos = Array.isArray(pack.productos) ? pack.productos : [];
    const listaProyectos = Array.isArray(pack.proyectos) ? pack.proyectos : [];
    const tieneContenido = listaProductos.length > 0 || listaProyectos.length > 0;

    const esServicio = tipoPack.toLowerCase().includes('tatuaje') || tipoPack.toLowerCase().includes('plantilla');

    const media = calcularMedia(valoraciones);
    const yaValoró = isLoggedIn && nombreUsuario != null &&
        valoraciones.some(v => v.nombreUsuario === nombreUsuario);

    return (
        <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', opacity: 0.12, filter: 'invert(1)' }}
            />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="container mx-auto px-4 py-10 flex-grow max-w-4xl">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white transition mb-6 text-sm">
                        <ArrowLeft size={16} /> <span>Volver</span>
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

                        {/* Información */}
                        <div className="p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                    <span className="text-sky-500 font-black text-xs uppercase tracking-[0.2em] mb-1 block">
                                        {tipoPack}
                                    </span>
                                    <h1 className="text-3xl font-bold text-white leading-tight">{titulo}</h1>
                                </div>
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
                                <span className="text-white/50 flex items-center gap-1.5">
                                    <ShoppingCart size={14} /> Stock: {stock} unidades
                                </span>
                            </div>

                            <p className="text-white/70 leading-relaxed mb-6">
                                {descripcion}
                            </p>

                            {/* LISTADO DE CONTENIDO */}
                            <div className="mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-widest">Contenido del Pack</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {tieneContenido ? (
                                        <>
                                            {listaProductos.map((p) => (
                                                <div key={`prod-${p.id}`} className="flex items-center gap-2 text-sm text-white/80">
                                                    <span className="text-sky-500">📦</span> {p.nombre}
                                                </div>
                                            ))}
                                            {listaProyectos.map((pj) => (
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

                            {/* Caja de Precio y Botón */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    {precioOferta != null ? (
                                        <>
                                            <span className="text-white/40 line-through text-sm">{precioOriginal.toFixed(2)} €</span>
                                            <span className="text-green-400 font-bold text-3xl">{precioOferta.toFixed(2)} €</span>
                                            <span className="bg-green-900/40 text-green-400 text-xs font-bold px-2 py-0.5 rounded">OFERTA</span>
                                        </>
                                    ) : (
                                        <span className="text-white font-bold text-3xl">{precioOriginal.toFixed(2)} €</span>
                                    )}
                                </div>

                                <button className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg active:scale-95 ${esServicio ? 'bg-sky-600 hover:bg-sky-500 text-white' : 'bg-white text-black hover:bg-gray-200'}`}>
                                    {esServicio ? <Calendar size={18} /> : <ShoppingCart size={18} />}
                                    {esServicio ? 'Reservar Cita' : 'Añadir al carro'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sección valoraciones */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Star className="fill-yellow-400 text-yellow-400" size={22} />
                            Valoraciones
                        </h2>

                        <div className="mb-8">
                            {yaValoró ? (
                                <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-5 text-center text-sky-300 font-semibold">
                                    ✅ Ya has dejado tu valoración para este pack.
                                </div>
                            ) : (
                                <FormularioValoracion
                                    packId={Number(id)}
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
