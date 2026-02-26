import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { type TrabajadorBasico } from '../types/trabajador';
import { type EstiloData } from '../types/EstiloInterface';


const Estilo = () => {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [estilos, setEstilos] = useState<EstiloData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trabajadores1, setTrabajadores1] = useState<TrabajadorBasico[]>([]);


  const cargar = async () => {
    try {
      const response = await api.get<EstiloData[]>('/estilos');
      if (Array.isArray(response.data)) setEstilos(response.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Error ${err.response?.status}: No se pudo obtener la información.`);
      } else {
        setError('Error inesperado en la conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  const cargarTrabajadores = async () => {
    try {
      const response = await api.get<TrabajadorBasico[]>('/trabajadors');
      if (Array.isArray(response.data)) setTrabajadores1(response.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(`Error ${err.response?.status}: No se pudo obtener la información.`);
      } else {
        setError('Error inesperado en la conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => { cargarTrabajadores(); }, []);

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este estilo?')) return;
    try {
      await api.delete(`/estilos/${id}`);
      setEstilos(prev => prev.filter(e => e.id !== id));
    } catch {/* silencioso */ }
  };

  return (
    <div className="min-h-screen font-sans relative bg-[#1C1B28] overflow-hidden">
      {/* Fondo manga */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/paneles.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.24,
          filter: 'invert(1)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-grow space-y-16">
          {/* Botón añadir — solo trabajador/admin */}
          {puedeEditar && (
            <div className="flex justify-end">
              <button
                onClick={() => navigate('/crearEstilo')}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition"
              >
                + Añadir Estilo
              </button>
            </div>
          )}

          {loading && <p className="text-white text-center text-xl">Cargando catálogo artístico...</p>}
          {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>}

          {estilos.map(estilo => {
            // Construir array de hasta 3 fotos: imagenes[] tiene prioridad, si no usamos imagen
            const fotos: (string | undefined)[] = [
              ...(estilo.imagenes ?? []),
              ...(!estilo.imagenes?.length && estilo.imagen ? [estilo.imagen] : []),
            ].slice(0, 3);
            // Rellenar hasta 3 slots con undefined (placeholders)
            while (fotos.length < 3) fotos.push(undefined);

            const trabajadores = estilo.trabajadores ?? [];

            return (
              <section
                key={estilo.id}
                className="max-w-4xl mx-auto bg-[#4b4d57] rounded-xl p-6 shadow-2xl"
              >
                {/* Nombre */}
                <div className="inline-block bg-[#E5E7EB] text-black font-bold px-5 py-1.5 rounded-lg text-xl mb-4 shadow-sm">
                  {estilo.nombre}
                </div>

                {/* Información */}
                <div className="bg-[#D1D5DB] rounded-lg p-4 mb-6 min-h-[80px] flex items-center justify-center">
                  <p className="text-gray-800 font-bold text-center uppercase tracking-widest text-justify">
                    {estilo.informacion || 'INFO'}
                  </p>
                </div>

                {/* 3 fotos de ejemplo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {fotos.map((foto, idx) => (
                    <div
                      key={idx}
                      className="bg-[#9CA3AF] aspect-square rounded-xl flex items-center justify-center border-2 border-gray-400 overflow-hidden shadow-inner"
                    >
                      {foto ? (
                        <img
                          src={foto}
                          alt={`${estilo.nombre} ejemplo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-700 font-black text-3xl">IMG</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Trabajadores especializados */}
                <div className="inline-block bg-[#D1D5DB] text-gray-800 font-bold px-4 py-1 rounded-md mb-4 text-sm">
                  Trabajadores Especializados:
                </div>

                <div className="bg-[#D1D5DB] rounded-2xl p-5 flex flex-wrap gap-4 border-b-4 border-gray-400 min-h-[56px]">
                  {trabajadores.length === 0 && (
                    <span className="text-gray-500 text-sm italic">Sin trabajadores asignados aún.</span>
                  )}

                  {trabajadores.map((t: string | number | { id: number }, index: number) => {
                    // 1. Obtenemos el ID de forma totalmente tipada (sin errores rojos)
                    const tId = typeof t === 'object' 
                      ? t.id 
                      : parseInt(String(t).split('/').pop() || '0', 10);

                    // 2. Cruzamos el ID con tu lista que tiene todos los datos completos
                    const trabajadorCompleto = trabajadores1.find(trab => trab.id === tId);

                    // 3. Extraemos el nombre y apellido reales
                    const nombre = trabajadorCompleto?.usuario?.nombre ?? trabajadorCompleto?.nombre ?? 'Trabajador Desconocido';
                    const apellidos = trabajadorCompleto?.usuario?.apellidos ?? '';

                    return (
                      <div
                        key={tId || index}
                        className="h-8 px-4 bg-[#7DD3FC] rounded-2xl shadow-md flex items-center text-gray-900 font-semibold text-sm"
                      >
                        {nombre} {apellidos}
                      </div>
                    );
                  })}
                </div>

                {/* Botones editar/eliminar — solo trabajador/admin */}
                {puedeEditar && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-[#3B82F6]/30">
                    <button
                      onClick={() => navigate(`/editarEstilo/${estilo.id}`)}
                      className="flex-1 py-2 bg-amber-600/80 hover:bg-amber-600 text-white font-bold rounded-lg transition"
                    >
                      ✏️ Editar Estilo
                    </button>
                    <button
                      onClick={() => handleEliminar(estilo.id)}
                      className="flex-1 py-2 bg-red-700/80 hover:bg-red-700 text-white font-bold rounded-lg transition"
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                )}
              </section>
            );
          })}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Estilo;