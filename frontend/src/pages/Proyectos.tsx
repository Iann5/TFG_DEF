import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ListaProyectos from '../components/ListaProyecto';
import TarjetaProyecto from '../components/TarjetaProyecto';
import { getFavoritesStorageKey } from '../utils/authUtils';
import { type RawProyecto, type ProyectoNormalizado, type FiltrosProyectos } from '../types/proyecto';


export default function Proyectos() {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const esAdmin = isLoggedIn && hasRole('ROLE_ADMIN');
  const esTrabajador = isLoggedIn && hasRole('ROLE_TRABAJADOR');

  // ID del User autenticado — para comparar con el autorUserId de cada proyecto
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [proyectos, setProyectos] = useState<ProyectoNormalizado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  // Función derivada: ¿puede editar/eliminar ESTE proyecto concreto?
  const puedeEditarProyecto = (proyecto: ProyectoNormalizado): boolean => {
    if (!isLoggedIn) return false;
    if (esAdmin) return true;                              // Admin puede todo
    if (!esTrabajador) return false;                       // No-trabajador nunca
    return proyecto.autorUserId === currentUserId;         // Solo el autor
  };

  const [filtros, setFiltros] = useState<FiltrosProyectos>({
    orden: 'reciente',
    tipo: 'todos',
    trabajador: 'todos'
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await api.get<RawProyecto[]>('/proyectos');

      let rawData: RawProyecto[] = res.data;

      // Filtrar proyectos cuyos autores ya no sean trabajadores
      rawData = rawData.filter((p: any) => {
          if (p.autor && p.autor.usuario && p.autor.usuario.roles) {
              return p.autor.usuario.roles.includes('ROLE_TRABAJADOR');
          }
          return true;
      });

      // Mapeo seguro a la interfaz normalizada
      const proyectosMapeados: ProyectoNormalizado[] = rawData.map(p => {
        const valoraciones = p.valoracionProyectos || [];
        // Resolvemos el autorUserId: primero del campo serializado, luego de la relación anidada
        const autorUserId = p.autorUserId ?? p.autor?.usuario?.id ?? null;
        return {
          id: p.id,
          titulo: p.tituloTatuaje || p.nombre || 'Sin título',
          descripcion: p.descripcion || undefined,
          estilo: p.estilo || 'Varios',
          tipo: p.tipo || 'tatuaje',
          precioOriginal: p.precioOriginal ?? p.precio_original ?? 0,
          precioOferta: p.precioOferta ?? p.precio_oferta ?? null,
          imagen: p.imagen || '',
          nombreTrabajador: p.autor?.usuario?.nombre
            ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}`
            : 'Desconocido',
          autorUserId,
          fechaSubida: p.fechaSubida || p.fecha_subida || new Date(0).toISOString(),
          valoraciones: valoraciones,
          media: p.media || 0
        };
      });

      setProyectos(proyectosMapeados);

      const storageKey = getFavoritesStorageKey();
      if (storageKey) {
        const favs = localStorage.getItem(storageKey);
        if (favs) setFavoritos(JSON.parse(favs));
      } else {
        setFavoritos([]);
      }
    } catch (err) {
      if (err instanceof AxiosError) setError(`Error ${err.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos + ID del usuario actual (solo si está logueado)
  useEffect(() => {
    cargarDatos();
    if (isLoggedIn) {
      api.get('/me')
        .then(res => setCurrentUserId(res.data.id ?? null))
        .catch(() => setCurrentUserId(null));
    } else {
      setCurrentUserId(null);
      setFavoritos([]);
    }
  }, [isLoggedIn]);

  const toggleFavorito = (id: number): void => {
    if (!isLoggedIn) return;

    const nuevosFavs = favoritos.includes(id) ? favoritos.filter(fId => fId !== id) : [...favoritos, id];
    setFavoritos(nuevosFavs);
    const storageKey = getFavoritesStorageKey();
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
  };

  const handleEliminar = async (id: number): Promise<void> => {
    if (!window.confirm('¿Seguro que deseas eliminar este proyecto?')) return;
    try {
      await api.delete(`/proyectos/${id}`);
      setProyectos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error eliminando", err);
    }
  };

  const trabajadoresUnicos = useMemo(() => {
    return Array.from(new Set(proyectos.map(p => p.nombreTrabajador)));
  }, [proyectos]);

  // Lógica Top Mes
  const topDelMes = useMemo(() => {
    const now = new Date();
    const proyectosEsteMes = proyectos.filter(p => {
      const fecha = new Date(p.fechaSubida);
      return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
    });

    const ordenados = [...proyectosEsteMes].sort((a, b) => b.media - a.media);
    return {
      mejorTatuaje: ordenados.find(p => p.tipo.toLowerCase().includes('tatuaje')),
      mejorPlantilla: ordenados.find(p => p.tipo.toLowerCase().includes('plantilla'))
    };
  }, [proyectos]);

  // Lógica Filtrado
  const proyectosFiltrados = useMemo(() => {
    let resultado = [...proyectos];
    if (filtros.tipo !== 'todos') resultado = resultado.filter(p => p.tipo.toLowerCase().includes(filtros.tipo));
    if (filtros.trabajador !== 'todos') resultado = resultado.filter(p => p.nombreTrabajador === filtros.trabajador);

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaSubida).getTime();
      const fechaB = new Date(b.fechaSubida).getTime();

      if (filtros.orden === 'reciente') {
        if (fechaA === fechaB) return b.id - a.id;
        return fechaB - fechaA;
      }
      if (filtros.orden === 'antiguo') {
        if (fechaA === fechaB) return a.id - b.id;
        return fechaA - fechaB;
      }
      if (filtros.orden === 'valoracionAlta') return b.media - a.media;
      if (filtros.orden === 'valoracionBaja') return a.media - b.media;

      return 0;
    });
    return resultado;
  }, [proyectos, filtros]);

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
              <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">Portafolio & Galería</span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                Nuestros<br/>
                <span className="text-outline-variant">Proyectos</span>
              </h1>
              {/* Decorative elements */}
              <div className="absolute -left-4 top-0 w-1 h-32 bg-primary"></div>
              <div className="absolute left-0 -top-4 w-12 h-1 bg-primary"></div>
            </div>

            {(esTrabajador || esAdmin) && (
              <button
                onClick={() => navigate('/addTatuaje')}
                className="group relative overflow-hidden bg-transparent border border-outline hover:border-primary text-on-surface hover:text-primary font-label text-xs uppercase tracking-widest py-4 px-8 rounded-sm transition-all duration-300"
              >
                <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Añadir Proyecto
                </span>
              </button>
            )}
          </div>

          {/* TOP DEL MES */}
          {(topDelMes.mejorTatuaje || topDelMes.mejorPlantilla) && (
            <section className="mb-20 glass-panel p-8 md:p-12 border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-10 relative z-10">
                 <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">star</span>
                 </div>
                 <div>
                    <h2 className="font-headline text-2xl md:text-3xl font-bold uppercase tracking-widest text-on-surface">Proyectos más gustados</h2>
                    <p className="font-label text-xs text-outline tracking-[0.2em] uppercase">Lo mejor de este mes</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
                <div className="lg:col-span-1 hidden lg:block"></div> {/* Spacer to center or align */}
                {topDelMes.mejorTatuaje && (
                  <div className="lg:col-span-1">
                    <TarjetaProyecto
                      proyecto={topDelMes.mejorTatuaje}
                      esFavorito={false} onToggleFav={() => { }} puedeEditar={false} navigate={navigate} onEliminar={() => { }} isTop
                    />
                  </div>
                )}
                {topDelMes.mejorPlantilla && (
                  <div className="lg:col-span-1">
                    <TarjetaProyecto
                      proyecto={topDelMes.mejorPlantilla}
                      esFavorito={favoritos.includes(topDelMes.mejorPlantilla.id)}
                      onToggleFav={toggleFavorito}
                      puedeEditar={false} navigate={navigate} onEliminar={() => { }} isTop
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* FILTROS */}
          <div className="glass-panel p-6 mb-16 flex flex-col xl:flex-row gap-6 items-center">
            <div className="flex items-center gap-3 text-on-surface font-label text-sm uppercase tracking-widest w-full xl:w-auto shrink-0 border-b xl:border-b-0 xl:border-r border-outline-variant/30 pb-4 xl:pb-0 xl:pr-6">
              <span className="material-symbols-outlined text-primary">filter_list</span>
              Filtrar Galería
            </div>
            
            <div className="flex flex-wrap flex-grow gap-4 w-full">
              <div className="flex-1 min-w-[200px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">swap_vert</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={filtros.orden}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
                 >
                   <option value="reciente">Más Recientes</option>
                   <option value="antiguo">Más Antiguos</option>
                   <option value="valoracionAlta">Mayor Valoración</option>
                   <option value="valoracionBaja">Menor Valoración</option>
                 </select>
              </div>

              <div className="flex-1 min-w-[200px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">category</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={filtros.tipo}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosProyectos['tipo'] })}
                 >
                   <option value="todos">Todos los Tipos</option>
                   <option value="tatuaje">Solo Tatuajes</option>
                   <option value="plantilla">Solo Plantillas</option>
                 </select>
              </div>

              <div className="flex-1 min-w-[200px] relative">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">person</span>
                 <select
                   className="w-full bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs uppercase tracking-widest pl-12 pr-4 py-4 rounded-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                   value={filtros.trabajador}
                   onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, trabajador: e.target.value })}
                 >
                   <option value="todos">Cualquier Artista</option>
                   {trabajadoresUnicos.map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>
            </div>
          </div>

          {/* RENDERIZADO DEL COMPONENTE LISTA */}
          {loading && (
             <div className="flex flex-col items-center justify-center py-32 gap-4">
               <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
               <p className="font-label text-xs uppercase tracking-[0.2em] text-outline">Cargando portafolio...</p>
             </div>
          )}
          
          {error && (
            <div className="bg-error-container/20 border border-error/50 p-6 rounded-sm flex items-center gap-4 mb-12">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="font-body text-error text-sm">{error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <ListaProyectos
              proyectos={proyectosFiltrados}
              favoritos={favoritos}
              onToggleFav={toggleFavorito}
              puedeEditarFn={puedeEditarProyecto}
              navigate={navigate}
              onEliminar={handleEliminar}
            />
          )}

        </div>
      </main>
      
      <Footer />
    </div>
  );
}