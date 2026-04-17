interface PrecioOfertaProps {
    precioOriginal: number;
    precioOferta: number | null;
    /** 'lg' muestra el precio en size más grande (páginas de detalle), 'sm' en tamaño normal (tarjetas). */
    size?: 'sm' | 'lg';
}

/**
 * Muestra el precio con descuento tachado y badge "OFERTA" si hay precio de oferta,
 * o solo el precio original si no la hay.
 */
export default function PrecioOferta({ precioOriginal, precioOferta, size = 'lg' }: PrecioOfertaProps) {
    const precioPrincipalClass = size === 'lg'
        ? 'text-primary font-headline font-bold text-3xl'
        : 'text-primary font-headline font-bold text-xl sm:text-2xl';

    const precioNormalClass = size === 'lg'
        ? 'text-on-surface font-headline font-bold text-3xl'
        : 'text-on-surface font-headline font-bold text-xl sm:text-2xl';

    if (precioOferta !== null) {
        return (
            <div className="flex items-center gap-2 w-full whitespace-nowrap">
                <span className="text-error font-headline font-semibold line-through text-xs sm:text-sm shrink-0 opacity-70 mb-1">{precioOriginal.toFixed(2)} €</span>
                <span className={`${precioPrincipalClass} shrink-0 truncate`}>{precioOferta.toFixed(2)} €</span>
                <span className="bg-error/55 border border-error/60 text-white text-[9px] sm:text-[10px] font-label px-1.5 py-0.5 rounded-sm shrink-0 ml-auto flex-none uppercase tracking-[0.2em] mb-1">OFERTA</span>
            </div>
        );
    }

    return (
        <span className={`${precioNormalClass} whitespace-nowrap block`}>{precioOriginal.toFixed(2)} €</span>
    );
}
