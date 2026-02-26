import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import api from "../services/api";
import { getUserPhotoKey, decodeToken } from "../utils/authUtils";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ajustado para coincidir con User.php: usamos 'cp' en lugar de 'codigoPostal'
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

  // Función para procesar la imagen a Base64
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
      // Así el navegador está "vacío" para el nuevo usuario
      localStorage.removeItem('token');
      localStorage.removeItem('userPhoto');

      // Preparamos el objeto final con los campos obligatorios del Backend
      const payload = {
        ...formData,
        roles: ["ROLE_USER"], // Requerido por Symfony
        fecha_registro: new Date().toISOString(), // Obligatorio en tu entidad
        foto_perfil: fotoPerfil // Campo opcional en tu entidad
      };

      const response = await api.post('/users', payload, {
        headers: { 'Content-Type': 'application/ld+json' }
      });

      // GUARDAMOS LA FOTO CON CLAVE ESPECÍFICA DEL USUARIO
      if (fotoPerfil && response.data.token) {
        // Si la API devuelve un token al registrar, lo usamos para obtener la clave
        localStorage.setItem('token', response.data.token);
        const photoKey = getUserPhotoKey();
        if (photoKey) {
          localStorage.setItem(photoKey, fotoPerfil);
        }
      } else if (fotoPerfil) {
        // Si no hay token aún, guardamos con el email como clave temporal
        // que coincide con lo que getUserPhotoKey generará tras el login
        const tempKey = `userPhoto_${formData.email}`;
        localStorage.setItem(tempKey, fotoPerfil);
      }

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const payload = decodeToken(response.data.token);
        console.log('Token payload en registro:', payload); // Para debug
      }

      // Avisamos al resto de la aplicación del cambio
      window.dispatchEvent(new Event("storage"));

      navigate('/login');

    } catch (err) {
      if (isAxiosError(err)) {
        // Extraemos el error descriptivo de Hydra para debugear el Error 500
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

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/Plantilla-Sesion.png)' }}
    >
      <div className="w-full max-w-4xl bg-slate-700/60 backdrop-blur-sm p-10 rounded-2xl shadow-2xl relative z-10">

        <h2 className="text-4xl font-bold text-center mb-8 text-white tracking-wide">Crear Cuenta</h2>

        {error && (
          <div className="bg-red-500/30 border-l-4 border-red-400 text-red-100 p-4 mb-6 rounded-lg backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Datos de Cuenta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white border-b border-white pb-2">Datos de Cuenta</h3>
              <input
                type="email" name="email" placeholder="Email" required
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                onChange={handleChange}
              />
              <input
                type="password" name="password" placeholder="Contraseña" required
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                onChange={handleChange}
              />
            </div>

            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white border-b border-white pb-2">Datos Personales</h3>
              <input
                type="text" name="nombre" placeholder="Nombre" required
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                onChange={handleChange}
              />
              <input
                type="text" name="apellidos" placeholder="Apellidos" required
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text" name="dni" placeholder="DNI" required
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                  onChange={handleChange}
                />
                <input
                  type="tel" name="telefono" placeholder="Teléfono" required
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
              <h3 className="font-semibold text-white border-b border-white pb-2">Dirección</h3>
              <input
                type="text" name="direccion" placeholder="Dirección Completa" required
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" name="pais" placeholder="País" required className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300" onChange={handleChange} />
                <input type="text" name="provincia" placeholder="Provincia" required className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300" onChange={handleChange} />
                <input type="text" name="localidad" placeholder="Localidad" required className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300" onChange={handleChange} />
                <input
                  type="text"
                  name="cp" // Nombre corregido para User.php
                  placeholder="CP"
                  required
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Foto de Perfil */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm text-white mb-2">Foto de Perfil (Opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-300 transition backdrop-blur-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-6 text-white font-bold rounded-lg transition duration-200 text-lg
                ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-black/70 hover:bg-black shadow-lg hover:shadow-xl'}`}
          >
            {loading ? 'Registrando...' : 'Completar Registro'}
          </button>

        </form>
        <p className="mt-8 text-center text-sm text-white/90">
          ¿Ya tienes cuenta?{' '}
          <span onClick={() => navigate('/login')} className="text-sky-300 hover:text-sky-200 hover:underline cursor-pointer font-semibold transition">Inicia Sesión aquí</span>
          <br />
          <span onClick={() => navigate('/')} className='text-white/70 hover:text-white hover:underline cursor-pointer font-medium transition mt-2 inline-block'>Volver al inicio</span>
        </p>
      </div>
    </div>
  );
}