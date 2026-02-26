// src/components/FormularioValoracion.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StarRating from './StarRating';
import { LogIn, Send } from 'lucide-react';

interface Props {
    proyectoId?: number;
    productoId?: number;
    packId?: number; // Propiedad necesaria para packs
    trabajadorId?: number;
    onValoracionEnviada: () => void;
}

export default function FormularioValoracion({ 
    proyectoId, 
    productoId, 
    packId, // ✅ Añadido a los argumentos
    trabajadorId, 
    onValoracionEnviada 
}: Props) {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [estrellas, setEstrellas] = useState(0);
    const [comentario, setComentario] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState(false);

    const handleEnviar = async () => {
        if (estrellas === 0) {
            setError('Por favor selecciona una puntuación.');
            return;
        }
        setEnviando(true);
        setError(null);
        try {
            // ✅ Lógica para Packs
            if (packId != null) {
                await api.post('/valoracion_packs', {
                    pack: `/api/packs/${packId}`,
                    estrellas,
                    comentario,
                }, { headers: { 'Content-Type': 'application/ld+json' } });
            } 
            // Lógica para Productos
            else if (productoId != null) {
                await api.post('/valoracion_productos', {
                    producto: `/api/productos/${productoId}`,
                    estrellas,
                    comentario,
                }, { headers: { 'Content-Type': 'application/ld+json' } });
            } 
            // Lógica para Trabajadores
            else if (trabajadorId != null) {
                await api.post('/valoracion_trabajadors', {
                    trabajador: `/api/trabajadors/${trabajadorId}`,
                    estrellas,
                    comentario,
                }, { headers: { 'Content-Type': 'application/ld+json' } });
            } 
            // Lógica para Proyectos
            else if (proyectoId != null) {
                await api.post('/valoracion_proyectos', {
                    proyecto: `/api/proyectos/${proyectoId}`,
                    estrellas,
                    comentario,
                }, { headers: { 'Content-Type': 'application/ld+json' } });
            }

            setExito(true);
            setEstrellas(0);
            setComentario('');
            onValoracionEnviada();
        } catch (err) {
            setError('Error al enviar la valoración. Inténtalo de nuevo.');
            console.log(err)
        } finally {
            setEnviando(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="bg-[#1C1B28] border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-white/60 mb-4">Inicia sesión para dejar tu valoración y comentario.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition"
                >
                    <LogIn size={18} /> Iniciar sesión
                </button>
            </div>
        );
    }

    if (exito) {
        return (
            <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-6 text-center text-green-400 font-semibold">
                ✅ ¡Valoración enviada correctamente!
            </div>
        );
    }

    return (
        <div className="bg-[#323444] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg">Tu valoración</h3>

            <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm">Puntuación:</span>
                <StarRating value={estrellas} onChange={setEstrellas} size={28} />
                {estrellas > 0 && (
                    <span className="text-yellow-400 font-bold text-sm">{estrellas}/5</span>
                )}
            </div>

            <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Escribe tu comentario (opcional)..."
                rows={3}
                className="w-full bg-[#1C1B28] text-white border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-sky-500 resize-none placeholder:text-white/30"
            />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
                onClick={handleEnviar}
                disabled={enviando}
                className="self-end inline-flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl transition"
            >
                <Send size={16} />
                {enviando ? 'Enviando...' : 'Enviar valoración'}
            </button>
        </div>
    );
}