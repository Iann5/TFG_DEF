import type { ChangeEvent } from 'react';
import type { CategoriaPromo, OrdenPromocion, EstadoFiltros } from '../../types/Oferta';

interface Props {
    filtros: EstadoFiltros;
    setFiltros: (f: EstadoFiltros) => void;
    onToggleCategoria: (cat: CategoriaPromo) => void;
}

export default function FiltrosPromociones({ filtros, setFiltros, onToggleCategoria }: Props) {
    return (
        <div className="glass-panel p-6 mb-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative group disabled:opacity-50">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors z-10">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full bg-surface-container/50 border border-outline-variant/30 pl-10 pr-3 py-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm"
                        value={filtros.busqueda}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    />
                </div>
                <div className="relative min-w-[250px] group">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors z-10">sort</span>
                    <select
                        className="w-full bg-surface-container/50 border border-outline-variant/30 pl-10 pr-10 py-3 font-body text-base outline-none text-on-surface cursor-pointer focus:border-primary transition-colors rounded-sm appearance-none"
                        value={filtros.orden}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as OrdenPromocion })}
                    >
                        <option value="reciente">Novedades (Más recientes)</option>
                        <option value="antiguo">Más antiguos</option>
                        <option value="valoracionAlta">Mejor valorados</option>
                        <option value="valoracionBaja">Menor valorados</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">expand_more</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-outline-variant/30">
                <div className="flex flex-wrap gap-4 items-center">
                    <span className="font-label text-xs tracking-[0.2em] uppercase text-outline mr-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">filter_list</span>
                        Filtrar por:
                    </span>
                    {(['servicio', 'plantilla', 'producto'] as CategoriaPromo[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => onToggleCategoria(cat)}
                            className={`px-4 py-2 font-label text-xs tracking-wide uppercase transition-all rounded-sm flex items-center gap-2 ${filtros.categorias.includes(cat)
                                ? 'bg-primary/20 text-primary border border-primary/50 font-bold'
                                : 'bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:border-primary/50 hover:text-on-surface'
                                }`}
                        >
                            {cat}s {filtros.categorias.includes(cat) && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-outline-variant/30 hidden md:block" />
                <div className="relative min-w-[250px] group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none group-focus-within:text-primary transition-colors z-10">category</span>
                    <select
                        className="w-full bg-surface-container/50 border border-outline-variant/30 pl-10 pr-10 py-3 font-body text-base outline-none text-on-surface cursor-pointer focus:border-primary rounded-sm transition-colors appearance-none"
                        value={filtros.filtroPacks}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, filtroPacks: e.target.value as EstadoFiltros['filtroPacks'] })}
                    >
                        <option value="todos">Todos los packs</option>
                        <option value="solo-oferta">Ofertas Activas</option>
                        <option value="sin-oferta">Solo sin oferta</option>
                    </select>
                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline-variant">expand_more</span>
                </div>
            </div>
        </div>
    );
}
