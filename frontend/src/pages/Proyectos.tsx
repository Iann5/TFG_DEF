import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Star, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageBackground from '../components/PageBackground';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ListaProyectos from '../components/ListaProyecto';
import TarjetaProyecto from '../components/TarjetaProyecto';
import { type RawProyecto, type ProyectoNormalizado, type FiltrosProyectos } from '../types/proyecto';


export default function Proyectos() {
  const navigate = useNavigate();
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const [proyectos, setProyectos] = useState<ProyectoNormalizado[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<number[]>([]);

  const [filtros, setFiltros] = useState<FiltrosProyectos>({
    orden: 'reciente',
    tipo: 'todos',
    trabajador: 'todos'
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await api.get<RawProyecto[]>('/proyectos');

      const rawData: RawProyecto[] = res.data;

      // Mapeo seguro a la interfaz normalizada
      const proyectosMapeados: ProyectoNormalizado[] = rawData.map(p => {
        const valoraciones = p.valoracionProyectos || [];
        return {
          id: p.id,
          titulo: p.tituloTatuaje || p.nombre || 'Sin título',
          descripcion: p.descripcion || 'Sin descripción disponible.',
          estilo: p.estilo || 'Varios',
          tipo: p.tipo || 'tatuaje',
          precioOriginal: p.precioOriginal ?? p.precio_original ?? 0,
          precioOferta: p.precioOferta ?? p.precio_oferta ?? null,
          imagen: p.imagen || '',
          nombreTrabajador: p.autor?.usuario?.nombre
            ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}`
            : 'Desconocido',
          fechaSubida: p.fechaSubida || p.fecha_subida || new Date(0).toISOString(),
          valoraciones: valoraciones,
          media: p.media || 0
        };
      });

      setProyectos(proyectosMapeados);

      const favs = localStorage.getItem('mis_favoritos_plantillas');
      if (favs) setFavoritos(JSON.parse(favs));
    } catch (err) {
      if (err instanceof AxiosError) setError(`Error ${err.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const toggleFavorito = (id: number): void => {
    const nuevosFavs = favoritos.includes(id) ? favoritos.filter(fId => fId !== id) : [...favoritos, id];
    setFavoritos(nuevosFavs);
    localStorage.setItem('mis_favoritos_plantillas', JSON.stringify(nuevosFavs));
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
    <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">
      <PageBackground opacity={0.15} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <h1 className="text-4xl font-bold text-white uppercase tracking-wider">Proyectos</h1>
            {puedeEditar && (
              <button
                onClick={() => navigate('/addTatuaje')}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow-lg shadow-sky-900/40"
              >
                + Añadir Proyecto
              </button>
            )}
          </div>

          {/* TOP DEL MES */}
          {(topDelMes.mejorTatuaje || topDelMes.mejorPlantilla) && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-sky-400 mb-6 flex items-center gap-3">
                <Star className="fill-sky-400" /> Proyectos más gustados del mes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topDelMes.mejorTatuaje && (
                  <TarjetaProyecto
                    proyecto={topDelMes.mejorTatuaje}
                    esFavorito={false} onToggleFav={() => { }} puedeEditar={false} navigate={navigate} onEliminar={() => { }} isTop
                  />
                )}
                {topDelMes.mejorPlantilla && (
                  <TarjetaProyecto
                    proyecto={topDelMes.mejorPlantilla}
                    esFavorito={favoritos.includes(topDelMes.mejorPlantilla.id)}
                    onToggleFav={toggleFavorito}
                    puedeEditar={false} navigate={navigate} onEliminar={() => { }} isTop
                  />
                )}
              </div>
            </section>
          )}

          {/* FILTROS */}
          <div className="bg-[#323444]/80 p-6 rounded-2xl border border-white/5 mb-10 flex flex-col md:flex-row gap-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 text-white/50 font-bold uppercase text-sm tracking-wider w-full md:w-auto">
              <Filter size={20} /> Filtrar Galería
            </div>
            <div className="flex flex-wrap flex-grow gap-4">
              <select
                className="bg-[#1C1B28] text-white border border-[#3B82F6]/30 p-3 rounded-xl outline-none focus:border-sky-500 flex-1 min-w-[150px]"
                value={filtros.orden}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
              >
                <option value="reciente">Más recientes</option>
                <option value="antiguo">Más antiguos</option>
                <option value="valoracionAlta">Mayor valoración</option>
                <option value="valoracionBaja">Menor valoración</option>
              </select>
              <select
                className="bg-[#1C1B28] text-white border border-[#3B82F6]/30 p-3 rounded-xl outline-none focus:border-sky-500 flex-1 min-w-[150px]"
                value={filtros.tipo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosProyectos['tipo'] })}
              >
                <option value="todos">Todos los Tipos</option>
                <option value="tatuaje">Solo Tatuajes</option>
                <option value="plantilla">Solo Plantillas</option>
              </select>
              <select
                className="bg-[#1C1B28] text-white border border-[#3B82F6]/30 p-3 rounded-xl outline-none focus:border-sky-500 flex-1 min-w-[150px]"
                value={filtros.trabajador}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, trabajador: e.target.value })}
              >
                <option value="todos">Cualquier Artista</option>
                {trabajadoresUnicos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* RENDERIZADO DEL COMPONENTE LISTA */}
          {loading && <p className="text-white text-center text-xl animate-pulse">Cargando el arte...</p>}
          {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>}
          {!loading && !error && (
            <ListaProyectos
              proyectos={proyectosFiltrados}
              favoritos={favoritos}
              onToggleFav={toggleFavorito}
              puedeEditar={puedeEditar}
              navigate={navigate}
              onEliminar={handleEliminar}
            />
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
}