import { useNavigate } from 'react-router-dom';
import PrecioOferta from '../PrecioOferta';
import BotonesAdmin from '../BotonesAdmin';
import { useAuth } from '../../context/AuthContext';
import type { ItemPromocionalExtra } from '../../hooks/useOfertasYPacks';

interface Props {
    items: ItemPromocionalExtra[];
    puedeEditar: boolean;
    onEliminar: (idUnico: string, dbId: number, esPack: boolean, isProduct: boolean) => void;
}

export default function GridPromociones({ items, puedeEditar, onEliminar }: Props) {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    if (items.length === 0) {
        return <div className="text-gray-400 text-center col-span-full py-10">No hay elementos que coincidan con la búsqueda.</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
                <div key={item.idUnico} className="bg-[#2a2a2a] rounded-2xl overflow-hidden flex flex-col border border-gray-800 hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-900/20 group">
                    <div className="relative h-64 bg-[#1a1a1a] overflow-hidden">
                        {item.imagen && (
                            <img
                                src={item.imagen}
                                alt={item.titulo}
                                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                            />
                        )}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                            {item.esPack && <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">Pack</span>}
                            {item.precioOferta && <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider shadow-md">Oferta</span>}
                        </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-sky-400 transition-colors">{item.titulo}</h3>
                                {puedeEditar && item.autorNombre && (
                                    <p className="text-sky-400/80 text-xs font-semibold mt-1">por {item.autorNombre}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-1 bg-[#1a1a1a] px-2 py-1 rounded-md border border-gray-700 shrink-0">
                                <span className="text-yellow-500 text-xs">★</span>
                                <span className="text-xs font-bold">{item.valoracionMedia > 0 ? item.valoracionMedia.toFixed(1) : 'Nuevo'}</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2">{item.descripcion}</p>

                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-1.5 w-full overflow-hidden whitespace-nowrap">
                                <PrecioOferta
                                    precioOriginal={item.precioOriginal}
                                    precioOferta={item.precioOferta}
                                    size="sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        if (item.esPack) navigate(`/merchandising/pack/${item.dbId}`);
                                        else {
                                            const esProyecto = (item.tipoOriginal?.toLowerCase().includes('tatuaje') ||
                                                item.tipoOriginal?.toLowerCase().includes('plantilla'));
                                            navigate(`${esProyecto ? '/proyecto' : '/merchandising'}/${item.dbId}`);
                                        }
                                    }}
                                    className="w-full py-2.5 bg-sky-600/80 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                                >
                                    Ver Detalles
                                </button>

                                {/* Botón de acción secundario */}
                                {(() => {
                                    const esServicio = item.tipo === 'servicio' || item.tipo === 'plantilla';
                                    if (!isLoggedIn) {
                                        return (
                                            <button
                                                onClick={() => navigate('/login')}
                                                className="w-full py-2.5 bg-gray-700/60 hover:bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-gray-600"
                                            >
                                                {esServicio ? '📅 Inicia sesión para cita' : '🛒 Inicia sesión para comprar'}
                                            </button>
                                        );
                                    }
                                    if (esServicio) {
                                        return (
                                            <button
                                                onClick={() => {
                                                    const payload = {
                                                        trabajadorId: item.autorId,
                                                        ...(item.esPack ? { packId: item.dbId } : { proyectoId: item.dbId })
                                                    };
                                                    navigate('/cita', { state: payload });
                                                }}
                                                className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                                            >
                                                📅 Reservar Cita
                                            </button>
                                        );
                                    }
                                    return (
                                        <button
                                            onClick={() => { }}
                                            className="w-full py-2.5  bg-white/10 hover:bg-white/15 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
                                        >
                                            🛒 Añadir al Carrito
                                        </button>
                                    );
                                })()}

                                {puedeEditar && (
                                    <BotonesAdmin
                                        onEditar={() => {
                                            if (item.esPack) navigate(`/editarPack/${item.dbId}`);
                                            else if (item.tipo === 'producto') navigate(`/editarProducto/${item.dbId}`);
                                            else navigate(`/editarProyecto/${item.dbId}`);
                                        }}
                                        onEliminar={() => onEliminar(item.idUnico, item.dbId, item.esPack, item.tipo === 'producto')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
