import type { ChangeEvent } from 'react';
import type { CategoriaPromo, OrdenPromocion, EstadoFiltros } from '../../types/Oferta';

interface Props {
    filtros: EstadoFiltros;
    setFiltros: (f: EstadoFiltros) => void;
    onToggleCategoria: (cat: CategoriaPromo) => void;
}

export default function FiltrosPromociones({ filtros, setFiltros, onToggleCategoria }: Props) {
    return (
        <div className="bg-[#2a2a2a] p-6 rounded-2xl mb-10 space-y-6 shadow-xl border border-gray-800">
            <div className="flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="flex-1 bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 outline-none focus:border-sky-500 text-white transition-all"
                    value={filtros.busqueda}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
                <select
                    className="bg-[#1a1a1a] p-3 rounded-xl border border-gray-700 outline-none text-white cursor-pointer hover:border-sky-500 transition-all"
                    value={filtros.orden}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as OrdenPromocion })}
                >
                    <option value="reciente">Novedades (Más recientes)</option>
                    <option value="antiguo">Más antiguos</option>
                    <option value="valoracionAlta">Mejor valorados a Menor</option>
                    <option value="valoracionBaja">Menor valorados a Mayor</option>
                </select>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-700">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 text-sm mr-2 uppercase tracking-wide font-bold">Filtrar por:</span>
                    {(['servicio', 'plantilla', 'producto'] as CategoriaPromo[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => onToggleCategoria(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all border ${filtros.categorias.includes(cat)
                                ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-500/30'
                                : 'bg-transparent text-gray-400 border-gray-600 hover:border-gray-400'
                                }`}
                        >
                            {cat}s {filtros.categorias.includes(cat) ? '✓' : ''}
                        </button>
                    ))}
                </div>
                <div className="h-6 w-px bg-gray-700 hidden md:block" />
                <select
                    className="bg-[#1a1a1a] p-2 rounded-xl border border-gray-700 outline-none text-sm text-gray-300 cursor-pointer"
                    value={filtros.filtroPacks}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, filtroPacks: e.target.value as EstadoFiltros['filtroPacks'] })}
                >
                    <option value="todos">Todos los Packs</option>
                    <option value="solo-oferta">Solo Packs en Oferta y Ofertas</option>
                    <option value="sin-oferta">Solo Packs sin Oferta</option>
                </select>
            </div>
        </div>
    );
}
