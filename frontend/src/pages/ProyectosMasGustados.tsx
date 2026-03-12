import { useEffect, useState, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Award, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

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
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

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

      const rawData: RawProyecto[] = res.data;

      const todosProyectos: ProyectoNormalizado[] = rawData.map(p => {
        const valoraciones = p.valoracionProyectos || [];
        return {
          id: p.id,
          titulo: p.tituloTatuaje || p.nombre || 'Sin título',
          descripcion: p.descripcion || 'Sin descripción disponible.',
          estilo: p.estilo || 'Varios',
          tipo: (p.tipo || 'tatuaje').toLowerCase(),
          precioOriginal: p.precioOriginal ?? p.precio_original ?? 0,
          precioOferta: p.precioOferta ?? p.precio_oferta ?? null,
          imagen: p.imagen || '',
          nombreTrabajador: p.autor?.usuario?.nombre
            ? `${p.autor.usuario.nombre} ${p.autor.usuario.apellidos || ''}`
            : 'Desconocido',
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
    <div className="min-h-screen bg-[#1C1B28] font-sans relative overflow-hidden">

      {/* FONDO GLOBAL DE PANELES */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', opacity: 0.15, filter: 'invert(1)' }}
      />

      {/* ESTRUCTURA FLEXBOX PARA EMPUJAR EL FOOTER */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="flex flex-col md:flex-row items-center justify-center mb-10 gap-4 text-center">
            <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-wider flex items-center gap-4">
              <Award className="text-sky-300 w-12 h-12" />
              Proyectos <span className="text-sky-300 font-bold italic">Más Gustados</span>
            </h1>
          </div>

          <p className="text-center text-white/60 max-w-2xl mx-auto mb-12 text-lg">
            El salón de la fama. Aquí se inmortalizan el tatuaje y la plantilla mejor valorados de cada mes.
          </p>

          {/* PANEL DE FILTROS */}
          <div className="bg-[#323444]/80 p-6 rounded-2xl border border-gray-300/20 mb-12 flex flex-col md:flex-row gap-6 shadow-xl backdrop-blur-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-sky-300 font-bold uppercase text-sm tracking-wider w-full md:w-auto">
              <Filter size={20} /> Filtros de Élite
            </div>
            <div className="flex flex-wrap flex-grow gap-4">
              <select
                className="bg-[#1C1B28] text-white border border-gray-300/30 p-3 rounded-xl outline-none focus:border-gray-300 flex-1 min-w-[150px] transition-all"
                value={filtros.orden}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
              >
                <option value="reciente">Más recientes (Nuevos ganadores)</option>
                <option value="antiguo">Más antiguos</option>
                <option value="valoracionAlta">De mayor a menor valoración</option>
                <option value="valoracionBaja">De menor a mayor valoración</option>
              </select>

              <div className="hidden md:block w-px bg-white/10 self-stretch mx-2"></div>

              <select
                className="bg-[#1C1B28] text-white border border-gray-300/30 p-3 rounded-xl outline-none focus:border-gray-300 flex-1 min-w-[150px] transition-all"
                value={filtros.tipo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, tipo: e.target.value as FiltrosProyectos['tipo'] })}
              >
                <option value="todos">Tatuajes y Plantillas</option>
                <option value="tatuaje">Solo Tatuajes</option>
                <option value="plantilla">Solo Plantillas</option>
              </select>
            </div>
          </div>

          {/* RENDERIZADO DEL COMPONENTE REUTILIZADO */}
          {loading && <p className="text-yellow-500 text-center text-xl animate-pulse font-bold">Cargando el salón de la fama...</p>}
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