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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Precio Original (€)</label>
                <input
                    type="text"
                    name="precioOriginal"
                    value={precioOriginal}
                    placeholder="Ej: 25.50"
                    onChange={onPrecioOriginalChange}
                    required
                    className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-sky-500 transition-all text-white placeholder-gray-600"
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-400 text-sm font-bold uppercase tracking-wider block">Descuento (%)</label>
                <input
                    type="number"
                    value={porcentajeDescuento}
                    onChange={onPorcentajeChange}
                    placeholder="0"
                    min="0"
                    max="100"
                    className="w-full bg-[#1C1B28] border border-white/10 p-4 rounded-xl outline-none focus:border-yellow-500 transition-all text-yellow-400 placeholder-gray-600"
                />
            </div>

            <div className="space-y-2">
                <label className="text-green-500/80 text-sm font-bold uppercase tracking-wider block">Precio Final (€)</label>
                <input
                    type="text"
                    value={precioOferta || precioOriginal || '0'}
                    readOnly
                    className="w-full bg-[#1C1B28] border border-green-500/30 p-4 rounded-xl outline-none text-green-400 font-bold opacity-80 cursor-not-allowed"
                />
            </div>
        </div>
    );
}
