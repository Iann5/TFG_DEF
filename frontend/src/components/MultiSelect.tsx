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
export default function MultiSelect({ placeholder = 'SELECCIONAR', options, selected, onChange, className = '' }: Props) {
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
                className="w-full min-w-[220px] flex items-center justify-between gap-3 px-4 py-3 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-on-surface font-label text-xs uppercase tracking-[0.2em] hover:border-primary/50 focus:border-primary/50 transition-colors"
            >
                <span className="truncate text-left max-w-[220px]">
                    {displayLabel}
                </span>
                <ChevronDown
                    size={18}
                    strokeWidth={3}
                    className={`shrink-0 text-outline-variant transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute top-full mt-2 right-0 z-50 w-full min-w-[250px] bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/30 rounded-sm overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => toggle(opt.value)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group ${
                                selected.includes(opt.value)
                                    ? 'bg-primary/15 text-primary'
                                    : 'hover:bg-surface-container hover:text-on-surface'
                            }`}
                        >
                            <span
                                className={`w-6 h-6 rounded-sm border flex items-center justify-center shrink-0 ${
                                    selected.includes(opt.value)
                                        ? 'bg-primary/20 border-primary/50'
                                        : 'bg-surface-container border-outline-variant/30'
                                }`}
                            >
                                {selected.includes(opt.value) && <Check size={16} strokeWidth={3} className="text-primary" />}
                            </span>
                            <span className="truncate font-label text-[10px] uppercase tracking-widest text-on-surface/90 group-hover:text-primary">
                                {opt.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
