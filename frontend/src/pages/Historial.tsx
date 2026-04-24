import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { type FiltroRol } from '../types/historial';
import { useHistorial } from '../hooks/useHistorial';

export default function Historial() {
    const {
        loading,
        expanded,
        filtroRol,
        setFiltroRol,
        busquedaUsuario,
        setBusquedaUsuario,
        usuarioSeleccionado,
        setUsuarioSeleccionado,
        toggleExpand,
        getPedidoUsuarioNombre,
        getPedidoUsuarioEmail,
        getTipoRol,
        usuariosFiltrados,
        pedidosMostrados
    } = useHistorial();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-4">refresh</span>
                <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Revisando archivos...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
                    {/* Header */}
                    <div className="mb-16 flex items-end gap-6 border-b border-outline-variant/20 pb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-3xl">shopping_bag</span>
                        </div>
                        <div>
                            <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block mb-2">Administración</span>
                            <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none">
                                Historial de Ventas
                            </h1>
                        </div>
                    </div>

                    <div className="glass-panel p-6 md:p-8 mb-10">
                        <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between mb-6">
                            <div>
                                <h2 className="font-headline text-2xl uppercase tracking-wide text-on-surface">Usuarios del sistema</h2>
                                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline mt-1">
                                    Filtra por rol y busca por nombre
                                </p>
                            </div>
                            {usuarioSeleccionado && (
                                <button
                                    onClick={() => setUsuarioSeleccionado(null)}
                                    className="px-4 py-2 border border-outline-variant/30 text-on-surface hover:text-primary hover:border-primary/50 rounded-sm font-label text-[10px] uppercase tracking-[0.2em] transition-colors"
                                >
                                    Mostrar historial completo
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-2">Rol</label>
                                <select
                                    value={filtroRol}
                                    onChange={(e) => setFiltroRol(e.target.value as FiltroRol)}
                                    className="w-full p-3 bg-surface-container border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm focus:outline-none focus:border-primary"
                                >
                                    <option value="TODOS">Todos</option>
                                    <option value="USUARIO">Usuarios</option>
                                    <option value="TRABAJADOR">Trabajadores</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-outline mb-2">Buscar</label>
                                <input
                                    type="text"
                                    value={busquedaUsuario}
                                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                                    placeholder="Nombre o apellidos..."
                                    className="w-full p-3 bg-surface-container border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm focus:outline-none focus:border-primary placeholder:text-outline-variant/60"
                                />
                            </div>
                        </div>


                    </div>

                    {usuarioSeleccionado && (
                        <div className="mb-6">
                            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
                                Mostrando historial de: {(usuarioSeleccionado.nombre || '').trim()} {(usuarioSeleccionado.apellidos || '').trim()} (#{usuarioSeleccionado.id})
                            </p>
                        </div>
                    )}

                    {pedidosMostrados.length === 0 ? (
                        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-outline-variant text-[48px]">inventory_2</span>
                            </div>
                            <h2 className="font-headline text-2xl uppercase tracking-widest text-on-surface mb-2">Registro Vacío</h2>
                            <p className="font-body text-sm text-on-surface-variant max-w-md">
                                {usuarioSeleccionado
                                    ? 'Este usuario no tiene pedidos registrados.'
                                    : 'Aún no se ha procesado ningún pedido en el sistema. Las ventas realizadas aparecerán aquí.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {pedidosMostrados.map(pedido => {
                                const isExpanded = expanded === pedido.id;
                                const fecha = new Date(pedido.fechaCompra || pedido.fecha_compra || '').toLocaleDateString('es-ES', {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                                const metodoPago = pedido.metodoPago || pedido.metodo_pago || 'Desconocido';

                                return (
                                    <div key={pedido.id} className={`glass-panel overflow-hidden transition-all duration-300 ${isExpanded ? 'border-primary/50' : 'border-outline-variant/30'}`}>
                                        <div
                                            onClick={() => toggleExpand(pedido.id)}
                                            className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-container-highest transition-colors relative"
                                        >
                                            {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}

                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                                <div>
                                                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">ID Pedido</p>
                                                    <p className="font-headline font-bold text-xl text-on-surface">#{pedido.id.toString().padStart(5, '0')}</p>
                                                </div>
                                                <div>
                                                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">Fecha</p>
                                                    <p className="font-body text-sm font-semibold flex items-center gap-1.5 text-on-surface">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                                                        {fecha}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">Cliente</p>
                                                    <p className="font-body text-sm font-semibold flex items-center gap-1.5 text-on-surface min-w-0">
                                                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0">person</span>
                                                        <span className="truncate flex-1 min-w-0">{getPedidoUsuarioNombre(pedido)}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="font-label text-[10px] uppercase tracking-widest text-outline mb-1">Importe</p>
                                                    <p className="font-headline font-bold text-xl text-primary">{pedido.total.toFixed(2)} €</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 shrink-0 mt-4 md:mt-0 lg:ml-8 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-6">
                                                <span className={`px-3 py-1 font-label text-[10px] uppercase tracking-widest rounded-sm border 
                                                    ${pedido.estado.toLowerCase() === 'entregado' ? 'bg-primary/10 text-primary border-primary/30' :
                                                        pedido.estado.toLowerCase() === 'cancelado' ? 'bg-error/10 text-error border-error/30' :
                                                            'bg-surface-container-highest text-on-surface border-outline-variant/30'}`}>
                                                    {pedido.estado}
                                                </span>
                                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isExpanded ? 'border-primary text-primary bg-primary/10' : 'border-outline-variant/30 text-outline hover:border-primary hover:text-primary'}`}>
                                                    <span className="material-symbols-outlined text-[20px]">
                                                        {isExpanded ? 'expand_less' : 'expand_more'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contenido expandido */}
                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="p-6 md:p-8 bg-surface-container/50 border-t border-outline-variant/20 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                                                <div className="absolute inset-0 bg-gradient-to-b from-surface-container-highest/20 to-transparent pointer-events-none"></div>

                                                {/* Productos comprados */}
                                                <div className="lg:col-span-2 relative z-10">
                                                    <h4 className="font-label text-xs tracking-[0.2em] uppercase text-outline mb-6 pb-2 border-b border-outline-variant/20 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px] text-primary">inventory_2</span>
                                                        Artículos ({pedido.lineaPedidos?.length || 0})
                                                    </h4>

                                                    <div className="space-y-3">
                                                        {pedido.lineaPedidos && pedido.lineaPedidos.map(linea => (
                                                            <div key={linea.id} className="flex gap-4 p-4 bg-surface-container border border-outline-variant/30 rounded-sm items-center hover:border-primary/50 transition-colors">
                                                                <div className="w-16 h-16 bg-surface-container-highest border border-outline-variant/20 rounded-sm overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
                                                                    <div className="absolute inset-0 bg-halftone opacity-20 top-0 left-0"></div>
                                                                    {linea.producto?.imagen ? (
                                                                        <img src={linea.producto.imagen} alt="Producto" className="w-full h-full object-contain filter grayscale relative z-10" />
                                                                    ) : (
                                                                        <span className="material-symbols-outlined text-outline-variant text-[24px] relative z-10">image</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex-grow flex flex-col justify-center min-w-0">
                                                                    <p className="font-headline font-bold uppercase tracking-wide text-on-surface truncate text-sm mb-1">{linea.producto?.nombre || 'Producto Eliminado'}</p>
                                                                    <p className="font-label text-[10px] text-outline tracking-wider uppercase">Cant: <span className="text-on-surface-variant font-semibold">{linea.cantidad}</span></p>
                                                                </div>
                                                                <div className="shrink-0 text-right pl-4 border-l border-outline-variant/20">
                                                                    <p className="font-headline font-bold text-primary text-lg">{(linea.precio * linea.cantidad).toFixed(2)} €</p>
                                                                    {linea.cantidad > 1 && <p className="font-label text-[9px] text-outline uppercase">{linea.precio.toFixed(2)} € / ud</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-end mt-6 pt-4 border-t border-outline-variant/20">
                                                        <div className="flex items-center gap-6">
                                                            <span className="font-label text-[10px] uppercase tracking-widest text-outline">Total Abonado</span>
                                                            <span className="font-headline font-bold text-3xl text-primary">{pedido.total.toFixed(2)} €</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Detalles envío y pago */}
                                                <div className="lg:col-span-1 space-y-6 relative z-10">
                                                    <div className="bg-surface-container border border-outline-variant/30 rounded-sm p-6">
                                                        <h4 className="font-label text-[10px] tracking-[0.2em] uppercase text-outline mb-4 pb-2 border-b border-outline-variant/20 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                                                            Entrega
                                                        </h4>
                                                        <div className="font-body text-sm text-on-surface-variant space-y-1.5 pt-2">
                                                            <p className="font-headline font-bold text-on-surface uppercase tracking-wide text-base mb-2">{getPedidoUsuarioNombre(pedido)}</p>
                                                            <p>{pedido.direccion}</p>
                                                            <p>{pedido.cp} - {pedido.localidad}</p>
                                                            <p>{pedido.provincia}, {pedido.pais}</p>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-outline-variant/10">
                                                            <p className="font-label text-[10px] text-outline flex items-center gap-2 break-all">
                                                                <span className="material-symbols-outlined text-[14px]">mail</span>
                                                                {getPedidoUsuarioEmail(pedido)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-surface-container border border-outline-variant/30 rounded-sm p-6">
                                                        <h4 className="font-label text-[10px] tracking-[0.2em] uppercase text-outline mb-4 pb-2 border-b border-outline-variant/20 flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px] text-primary">credit_card</span>
                                                            Método de Pago
                                                        </h4>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-6 bg-surface-container-highest border border-outline-variant/30 rounded-sm flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-outline-variant text-[16px]">payments</span>
                                                            </div>
                                                            <p className="font-headline font-bold text-on-surface uppercase tracking-wide">
                                                                {metodoPago}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        </div>
    );
}
