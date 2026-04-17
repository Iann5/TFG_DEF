import { useNavigate } from 'react-router-dom';
import PrecioOferta from '../PrecioOferta';
import BotonesAdmin from '../BotonesAdmin';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { ItemPromocionalExtra } from '../../hooks/useOfertasYPacks';

interface Props {
    items: ItemPromocionalExtra[];
    puedeEditar: boolean;
    onEliminar: (idUnico: string, dbId: number, esPack: boolean, isProduct: boolean) => void;
}

export default function GridPromociones({ items, puedeEditar, onEliminar }: Props) {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const { addToCart, addPackToCart } = useCart();

    if (items.length === 0) {
        return <div className="text-on-surface/50 text-center col-span-full py-10 font-label tracking-[0.2em] uppercase text-sm">No hay elementos que coincidan con la búsqueda.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map(item => {
                const esServicio = item.tipo === 'servicio' || item.tipo === 'plantilla';
                const sinStock = (item.stock ?? 0) <= 0;
                const mostrarAgotado = sinStock && (item.esPack || item.tipo === 'producto');

                return (
                <div key={item.idUnico} className="glass-panel flex flex-col group hover:-translate-y-1 transition-all duration-300 relative">
                    <div className="h-64 border-b border-outline-variant/30 overflow-hidden relative flex items-center justify-center p-4 bg-surface-container/50">
                        {item.imagen ? (
                            <img
                                src={item.imagen}
                                alt={item.titulo}
                                className="w-full h-full object-cover filter grayscale group-hover:filter-none transition-all duration-700 hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface/30 font-headline text-3xl tracking-widest">IMG</div>
                        )}

                        {/* “Agotado” igual que merchandising: aplicar también a packs sin stock */}
                        {mostrarAgotado && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-20">
                                <span className="text-error font-headline text-3xl font-black uppercase tracking-[0.2em] -rotate-12 border-2 border-error px-4 py-2 bg-background/50">
                                    Agotado
                                </span>
                            </div>
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                            {item.esPack && <span className="bg-secondary-container text-secondary text-[10px] uppercase font-label tracking-widest px-3 py-1 rounded-sm shadow-sm backdrop-blur-sm -rotate-2">Pack</span>}
                            {item.precioOferta && (
                                <span className="bg-error/70 text-on-error text-[10px] uppercase font-label tracking-widest px-3 py-1 rounded-sm shadow-sm backdrop-blur-sm -rotate-2 border border-error/70 whitespace-nowrap leading-none">
                                    Oferta
                                </span>
                            )}
                            {(item.tipo === 'producto' || item.esPack) && (
                                <span className="text-[10px] uppercase font-label tracking-widest px-3 py-1 rounded-sm shadow-sm backdrop-blur-sm -rotate-2 border border-outline-variant/50 whitespace-nowrap leading-none bg-surface-container-highest/80 text-white">
                                    {(item.stock ?? 0) > 0 ? `Stock: ${item.stock}` : 'No hay stock'}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-4 gap-4">
                            <div>
                                <h3 className="text-on-surface font-headline text-lg uppercase tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.titulo}</h3>
                                {puedeEditar && item.autorNombre && (
                                    <p className="text-outline-variant font-label text-[10px] uppercase mt-2 tracking-widest">Por {item.autorNombre}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 border border-outline-variant/30 px-2 py-1 shrink-0 rounded-sm bg-surface-container/30">
                                <span className="material-symbols-outlined text-[14px] text-tertiary">star</span>
                                <span className="text-on-surface font-label text-[10px] tracking-widest uppercase mt-0.5">{item.valoracionMedia > 0 ? item.valoracionMedia.toFixed(1) : 'Nuevo'}</span>
                            </div>
                        </div>
                        <p className="text-on-surface-variant font-body text-sm mb-6 line-clamp-2">{item.descripcion}</p>

                        <div className="mt-auto space-y-4">
                            <div className="border border-outline-variant/30 p-3 mb-4 flex items-center justify-center rounded-sm bg-surface-container/20">
                                <PrecioOferta
                                    precioOriginal={item.precioOriginal}
                                    precioOferta={item.precioOferta}
                                    size="sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        if (item.esPack) navigate(`/merchandising/pack/${item.dbId}`);
                                        else {
                                            const esProyecto = (item.tipoOriginal?.toLowerCase().includes('tatuaje') ||
                                                item.tipoOriginal?.toLowerCase().includes('plantilla'));
                                            navigate(`${esProyecto ? '/proyecto' : '/merchandising'}/${item.dbId}`);
                                        }
                                    }}
                                    className="w-full py-3 bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all duration-300"
                                >
                                    Ver Detalles
                                </button>

                                {/* Botón de acción secundario */}
                                {(() => {
                                    if (!isLoggedIn) {
                                        return (
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="w-full py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{esServicio ? 'calendar_month' : 'shopping_cart'}</span>
                                                Iniciar Sesión
                                            </button>
                                        );
                                    }
                                    if (esServicio) {
                                        return (
                                            <button
                                                onClick={() => {
                                                    if (sinStock) return;
                                                    const payload = {
                                                        trabajadorId: item.autorId,
                                                        ...(item.esPack ? { packId: item.dbId } : { proyectoId: item.dbId })
                                                    };
                                                    navigate('/cita', { state: payload });
                                                }}
                                                disabled={sinStock}
                                                className={`w-full py-3 font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all flex items-center justify-center gap-2 ${
                                                    sinStock
                                                        ? 'bg-error/20 text-error border border-error/40 cursor-not-allowed'
                                                        : 'bg-secondary-container/20 hover:bg-secondary-container/40 border border-secondary/30 text-secondary'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    {sinStock ? 'remove_shopping_cart' : 'calendar_add_on'}
                                                </span>
                                                {sinStock ? 'No hay stock' : 'Reservar Cita'}
                                            </button>
                                        );
                                    }
                                    if (item.esPack && item.tipo === 'producto') {
                                        return (
                                            <button
                                                onClick={() => {
                                                    if (sinStock) return;
                                                    addPackToCart({
                                                        id: item.dbId,
                                                        titulo: item.titulo,
                                                        imagen: item.imagen,
                                                        precioOriginal: item.precioOriginal,
                                                        precioOferta: item.precioOferta ?? null,
                                                        stock: item.stock ?? 0,
                                                    }, 1);
                                                }}
                                                disabled={sinStock}
                                                className={`w-full py-3 font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all flex items-center justify-center gap-2 ${
                                                    sinStock
                                                        ? 'bg-error/20 text-error border border-error/40 cursor-not-allowed'
                                                        : 'primary-gradient-cta hover:shadow-[0_6px_20px_rgba(173,198,255,0.18)] hover:-translate-y-0.5'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{sinStock ? 'remove_shopping_cart' : 'add_shopping_cart'}</span>
                                                {sinStock ? 'No hay stock' : 'Añadir al Carrito'}
                                            </button>
                                        );
                                    }
                                    if (!item.esPack && item.tipo === 'producto') {
                                        return (
                                            <button
                                                onClick={() => {
                                                    if (sinStock) return;
                                                    addToCart({
                                                        id: item.dbId,
                                                        nombre: item.titulo,
                                                        descripcion: item.descripcion,
                                                        imagen: item.imagen,
                                                        imagenes: item.imagenes,
                                                        precio_original: item.precioOriginal,
                                                        precio_oferta: item.precioOferta,
                                                        stock: item.stock ?? 0,
                                                    } as any, 1);
                                                }}
                                                disabled={sinStock}
                                                className={`w-full py-3 font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all flex items-center justify-center gap-2 ${
                                                    sinStock
                                                        ? 'bg-error/20 text-error border border-error/40 cursor-not-allowed'
                                                        : 'primary-gradient-cta hover:shadow-[0_6px_20px_rgba(173,198,255,0.18)] hover:-translate-y-0.5'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">{sinStock ? 'remove_shopping_cart' : 'add_shopping_cart'}</span>
                                                {sinStock ? 'No hay stock' : 'Añadir al Carrito'}
                                            </button>
                                        );
                                    }
                                    return (
                                        <button
                                            onClick={() => { }}
                                            className="w-full py-3 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-outline-variant font-label text-xs tracking-[0.2em] uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                                            Añadir (Pronto)
                                        </button>
                                    );
                                })()}

                                {puedeEditar && (
                                    <div className="pt-2 border-t border-outline-variant/30 mt-2">
                                        <BotonesAdmin
                                            onEditar={() => {
                                                if (item.esPack) navigate(`/editarPack/${item.dbId}`);
                                                else if (item.tipo === 'producto') navigate(`/editarProducto/${item.dbId}`);
                                                else navigate(`/editarProyecto/${item.dbId}`);
                                            }}
                                            onEliminar={() => onEliminar(item.idUnico, item.dbId, item.esPack, item.tipo === 'producto')}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )})}
        </div>
    );
}
