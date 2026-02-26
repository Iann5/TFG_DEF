import { useState } from 'react';

interface Props {
    titulo: string;
    tipo: string;
    placeholder: string;
    onConfirm: (valor: string) => void;
    onClose: () => void;
}

export default function ModalCambio({ titulo, tipo, placeholder, onConfirm, onClose }: Props) {
    const [valor, setValor] = useState('');

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-slate-800 border border-white/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
                <h3 className="text-white text-xl font-bold mb-4">{titulo}</h3>
                <input
                    type={tipo}
                    placeholder={placeholder}
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-300 mb-4"
                />
                <div className="flex gap-3">
                    <button
                        onClick={() => onConfirm(valor)}
                        disabled={!valor.trim()}
                        className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2.5 rounded-lg transition"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
