import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MultiSelect from '../components/MultiSelect';
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

const PlaceholderOscuro = () => (
    <div className="bg-surface-container w-full h-full flex items-center justify-center border border-outline-variant/30 p-4 relative overflow-hidden group">
      <div className="absolute inset-0 bg-halftone opacity-30"></div>
      <span className="material-symbols-outlined text-outline-variant text-4xl relative z-10 group-hover:scale-110 transition-transform">image</span>
    </div>
);

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
        setError(`Error ${err.response?.status}: No se pudo obtener los trabajadores.`);
      } else {
        setError('Error inesperado en la conexión con trabajadores.');
      }
    }
  };

  useEffect(() => { 
    cargar(); 
    cargarTrabajadores(); 
  }, []);

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este estilo permanentemente?')) return;
    try {
      await api.delete(`/estilos/${id}`);
      setEstilos(prev => prev.filter(e => e.id !== id));
    } catch {/* silencioso */}
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
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative z-10 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* HEADER SECTION */}
          <div className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="relative">
              <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">Catálogo de Disciplinas</span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                Estilos<br/>
                <span className="text-outline-variant">Artísticos</span>
              </h1>
              {/* Decorative elements */}
              <div className="absolute -left-4 top-0 w-1 h-32 bg-primary"></div>
              <div className="absolute left-0 -top-4 w-12 h-1 bg-primary"></div>
            </div>

            {puedeEditar && (
              <button
                onClick={() => navigate('/crearEstilo')}
                className="group relative overflow-hidden bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all duration-300"
              >
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Añadir Estilo
                </span>
              </button>
            )}
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="glass-panel p-6 mb-16 flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar por disciplina o técnica..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-sm text-on-surface font-body text-sm pl-12 pr-4 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder-outline/50"
              />
            </div>
            <div className="w-full md:w-80 flex items-center gap-4">
              <span className="material-symbols-outlined text-outline">tune</span>
              <div className="flex-1">
                <MultiSelect
                  options={ORDEN_OPTS}
                  selected={orden}
                  onChange={setOrden}
                  placeholder="Ordenar catálogo..."
                />
              </div>
            </div>
          </div>

          {/* LOADING & ERROR STATES */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
              <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando Catálogo...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-error-container/20 border border-error/50 p-6 rounded-sm flex items-center gap-4 mb-12">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-body text-error text-sm">{error}</p>
            </div>
          )}

          {estilosProcesados.length === 0 && !loading && !error && (
            <div className="glass-panel p-16 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-outline-variant text-5xl">visibility_off</span>
              <p className="font-label text-xs uppercase tracking-widest text-[#8c909f]">No se encontraron estilos en el catálogo.</p>
            </div>
          )}

          {/* STYLES GRID */}
          <div className="space-y-24">
            {estilosProcesados.map((estilo, index) => {
              const fotos: (string | undefined)[] = [
                ...(estilo.imagenes ?? []),
                ...(!estilo.imagenes?.length && estilo.imagen ? [estilo.imagen] : []),
              ].slice(0, 3);
              while (fotos.length < 3) fotos.push(undefined);

              const trabajadores = estilo.trabajadores ?? [];
              const isEven = index % 2 === 0;

              return (
                <section
                  key={estilo.id}
                  className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 group"
                >
                  {/* Decorative number */}
                  <div className="absolute -left-4 -top-8 text-[120px] font-headline font-black text-surface-container opacity-50 z-0 pointer-events-none select-none">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>

                  {/* LEFT COLUMN: Info */}
                  <div className={`lg:col-span-4 flex flex-col justify-center relative z-10 ${!isEven ? 'lg:order-2' : ''}`}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="h-[1px] w-12 bg-primary"></div>
                      <span className="font-label text-[#8c909f] text-[10px] uppercase tracking-[0.2em]">Disciplina #{estilo.id}</span>
                    </div>

                    <h2 className="font-headline text-4xl font-bold uppercase tracking-wide mb-6">{estilo.nombre}</h2>
                    
                    <div className="prose prose-invert prose-sm mb-8">
                      <p className="font-body text-on-surface-variant leading-relaxed text-sm text-justify">
                        {estilo.informacion || 'No hay descripción detallada disponible para esta disciplina artística en nuestro estudio.'}
                      </p>
                    </div>

                    {/* Especialistas Menu */}
                    <div className="mt-auto">
                      <h4 className="font-label text-xs uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        Especialistas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trabajadores.length === 0 ? (
                          <span className="text-[#8c909f] font-body text-xs italic">Sin artistas asignados.</span>
                        ) : (
                          trabajadores.map((t: string | number | { id: number }, idx: number) => {
                            const tId = typeof t === 'object' ? t.id : parseInt(String(t).split('/').pop() || '0', 10);
                            const trabajadorCompleto = trabajadores1.find(trab => trab.id === tId);
                            const nombre = trabajadorCompleto?.usuario?.nombre ?? trabajadorCompleto?.nombre ?? 'Artista';

                            return (
                              <button
                                key={tId || idx}
                                onClick={() => navigate('/equipo')}
                                className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-label text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-sm transition-colors flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                                {nombre}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {puedeEditar && (
                      <div className="mt-8 pt-6 border-t border-outline-variant/20">
                        <BotonesAdmin
                          size="md"
                          onEditar={() => navigate(`/editarEstilo/${estilo.id}`)}
                          onEliminar={() => handleEliminar(estilo.id)}
                        />
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: Gallery */}
                  <div className={`lg:col-span-8 relative z-10 ${!isEven ? 'lg:order-1' : ''}`}>
                    <div className="grid grid-cols-12 gap-2 h-[400px] md:h-[500px]">
                      {/* Main Large Image */}
                      <div className="col-span-12 md:col-span-8 h-full bg-surface-container-highest rounded-sm border border-outline-variant/20 overflow-hidden relative group/img">
                        <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover/img:opacity-100 transition-opacity z-10 duration-500 pointer-events-none"></div>
                        {fotos[0] ? (
                          <img src={fotos[0]} alt={`${estilo.nombre} principal`} className="w-full h-full object-cover filter grayscale group-hover/img:grayscale-0 transition-all duration-700" />
                        ) : (
                          <PlaceholderOscuro />
                        )}
                      </div>

                      {/* Side Images Stack */}
                      <div className="hidden md:flex col-span-4 flex-col gap-2 h-full min-h-0">
                        {[1, 2].map((idx) => (
                           <div key={idx} className="flex-1 min-h-0 bg-surface-container-highest rounded-sm border border-outline-variant/20 overflow-hidden relative group/img">
                             <div className="absolute inset-0 bg-primary/20 mix-blend-overlay opacity-0 group-hover/img:opacity-100 transition-opacity z-10 duration-500 pointer-events-none"></div>
                             {fotos[idx] ? (
                               <img src={fotos[idx]} alt={`${estilo.nombre} ${idx + 1}`} className="w-full h-full object-cover filter grayscale group-hover/img:grayscale-0 transition-all duration-700 hover:scale-105" />
                             ) : (
                               <PlaceholderOscuro />
                             )}
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Estilo;