import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MultiSelect from '../components/MultiSelect';
import PageBackground from '../components/PageBackground';
import BotonesAdmin from '../components/BotonesAdmin';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { type TrabajadorBasico } from '../types/trabajador';
import { type EstiloData } from '../types/EstiloInterface';

const ORDEN_OPTS = [
  { value: 'az', label: 'Alfabético (A→Z)' },
  { value: 'za', label: 'Alfabético (Z→A)' },
  { value: 'reciente', label: 'Más reciente' },
  { value: 'antiguo', label: 'Más antiguo' },
];


const Estilo = () => {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [estilos, setEstilos] = useState<EstiloData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trabajadores1, setTrabajadores1] = useState<TrabajadorBasico[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [orden, setOrden] = useState<string[]>(['az']);


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

  const estilosProcesados = (() => {
    let list = [...estilos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.nombre.toLowerCase().includes(query) ||
        (e.informacion && e.informacion.toLowerCase().includes(query))
      );
    }

    const activo = orden[orden.length - 1] ?? 'az';
    if (activo === 'reciente') list.sort((a, b) => b.id - a.id);
    else if (activo === 'antiguo') list.sort((a, b) => a.id - b.id);
    else if (activo === 'za') list.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    else list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

    return list;
  })();

  return (
    <div className="min-h-screen font-sans relative bg-[#1C1B28] overflow-hidden">
      <PageBackground opacity={0.24} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-grow space-y-16">
          <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-center mb-10 gap-6 md:gap-120">
            {/* Título */}
            <h1 className="text-4xl font-light text-white">
              Nuestros <span className="text-sky-500 font-bold">Estilos</span>
            </h1>

            {/* Botón añadir — solo trabajador/admin */}
            {puedeEditar && (
              <button
                onClick={() => navigate('/crearEstilo')}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition shadow-lg shadow-sky-900/20 active:scale-95"
              >
                + Añadir Estilo
              </button>
            )}
          </div>

          {/* Buscador y Filtros */}
          <div className="max-w-4xl mx-auto w-full bg-[#323444]/80 p-6 rounded-2xl border border-white/5 mb-10 flex flex-col md:flex-row gap-6 shadow-xl backdrop-blur-sm items-center">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="Buscar estilos por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1B28] text-white border border-[#3B82F6]/30 px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-colors"
              />
            </div>
            <div className="w-full md:w-64">
              <MultiSelect
                options={ORDEN_OPTS}
                selected={orden}
                onChange={setOrden}
                placeholder="Ordenar por..."
              />
            </div>
          </div>

          {loading && <p className="text-white text-center text-xl mb-10">Cargando catálogo artístico...</p>}
          {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg mb-10">{error}</p>}

          {estilosProcesados.length === 0 && !loading && !error && (
            <p className="text-white/60 text-center text-lg mb-10">No se encontraron estilos con esos parámetros.</p>
          )}

          {estilosProcesados.map(estilo => {
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
                  <p className="text-gray-800 font-bold uppercase tracking-widest text-justify whitespace-pre-line w-full">
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
                          className="w-full h-full object-contain"
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
                  <div className="mt-4 pt-4 border-t border-[#3B82F6]/30">
                    <BotonesAdmin
                      size="md"
                      onEditar={() => navigate(`/editarEstilo/${estilo.id}`)}
                      onEliminar={() => handleEliminar(estilo.id)}
                    />
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