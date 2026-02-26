import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../services/api';
import { getUserPhotoKey } from '../utils/authUtils';

interface LoginResponse {
    token: string;
}


export default function LoginPage() {
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estados de la interfaz (UX)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Hook de navegación
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post<LoginResponse>('/login_check', {
                email,
                password
            });

            const { token } = response.data;

            // 1. Guardamos el token
            localStorage.setItem('token', token);

            // 2. Llamamos a /api/me para obtener la foto del usuario recién autenticado
            try {
                const meResponse = await api.get('/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (meResponse.data?.foto_perfil) {
                    // Clave única por usuario: "userPhoto_email@ejemplo.com"
                    const photoKey = getUserPhotoKey();
                    if (photoKey) {
                        localStorage.setItem(photoKey, meResponse.data.foto_perfil);
                    }
                }
                // Guardar el nombre del usuario para detectar valoraciones propias
                if (meResponse.data?.nombre) {
                    localStorage.setItem('userName', meResponse.data.nombre);
                }
            } catch {
                // Si falla la carga de foto, no bloqueamos el login
                console.warn('No se pudo cargar la foto de perfil desde /api/me.');

            }

            window.dispatchEvent(new Event("storage"));
            navigate('/');

        } catch (err) {
            console.error(err);

            if (isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setError('El email o la contraseña no son correctos.');
                } else if (err.response?.status === 500) {
                    setError('Error del servidor. Inténtalo más tarde.');
                } else {
                    setError('Error de conexión. Comprueba tu internet.');
                }
            } else {
                setError('Ha ocurrido un error inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex min-h-screen items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: 'url(/Plantilla-Sesion.png)',
            }}
        >
            {/* Overlay oscuro semitransparente */}
            {/* <div className="absolute inset-0 bg-black/40"></div> */}

            {/* Contenedor del formulario */}
            <div className="w-full max-w-md bg-slate-700/60 backdrop-blur-sm p-10 rounded-2xl shadow-2xl relative z-10">

                {/* Título */}
                <h2 className="text-4xl font-bold text-center mb-8 text-white tracking-wide">
                    INICIAR SESIÓN
                </h2>

                {/* Mensaje de Error */}
                {error && (
                    <div className="bg-red-500/30 border-l-4 border-red-400 text-red-100 p-4 mb-6 rounded-lg text-sm backdrop-blur-sm" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Campo Email */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white/30 transition backdrop-blur-sm disabled:opacity-50"
                            placeholder="ejemplo@tatuajes.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:bg-white/30 transition backdrop-blur-sm disabled:opacity-50"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Botón Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold transition duration-200 text-lg
                            ${loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-black/70 hover:bg-black shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Entrando...
                            </span>
                        ) : 'Acceder'}
                    </button>
                </form>

                {/* Enlace a Registro */}
                <p className="mt-8 text-center text-sm text-white/90">
                    ¿No tienes cuenta?{' '}
                    <span
                        onClick={() => navigate('/registro')}
                        className="text-sky-300 hover:text-sky-200 hover:underline cursor-pointer font-semibold transition"
                    >
                        Regístrate aquí
                    </span>
                    <br />
                    <span onClick={() => navigate('/')}
                        className='text-white/70 hover:text-white hover:underline cursor-pointer font-medium transition mt-2 inline-block'
                    >
                        Volver al inicio
                    </span>
                </p>
            </div>
        </div>
    );
}