import axios from 'axios';

// Ajusta la URL al puerto donde corra tu Symfony
const API_URL = 'http://localhost:8000/api';

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
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
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
