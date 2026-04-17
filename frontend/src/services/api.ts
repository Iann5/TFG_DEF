import axios from 'axios';
import { isTokenExpired } from '../utils/authUtils';

// En desarrollo puedes usar VITE_API_URL=http://localhost:8000/api
// En Docker/producción (con nginx proxy a /api) usa el mismo origen para evitar CORS.
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired()) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        } else if (token && isTokenExpired()) {
            // Evita enviar tokens caducados (provocan 401 incluso en endpoints públicos)
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta: desenvuelve automáticamente las colecciones Hydra/API Platform
// para que todos los componentes reciban siempre un array directamente.
api.interceptors.response.use(
    (response) => {
        const data = response.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data['hydra:member'])) {
                response.data = data['hydra:member'];
            } else if (Array.isArray(data['member'])) {
                response.data = data['member'];
            }
        }
        return response;
    },
    (error) => Promise.reject(error)
);

export default api;
