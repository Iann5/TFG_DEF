import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../services/api';
import { getUserPhotoKey } from '../utils/authUtils';
import { type LoginResponse } from '../types/auth';

export function useLogin() {
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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
                if (meResponse.data?.id != null) {
                    localStorage.setItem('userId', String(meResponse.data.id));
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

    return {
        email,
        setEmail,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        error,
        loading,
        navigate,
        handleSubmit
    };
}
