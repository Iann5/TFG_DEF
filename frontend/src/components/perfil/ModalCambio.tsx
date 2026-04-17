import { useState, type FormEvent } from 'react';

interface Props {
    titulo: string;
    tipo: string;
    placeholder: string;
    onConfirm: (valor: string) => void;
    onClose: () => void;
}

export default function ModalCambio({ titulo, tipo, placeholder, onConfirm, onClose }: Props) {
    const [valor, setValor] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = tipo === 'password';

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (valor.trim()) {
            onConfirm(valor);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-8 w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 mb-6 border-b border-outline-variant/20 pb-4">
                    <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                    <h3 className="text-on-surface font-headline font-bold uppercase tracking-wide text-lg">{titulo}</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-[#8c909f] font-label text-[10px] uppercase tracking-[0.2em] mb-2">{placeholder}</label>
                        <div className="relative">
                            <input
                                type={isPasswordField ? (showPassword ? 'text' : 'password') : tipo}
                                placeholder={`Nuevo(a) ${placeholder.toLowerCase()}`}
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                                className="w-full px-4 py-3 pr-12 bg-surface-container-highest border border-outline-variant/30 rounded-sm text-on-surface text-sm font-body placeholder-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                autoFocus
                            />
                            {isPasswordField && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute inset-y-0 right-0 px-3 text-outline-variant hover:text-primary transition-colors"
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={!valor.trim()}
                            className="w-full primary-gradient-cta text-[#00285d] font-label font-bold text-xs uppercase tracking-widest py-3 rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_4px_15px_rgba(173,198,255,0.2)]"
                        >
                            Confirmar Cambio
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-transparent border border-outline-variant/30 hover:bg-surface-container hover:border-on-surface text-on-surface-variant hover:text-on-surface font-label font-bold text-xs uppercase tracking-widest py-3 rounded-sm transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
