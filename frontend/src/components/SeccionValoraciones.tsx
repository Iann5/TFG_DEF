import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormularioValoracion from './FormularioValoracion';
import ListaComentarios from './ListaComentarios';
import type { ValoracionDetalle } from '../types/Valoracion';

interface SeccionValoracionesProps {
    isLoggedIn: boolean;
    yaValoró: boolean;
    valoraciones: ValoracionDetalle[];
    onValoracionEnviada: () => void;
    /** Pasar el id del recurso correspondiente al tipo */
    proyectoId?: number;
    productoId?: number;
    packId?: number;
    /** Texto que aparece en el mensaje "Ya has dejado tu valoración para este ___." */
    nombreRecurso?: string;
}

/**
 * Sección completa de valoraciones: título, login-gate, formulario y lista de comentarios.
 * Comparte lógica de DetalleProducto, DetalleProyecto y DetallePack.
 */
export default function SeccionValoraciones({
    isLoggedIn,
    yaValoró,
    valoraciones,
    onValoracionEnviada,
    proyectoId,
    productoId,
    packId,
    nombreRecurso = 'elemento',
}: SeccionValoracionesProps) {
    const navigate = useNavigate();

    return (
        <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="fill-yellow-400 text-yellow-400" size={22} />
                Valoraciones
            </h2>

            <div className="mb-8">
                {!isLoggedIn ? (
                    <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-5 text-center text-sky-300 font-semibold mb-6">
                        🔒 Inicia sesión para dejar una valoración.{' '}
                        <button onClick={() => navigate('/login')} className="ml-2 underline hover:text-white transition">
                            Ir al Login
                        </button>
                    </div>
                ) : yaValoró ? (
                    <div className="bg-sky-900/20 border border-sky-500/30 rounded-2xl p-5 text-center text-sky-300 font-semibold">
                        ✅ Ya has dejado tu valoración para este {nombreRecurso}.
                    </div>
                ) : (
                    <FormularioValoracion
                        proyectoId={proyectoId}
                        productoId={productoId}
                        packId={packId}
                        onValoracionEnviada={onValoracionEnviada}
                    />
                )}
            </div>

            <ListaComentarios valoraciones={valoraciones} />
        </section>
    );
}
