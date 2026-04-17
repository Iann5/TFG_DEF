import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getFavoritesStorageKey } from '../utils/authUtils';

// REUTILIZAMOS TIPOS Y COMPONENTES (Cero duplicidades, cero 'any')
import ListaProyectos from '../components/ListaProyecto';
//import { type ValoracionBase } from '../types/Valoracion';
import {
  type RawProyecto,
  type ProyectoNormalizado,
  type FiltrosProyectos
} from '../types/proyecto';

export default function ProyectosMasGustados() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [topProyectos, setTopProyectos] = useState<ProyectoNormalizado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  // USAMOS LA INTERFAZ GLOBAL (FiltrosProyectos)
  const [filtros, setFiltros] = useState<FiltrosProyectos>({
    orden: 'reciente',
    tipo: 'todos',
    trabajador: 'todos' // Lo incluimos para cumplir con la interfaz, aunque no usemos el select
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await api.get<RawProyecto[]>('/proyectos');

      let rawData: RawProyecto[] = res.data;

      rawData = rawData.filter((p: any) => {
          if (p.autor && p.autor.usuario && p.autor.usuario.roles) {
              return p.autor.usuario.roles.includes('ROLE_TRABAJADOR');
          }
          return true;
      });

      const todosProyectos: ProyectoNormalizado[] = rawData.map(p => {
        const valoraciones = p.valoracionProyectos || [];
        return {
          id: p.id,
          titulo: p.tituloTatuaje || p.nombre || 'Sin título',
          descripcion: p.descripcion || undefined,
          estilo: p.estilo || 'Varios',
          tipo: (p.tipo || 'tatuaje').toLowerCase(),
          precioOriginal: p.precioOriginal ?? p.precio_original ?? 0,
          precioOferta: p.precioOferta ?? p.precio_oferta ?? null,
          imagen: p.imagen || '',
          nombreTrabajador: p.autor?.usuario?.nombre
            ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}`
            : 'Desconocido',
          autorUserId: p.autorUserId ?? p.autor?.usuario?.id ?? null,
          fechaSubida: p.fecha_subida || new Date().toISOString(),
          valoraciones: valoraciones,
          media: p.media || 0
        };
      });

      // LÓGICA CORE: Agrupar por mes/año y sacar los ganadores
      const agrupadosPorMes: Record<string, ProyectoNormalizado[]> = {};

      todosProyectos.forEach(p => {
        const fecha = new Date(p.fechaSubida);
        const llaveMesAnio = `${fecha.getFullYear()}-${fecha.getMonth()}`;
        if (!agrupadosPorMes[llaveMesAnio]) agrupadosPorMes[llaveMesAnio] = [];
        agrupadosPorMes[llaveMesAnio].push(p);
      });

      const ganadoresHistoricos: ProyectoNormalizado[] = [];

      Object.values(agrupadosPorMes).forEach(proyectosDelMes => {
        const tatuajes = proyectosDelMes.filter(p => p.tipo.includes('tatuaje')).sort((a, b) => b.media - a.media);
        const plantillas = proyectosDelMes.filter(p => p.tipo.includes('plantilla')).sort((a, b) => b.media - a.media);

        if (tatuajes.length > 0) ganadoresHistoricos.push(tatuajes[0]);
        if (plantillas.length > 0) ganadoresHistoricos.push(plantillas[0]);
      });

      setTopProyectos(ganadoresHistoricos);

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

  useEffect(() => {
    cargarDatos();
  }, [isLoggedIn]);

  const toggleFavorito = (id: number): void => {
    if (!isLoggedIn) return;

    const nuevosFavs = favoritos.includes(id) ? favoritos.filter(fId => fId !== id) : [...favoritos, id];
    setFavoritos(nuevosFavs);
    const storageKey = getFavoritesStorageKey();
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(nuevosFavs));
  };

  const handleEliminar = async (id: number): Promise<void> => {
    if (!window.confirm('¿Seguro que deseas eliminar este proyecto ganador?')) return;
    try {
      await api.delete(`/proyectos/${id}`);
      setTopProyectos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Error eliminando", err);
    }
  };

  // --- Lógica Filtrado usando la interfaz global ---
  const proyectosFiltrados = useMemo(() => {
    let resultado = [...topProyectos];

    // Filtrar por tipo
    if (filtros.tipo !== 'todos') {
      resultado = resultado.filter(p => p.tipo.includes(filtros.tipo));
    }

    // Si algún día decides usar el filtro de trabajador aquí, ya está programado:
    if (filtros.trabajador !== 'todos') {
      resultado = resultado.filter(p => p.nombreTrabajador === filtros.trabajador);
    }

    // Ordenar
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaSubida).getTime();
      const fechaB = new Date(b.fechaSubida).getTime();

      if (filtros.orden === 'reciente') return fechaB - fechaA;
      if (filtros.orden === 'antiguo') return fechaA - fechaB;
      if (filtros.orden === 'valoracionAlta') return b.media - a.media;
      if (filtros.orden === 'valoracionBaja') return a.media - b.media;
      return 0;
    });

    return resultado;
  }, [topProyectos, filtros]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      {/* ESTRUCTURA FLEXBOX PARA EMPUJAR EL FOOTER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-grow pt-24 pb-20">
            <header className="max-w-[1400px] mx-auto px-4 md:px-8 mt-24 mb-16 relative">
                {/* Elemento Decorativo */}
                <div className="absolute -top-10 -right-6 text-on-surface font-headline text-8xl md:text-9xl tracking-[1rem] opacity-[0.03] transform rotate-12 pointer-events-none uppercase">
                    HALL OF FAME
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start mb-6 gap-6 relative z-10 pt-12">
                    <div className="text-center md:text-left mt-4 md:mt-0">
                        <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">El Salón de la Fama</span>
                        <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tight text-on-surface block mb-2">
                            Proyectos <span className="text-outline-variant italic">Más Gustados</span>
                        </h1>
                    </div>
                </div>

                <div className="border-l-2 border-primary pl-4 mx-auto md:mx-0 relative z-10 mb-12">
                    <p className="text-on-surface-variant font-body text-sm leading-relaxed max-w-lg">
                        Aquí se inmortaliza lo mejor. Explora los tatuajes y plantillas con mayor valoración.
                    </p>
                </div>

                {/* PANEL DE FILTROS */}
                <div className="mt-8 glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-6 relative group z-10 max-w-4xl">
                    <div className="flex-grow md:w-1/2 relative space-y-3">
                        <label className="text-outline font-label text-xs tracking-widest uppercase block mb-2">
                            Ordenar Por
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-surface-container-highest border border-outline-variant/30 px-4 py-4 pr-10 focus:outline-none focus:border-primary transition-all font-label text-xs uppercase appearance-none cursor-pointer rounded-sm text-on-surface"
                                value={filtros.orden}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
                            >
                                <option value="reciente">Nuevos Ganadores</option>
                                <option value="antiguo">Más antiguos</option>
                                <option value="valoracionAlta">De mayor a menor valoración</option>
                                <option value="valoracionBaja">De menor a mayor valoración</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                        </div>
                    </div>

                    <div className="flex-grow md:w-1/2 relative space-y-3">
                        <label className="text-outline font-label text-xs tracking-widest uppercase block mb-2">
                            Tipo de Proyecto
                        </label>
                        <div className="relative">
                            <select
                                className="w-full bg-surface-container-highest border border-outline-variant/30 px-4 py-4 pr-10 focus:outline-none focus:border-primary transition-all font-label text-xs uppercase appearance-none cursor-pointer rounded-sm text-on-surface"
                                value={filtros.tipo}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosProyectos['tipo'] })}
                            >
                                <option value="todos">Tatuajes y Plantillas</option>
                                <option value="tatuaje">Solo Tatuajes</option>
                                <option value="plantilla">Solo Plantillas</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">expand_more</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24">
                {/* RENDERIZADO DEL COMPONENTE REUTILIZADO */}
                {loading && (
                    <div className="text-center py-20 flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
                        <p className="font-label text-xs tracking-widest text-primary uppercase">Abriendo el salón de la fama...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center py-20 bg-error-container/20 text-error border border-error/50 p-6 rounded-sm mb-12">
                        <span className="material-symbols-outlined text-4xl mb-2">error</span>
                        <p className="font-body text-sm uppercase">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="relative">
                        <ListaProyectos
                        proyectos={proyectosFiltrados}
                        favoritos={favoritos}
                        onToggleFav={toggleFavorito}
                        puedeEditarFn={() => false}
                        navigate={navigate}
                        onEliminar={handleEliminar}
                        />
                    </div>
                )}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}