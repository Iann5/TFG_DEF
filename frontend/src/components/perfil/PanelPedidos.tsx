import { useState, useEffect } from 'react';
import api from '../../services/api';
import { type Pedido } from '../../types/pedido';


interface Props {
    userId: number | null;
}

export default function PanelPedidos({ userId }: Props) {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchPedidos = async () => {
            try {
                // Fetch orders for this user using ApiPlatform filter
                const res = await api.get(`/pedidos?usuario=${userId}`);
                const data = res.data['hydra:member'] || res.data;
                
                // Filtrar pedidos que tengan más de 3 días (3 * 24 * 60 * 60 * 1000 ms)
                const now = new Date().getTime();
                const limiteMs = 3 * 24 * 60 * 60 * 1000;
                
                const pedidosRecientes = data.filter((p: Pedido) => {
                    const orderDate = new Date(p.fecha_compra).getTime();
                    return (now - orderDate) <= limiteMs;
                });

                // Sort by date descending (newest first)
                const pedidosOrdenados = pedidosRecientes.sort((a: Pedido, b: Pedido) => {
                    return new Date(b.fecha_compra).getTime() - new Date(a.fecha_compra).getTime();
                });

                setPedidos(pedidosOrdenados);
            } catch (error) {
                console.error("Error al cargar pedidos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPedidos();
    }, [userId]);

    const formatFecha = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
                <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                <span className="font-label text-xs uppercase tracking-widest text-outline">Cargando Pedidos...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 mt-4">
            <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    Tus Pedidos
                </h2>
                <div className="w-full h-px bg-outline-variant/30 mb-2"></div>
            </div>

            {pedidos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface-container-highest/30 rounded-sm border border-outline-variant/20 border-dashed text-center">
                    <span className="material-symbols-outlined text-outline-variant text-4xl mb-3">inventory_2</span>
                    <p className="text-on-surface-variant font-body text-sm">
                        Aún no has realizado ningún pedido.
                    </p>
                    <p className="text-[#8c909f] font-label text-[10px] uppercase tracking-widest mt-2">
                        ¡Visita nuestra tienda de merchandising!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pedidos.map(pedido => (
                        <div
                            key={pedido.id}
                            className="bg-surface-container-highest/50 border border-outline-variant/20 rounded-sm overflow-hidden flex flex-col group transition-all hover:border-primary/50"
                        >
                            {/* Cabecera del pedido */}
                            <div className="bg-surface-container-highest p-4 flex justify-between items-center border-b border-outline-variant/10">
                                <div className="flex flex-col">
                                    <span className="font-headline font-bold text-on-surface text-lg leading-tight flex items-center gap-2">
                                        Pedido #{pedido.id}
                                    </span>
                                    <span className="font-label text-[10px] text-outline uppercase tracking-widest">
                                        {formatFecha(pedido.fecha_compra)}
                                    </span>
                                </div>
                                <span className={`px-3 py-1 rounded-sm text-[10px] font-label uppercase tracking-widest font-bold border flex items-center gap-1
                                    ${pedido.estado === 'Entregado' ? 'bg-[#2e5d36]/20 text-[#2e5d36] border-[#2e5d36]/30' :
                                        pedido.estado === 'Devuelto' || pedido.estado === 'Cancelado' ? 'bg-error-container/50 text-error border-error/50' :
                                        pedido.estado === 'Enviado' ? 'bg-[#d2a33f]/20 text-[#d2a33f] border-[#d2a33f]/30' :
                                            'bg-primary/10 text-primary border-primary/30'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[12px]">
                                        {pedido.estado === 'Entregado' ? 'check_circle' : 
                                         pedido.estado === 'Devuelto' || pedido.estado === 'Cancelado' ? 'cancel' : 
                                         pedido.estado === 'Enviado' ? 'local_shipping' : 'pending_actions'}
                                    </span>
                                    {pedido.estado || 'Pendiente'}
                                </span>
                            </div>

                            {/* Info del pedido */}
                            <div className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center bg-surface-container p-3 rounded-sm border border-outline-variant/10">
                                    <span className="font-label text-[10px] uppercase tracking-widest text-[#8c909f]">Total pagado</span>
                                    <span className="font-headline font-black text-primary text-xl">{pedido.total.toFixed(2)} €</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-1">
                                    <div className="flex flex-col">
                                        <span className="font-label text-[10px] uppercase tracking-widest text-outline mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">payment</span>
                                            Método de Pago
                                        </span>
                                        <span className="font-body text-sm text-on-surface-variant capitalize">{pedido.metodo_pago}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-label text-[10px] uppercase tracking-widest text-outline mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                                            Envío a
                                        </span>
                                        <span className="font-body text-sm text-on-surface-variant truncate" title={`${pedido.direccion}, ${pedido.localidad}`}>
                                            {pedido.localidad} ({pedido.cp})
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Lista de Productos */}
                                {pedido.lineaPedidos && pedido.lineaPedidos.length > 0 && (
                                    <div className="mt-3 border-t border-outline-variant/20 pt-3">
                                        <span className="font-label text-[10px] uppercase tracking-widest text-[#8c909f] mb-2 block">
                                            Artículos ({pedido.lineaPedidos.length})
                                        </span>
                                        <div className="flex flex-wrap gap-3">
                                            {pedido.lineaPedidos.map((linea, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-surface-container/50 pr-3 rounded-sm border border-outline-variant/10 overflow-hidden">
                                                    <div className="w-10 h-10 bg-surface-container-highest shrink-0 relative overflow-hidden">
                                                        {linea.producto?.imagen ? (
                                                            <img 
                                                                src={linea.producto.imagen} 
                                                                alt={linea.producto.nombre} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined absolute inset-0 m-auto text-outline/50 flex items-center justify-center text-[16px]">image</span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col py-1">
                                                        <span className="text-[10px] font-label font-bold uppercase truncate max-w-[100px] text-on-surface" title={linea.producto?.nombre}>
                                                            {linea.producto?.nombre || 'Producto'}
                                                        </span>
                                                        <span className="text-[9px] font-label text-outline uppercase tracking-widest">
                                                            {linea.cantidad}x — {linea.precio.toFixed(2)}€
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
