import Navbar from '../components/Navbar';
import { useVistaDia, collectCitaImagenes, formatearHora } from '../hooks/useVistaDia';

export default function VistaDia() {
    const {
        citas, loading, error, editingId, editData, setEditData,
        trabajadorId, navigate, iniciarEdicion, cancelarEdicion,
        guardarCambios, dateTitle
    } = useVistaDia();

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
                    {/* Header y Navegación */}
                    <div className="mb-12">
                         <button
                            onClick={() => {
                                if (trabajadorId) {
                                    navigate(`/agenda/${trabajadorId}`);
                                } else {
                                    navigate('/agenda');
                                }
                            }}
                            className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest mb-10 transition-colors group w-fit"
                        >
                            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Volver al Mes
                        </button>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/20 pb-8">
                            <div>
                                <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block mb-2">
                                    Detalles Diarios
                                </span>
                                <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none flex items-center gap-4">
                                    Agenda del Día
                                    <span className="material-symbols-outlined text-primary text-4xl mb-1">view_agenda</span>
                                </h1>
                            </div>
                            <div className="bg-primary/10 border border-primary/30 px-6 py-3 rounded-sm relative overflow-hidden group self-start md:self-auto">
                                <div className="absolute inset-0 bg-halftone opacity-20 Mix blend overlay pointer-events-none"></div>
                                <h2 className="font-headline font-bold text-lg md:text-xl tracking-wider text-primary uppercase relative z-10">
                                    {dateTitle}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-70">
                            <span className="material-symbols-outlined text-primary text-5xl animate-spin mb-6">refresh</span>
                            <p className="font-label text-xs uppercase tracking-widest text-outline">Cargando Citas...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-error/10 border border-error/30 p-8 flex flex-col items-center justify-center py-20 rounded-sm">
                            <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
                            <span className="font-headline text-xl uppercase tracking-widest text-error mb-2">¡Error!</span>
                            <p className="font-body text-sm text-error/80 uppercase tracking-wider">{error}</p>
                        </div>
                    ) : citas.length === 0 ? (
                        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center relative overflow-hidden font-inter">
                             <div className="absolute inset-0 bg-halftone opacity-10 pointer-events-none"></div>
                             
                             <div className="w-24 h-24 rounded-full bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center mb-6 relative z-10">
                                <span className="material-symbols-outlined text-outline-variant text-[48px]">event_busy</span>
                             </div>
                             <h2 className="font-headline text-2xl uppercase tracking-widest text-on-surface mb-4 relative z-10">¡Día Libre!</h2>
                             <p className="font-body text-sm text-on-surface-variant max-w-md uppercase tracking-wider relative z-10">
                                {trabajadorId 
                                    ? 'No hay ninguna reserva apuntada para este trabajador en este día.' 
                                    : 'No tienes ninguna reserva apuntada para este día.'}
                             </p>
                        </div>
                    ) : (
                        <div className="space-y-10 relative">
                            {/* Línea temporal vertical (Timeline) */}
                            <div className="absolute top-0 bottom-0 left-[23px] sm:left-12 w-0.5 bg-outline-variant/20 hidden sm:block"></div>
                            
                            {citas.map((cita) => {
                                const isEditing = editingId === cita.id;
                                
                                const imagenes = collectCitaImagenes(cita);

                                const renderImagen = (url: string) => (
                                    <div
                                        key={url.slice(0, 120)}
                                        className="w-24 h-24 sm:w-32 sm:h-32 bg-surface-container-highest border border-outline-variant/20 relative overflow-hidden group rounded-sm shrink-0"
                                    >
                                        <div className="absolute inset-0 bg-halftone opacity-20 group-hover:opacity-0 transition-opacity pointer-events-none"></div>
                                        <img
                                            src={url}
                                            alt="Referencia del diseño"
                                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                );
                                
                                // Determinar estilos según estado
                                let estadoStyles = 'bg-surface-container border-outline-variant/30 text-outline';
                                let estadoIcon = 'schedule';
                                if (cita.estado === 'Confirmada') {
                                    estadoStyles = 'bg-green-500/10 border-green-500/50 text-green-500';
                                    estadoIcon = 'check_circle';
                                } else if (cita.estado === 'Cancelada') {
                                    estadoStyles = 'bg-error/10 border-error/50 text-error';
                                    estadoIcon = 'cancel';
                                } else if (cita.estado === 'Pendiente') {
                                    estadoStyles = 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500';
                                    estadoIcon = 'hourglass_bottom';
                                }

                                return (
                                    <div key={cita.id} className="relative sm:pl-28 group/cita">
                                        {/* Círculo indicador en la línea temporal */}
                                        <div className={`absolute left-[11px] sm:left-[35px] top-10 w-6 h-6 rounded-full border-4 border-background z-10 hidden sm:flex items-center justify-center ${estadoStyles.split(' ')[0]} transition-transform duration-300 group-hover/cita:scale-110`}>
                                        </div>
                                        
                                        <div className={`glass-panel p-6 sm:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden transition-all duration-300 border-l-[3px] border-l-transparent hover:border-l-primary`}>
                                            
                                            {/* Decoración sutil superior */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] pointer-events-none opacity-0 group-hover/cita:opacity-100 transition-opacity duration-500"></div>

                                            {/* Información Fija / Lectura */}
                                            <div className="flex-1 space-y-6 relative z-10">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="material-symbols-outlined text-primary text-[28px] opacity-80">schedule</span>
                                                        <h3 className="font-headline text-2xl sm:text-3xl font-bold tracking-wide text-on-surface">
                                                            {formatearHora(cita.hora_inicio)} - {formatearHora(cita.hora_fin)}
                                                        </h3>
                                                    </div>
                                                    <div className={`px-4 py-1.5 font-label text-xs tracking-widest uppercase border rounded-sm flex items-center gap-2 ${estadoStyles}`}>
                                                        <span className="material-symbols-outlined text-[16px]">{estadoIcon}</span>
                                                        {cita.estado}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-8">
                                                    <div className="flex-1 space-y-4 font-body text-sm">
                                                        {/* Info del Cliente */}
                                                        <div className="bg-surface-container/50 border-l-2 border-primary p-4 shrink-0 rounded-r-sm">
                                                            <span className="block font-label text-[10px] text-primary tracking-widest uppercase mb-1">Cliente</span>
                                                            <span className="font-headline font-bold text-base text-on-surface uppercase">
                                                                {cita.usuario?.nombre || 'Desconocido'} {cita.usuario?.apellidos || ''}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Detalles Tipo y Tamaño */}
                                                        <div className="flex flex-wrap gap-4">
                                                            <div className="bg-surface-container-highest border border-outline-variant/20 p-4 shrink-0 min-w-[120px] rounded-sm">
                                                                <span className="block font-label text-[10px] text-outline tracking-widest uppercase mb-1">Tipo</span>
                                                                <span className="font-bold text-on-surface uppercase">{cita.tipo_cita}</span>
                                                            </div>
                                                            
                                                            {cita.tamano_cm && (
                                                                <div className="bg-surface-container-highest border border-outline-variant/20 p-4 shrink-0 min-w-[120px] rounded-sm">
                                                                    <span className="block font-label text-[10px] text-outline tracking-widest uppercase mb-1">Tamaño</span>
                                                                    <span className="font-bold text-on-surface uppercase">{cita.tamano_cm} cm</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Nota/Descripción */}
                                                        {cita.descripcion && (
                                                            <div className="mt-4 bg-surface-container p-4 border border-outline-variant/20 rounded-sm relative text-on-surface italic opacity-90 text-[15px] leading-relaxed">
                                                                <span className="absolute -top-3 left-4 bg-background px-2 font-label text-[9px] text-primary tracking-[0.2em] uppercase border border-outline-variant/20 rounded-xs">
                                                                    Nota
                                                                </span>
                                                                "{cita.descripcion}"
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Galería de referencias */}
                                                    {imagenes.length > 0 && (
                                                        <div className="flex flex-wrap gap-4 shrink-0 justify-start items-start border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 pl-0 md:pl-8">
                                                            {imagenes.map(renderImagen)}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Proyectos asociados */}
                                                {cita.proyectos && cita.proyectos.length > 0 && (
                                                    <div className="mt-6 pt-6 border-t border-outline-variant/20">
                                                        <p className="font-label text-xs tracking-widest text-outline mb-4 uppercase flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-[16px] text-primary">collections_bookmark</span>
                                                            Proyectos Elegidos
                                                        </p>
                                                        <div className="flex flex-wrap gap-3">
                                                            {cita.proyectos.map((p) => (
                                                                <div key={p.id} className="bg-surface-container border border-outline-variant/30 px-4 py-2 text-on-surface font-label text-[10px] uppercase tracking-wider rounded-sm hover:border-primary/50 transition-colors">
                                                                    {p.nombre}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Panel Lateral: Formulario o Gestión */}
                                            <div className="w-full md:w-[280px] shrink-0 bg-surface-container-highest border border-outline-variant/20 rounded-sm relative overflow-hidden flex flex-col">
                                                
                                                {isEditing ? (
                                                    <div className="flex flex-col gap-5 p-6 h-full font-body">
                                                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-1">
                                                            <span className="font-headline text-sm uppercase tracking-widest text-primary font-bold">Editar Cita</span>
                                                            <span className="material-symbols-outlined text-[20px] text-outline opacity-50">edit</span>
                                                        </div>
                                                        
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline block mb-1.5">Fecha</label>
                                                                <input
                                                                    type="date"
                                                                    value={editData.fecha}
                                                                    onChange={e => setEditData({ ...editData, fecha: e.target.value })}
                                                                    className="w-full bg-surface-container border border-outline-variant/30 p-2 text-sm text-on-surface outline-none focus:border-primary rounded-sm transition-colors"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline block mb-1.5">Inicio</label>
                                                                    <input
                                                                        type="time"
                                                                        value={editData.horaInicio}
                                                                        onChange={e => setEditData({ ...editData, horaInicio: e.target.value })}
                                                                        className="w-full bg-surface-container border border-outline-variant/30 p-2 text-sm text-on-surface outline-none focus:border-primary rounded-sm transition-colors"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline block mb-1.5">Fin</label>
                                                                    <input
                                                                        type="time"
                                                                        value={editData.horaFin}
                                                                        onChange={e => setEditData({ ...editData, horaFin: e.target.value })}
                                                                        className="w-full bg-surface-container border border-outline-variant/30 p-2 text-sm text-on-surface outline-none focus:border-primary rounded-sm transition-colors"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-outline block mb-1.5">Estado</label>
                                                                <div className="relative">
                                                                    <select
                                                                        value={editData.estado}
                                                                        onChange={e => setEditData({ ...editData, estado: e.target.value })}
                                                                        className="w-full bg-surface-container border border-outline-variant/30 p-2 text-sm text-on-surface outline-none focus:border-primary rounded-sm transition-colors uppercase font-label cursor-pointer appearance-none pr-8"
                                                                    >
                                                                        <option value="Pendiente">Pendiente</option>
                                                                        <option value="Confirmada">Confirmada</option>
                                                                        <option value="Cancelada">Cancelada</option>
                                                                    </select>
                                                                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-outline-variant pointer-events-none">expand_more</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col gap-2 mt-auto pt-4">
                                                            <button
                                                                onClick={() => guardarCambios(cita.id)}
                                                                className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 p-2 text-xs uppercase tracking-widest rounded-sm transition-colors font-bold flex items-center justify-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">save</span>
                                                                Guardar
                                                            </button>
                                                            <button
                                                                onClick={cancelarEdicion}
                                                                className="w-full bg-surface-container hover:bg-surface-container-highest text-outline border border-outline-variant/30 p-2 text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col h-full bg-surface-container/50">
                                                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-b border-outline-variant/10">
                                                            <div className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center mb-4">
                                                                <span className="material-symbols-outlined text-outline">settings</span>
                                                            </div>
                                                            <span className="font-label text-[10px] uppercase tracking-widest text-outline">Panel de Gestión</span>
                                                        </div>
                                                        <button
                                                            onClick={() => iniciarEdicion(cita)}
                                                            className="w-full bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface p-4 font-headline text-sm tracking-widest uppercase transition-colors flex items-center justify-center gap-2 group border-t border-outline-variant/20 hover:border-transparent cursor-pointer relative z-20"
                                                        >
                                                            Gestionar Cita
                                                            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform duration-300">app_settings_alt</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
