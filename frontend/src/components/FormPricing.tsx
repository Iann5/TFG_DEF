import type { ChangeEvent } from 'react';

interface FormPricingProps {
    precioOriginal: string;
    precioOferta: string | null;
    porcentajeDescuento: string;
    onPrecioOriginalChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onPorcentajeChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function FormPricing({
    precioOriginal,
    precioOferta,
    porcentajeDescuento,
    onPrecioOriginalChange,
    onPorcentajeChange
}: FormPricingProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-outline-variant/30 mt-6 relative z-10 block">
            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                <label className="text-outline font-label text-xs tracking-[0.2em] uppercase block mb-1">
                    Precio Original (€)
                </label>
                <input
                    type="text"
                    name="precioOriginal"
                    value={precioOriginal}
                    placeholder="Ej: 25.50"
                    onChange={onPrecioOriginalChange}
                    required
                    className="w-full bg-surface-container border border-outline-variant/30 p-3 font-body text-base outline-none focus:border-primary transition-colors text-on-surface placeholder:text-outline-variant/50 rounded-sm w-[99%]"
                />
            </div>

            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                <label className="text-secondary-container font-label text-xs tracking-[0.2em] uppercase block mb-1">
                    Descuento (%)
                </label>
                <div className="relative w-full">
                    <input
                        type="number"
                        value={porcentajeDescuento}
                        onChange={onPorcentajeChange}
                        placeholder="0"
                        min="0"
                        max="100"
                        className="w-full bg-surface-container border border-secondary-container/30 p-3 font-body text-base outline-none focus:border-secondary-container transition-colors text-secondary-container placeholder:text-secondary-container/30 rounded-sm"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary-container/50 pointer-events-none">percent</span>
                </div>
            </div>

            <div className="space-y-2 relative group flex flex-col items-start block overflow-visible">
                <label className="text-primary font-label text-xs tracking-[0.2em] uppercase block mb-1">
                    Precio Final (€)
                </label>
                <div className="relative w-full">
                    <input
                        type="text"
                        value={precioOferta || precioOriginal || '0'}
                        readOnly
                        className="w-full bg-primary/5 border border-primary/50 pe-10 p-3 font-headline font-bold text-xl outline-none text-primary cursor-not-allowed rounded-sm w-full"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none">euro</span>
                </div>
            </div>
        </div>
    );
}
