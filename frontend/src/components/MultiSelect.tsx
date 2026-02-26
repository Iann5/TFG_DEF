// src/components/MultiSelect.tsx
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    placeholder?: string;
    options: SelectOption[];
    selected: string[];
    onChange: (vals: string[]) => void;
    className?: string;
}

/**
 * Dropdown multi-select que cierra al hacer clic fuera.
 * La última opción seleccionada tiene prioridad en ordenaciones exclusivas.
 */
export default function MultiSelect({ placeholder = 'Seleccionar', options, selected, onChange, className = '' }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggle = (val: string) =>
        onChange(selected.includes(val) ? selected.filter(s => s !== val) : [...selected, val]);

    const displayLabel = selected.length === 0
        ? placeholder
        : options.filter(o => selected.includes(o.value)).map(o => o.label).join(', ');

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2D2C3E] border border-white/10 rounded-lg text-white/70 text-sm hover:border-sky-500/40 transition min-w-[180px] justify-between"
            >
                <span className="truncate max-w-[150px]">{displayLabel}</span>
                <ChevronDown size={13} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full mt-1 right-0 z-50 bg-[#2D2C3E] border border-white/10 rounded-xl shadow-2xl min-w-[200px] py-1">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => toggle(opt.value)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-white/5 transition"
                        >
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected.includes(opt.value) ? 'bg-sky-500 border-sky-500' : 'border-white/30'}`}>
                                {selected.includes(opt.value) && <Check size={10} className="text-white" />}
                            </span>
                            <span className="text-white/80">{opt.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
