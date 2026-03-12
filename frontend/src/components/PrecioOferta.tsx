interface PrecioOfertaProps {
    precioOriginal: number;
    precioOferta: number | null;
    /** 'lg' muestra el precio en text-3xl (páginas de detalle), 'sm' en tamaño normal (tarjetas). Por defecto 'lg'. */
    size?: 'sm' | 'lg';
}

/**
 * Muestra el precio con descuento tachado y badge "OFERTA" si hay precio de oferta,
 * o solo el precio original si no la hay.
 */
export default function PrecioOferta({ precioOriginal, precioOferta, size = 'lg' }: PrecioOfertaProps) {
    const precioPrincipalClass = size === 'lg'
        ? 'text-green-400 font-bold text-3xl'
        : 'text-green-400 font-bold text-xl sm:text-2xl';

    const precioNormalClass = size === 'lg'
        ? 'text-white font-bold text-3xl'
        : 'text-white font-bold text-xl sm:text-2xl';

    if (precioOferta !== null) {
        return (
            <div className="flex items-center gap-1.5 w-full whitespace-nowrap">
                <span className="text-white/40 line-through text-xs sm:text-sm shrink-0">{precioOriginal.toFixed(2)} €</span>
                <span className={`${precioPrincipalClass} shrink-0 truncate`}>{precioOferta.toFixed(2)} €</span>
                <span className="bg-green-900/40 text-green-400 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-auto flex-none uppercase tracking-widest">OFERTA</span>
            </div>
        );
    }

    return (
        <span className={`${precioNormalClass} whitespace-nowrap block`}>{precioOriginal.toFixed(2)} €</span>
    );
}
