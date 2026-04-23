import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import api from "../services/api";
import { getUserPhotoKey, decodeToken } from "../utils/authUtils";

export function useRegistro() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellidos: '',
        dni: '',
        telefono: '',
        pais: '',
        direccion: '',
        provincia: '',
        localidad: '',
        cp: ''
    });

    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = () => setFotoPerfil(reader.result as string);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. ANTES DE NADA: Limpiamos lo que hubiera de otros usuarios
            localStorage.removeItem('token');
            localStorage.removeItem('userPhoto');

            const payload = {
                ...formData,
                roles: ["ROLE_USER"],
                fecha_registro: new Date().toISOString(),
                foto_perfil: fotoPerfil
            };

            const response = await api.post('/users', payload, {
                headers: { 'Content-Type': 'application/ld+json' }
            });

            // GUARDAMOS LA FOTO CON CLAVE ESPECÍFICA DEL USUARIO
            if (fotoPerfil && response.data.token) {
                localStorage.setItem('token', response.data.token);
                const photoKey = getUserPhotoKey();
                if (photoKey) {
                    localStorage.setItem(photoKey, fotoPerfil);
                }
            } else if (fotoPerfil) {
                const tempKey = `userPhoto_${formData.email}`;
                localStorage.setItem(tempKey, fotoPerfil);
            }

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                const payload = decodeToken(response.data.token);
                console.log('Token payload en registro:', payload);
            }

            window.dispatchEvent(new Event("storage"));
            navigate('/login');

        } catch (err) {
            if (isAxiosError(err)) {
                const detail = err.response?.data['hydra:description'] || err.response?.data['detail'];
                if (err.response?.status === 422) {
                    setError('Ya existe un usuario con ese email o DNI.');
                } else {
                    setError(`Fallo del servidor: ${detail || 'Revisa que los campos coincidan con el Backend'}`);
                }
            } else {
                setError('Error de conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        navigate,
        loading,
        error,
        showPassword,
        setShowPassword,
        formData,
        handleFileChange,
        handleChange,
        handleSubmit
    };
}
