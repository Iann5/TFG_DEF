import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// IMPORTAMOS LOS COMPONENTES Y TIPOS REUTILIZABLES (Cero duplicidades, cero 'any')
import ListaProyectos from '../components/ListaProyecto';
import {
    type RawProyecto,
    type ProyectoNormalizado,
    type FiltrosProyectos
} from '../types/proyecto';

export default function PlantillasDemandadas() {
    const navigate = useNavigate();
    const { hasRole, isLoggedIn } = useAuth();
    const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

    const [plantillas, setPlantillas] = useState<ProyectoNormalizado[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [favoritos, setFavoritos] = useState<number[]>([]);

    // Usamos un estado de filtros más sencillo para esta vista
    const [filtros, setFiltros] = useState({
        busqueda: '',
        orden: 'reciente' as FiltrosProyectos['orden']
    });

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const res = await api.get<RawProyecto[]>('/proyectos');

                const rawData: RawProyecto[] = res.data;

                // 1. Filtramos solo las plantillas y normalizamos los datos
                const soloPlantillasNormalizadas: ProyectoNormalizado[] = rawData
                    .filter(p => (p.tipo || '').toLowerCase().includes('plantilla'))
                    .map(p => {
                        const valoraciones = p.valoracionProyectos || [];
                        return {
                            id: p.id,
                            titulo: p.tituloTatuaje || p.nombre || 'Plantilla sin título',
                            descripcion: p.descripcion || 'Sin descripción disponible.',
                            estilo: p.estilo || 'Varios',
                            tipo: 'plantilla',
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

                setPlantillas(soloPlantillasNormalizadas);

                // Cargar favoritos del LocalStorage
                const favsGuardados = localStorage.getItem('mis_favoritos_plantillas');
                if (favsGuardados) setFavoritos(JSON.parse(favsGuardados));

            } catch (err) {
                if (err instanceof AxiosError) setError(`Error ${err.response?.status}`);
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const toggleFavorito = (id: number): void => {
        const nuevosFavs = favoritos.includes(id)
            ? favoritos.filter(fId => fId !== id)
            : [...favoritos, id];

        setFavoritos(nuevosFavs);
        localStorage.setItem('mis_favoritos_plantillas', JSON.stringify(nuevosFavs));
    };

    const handleEliminar = async (id: number): Promise<void> => {
        if (!window.confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
        try {
            await api.delete(`/proyectos/${id}`);
            setPlantillas(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Error eliminando", err);
        }
    };

    // --- Lógica de filtrado y ordenación ---
    const plantillasFiltradas = useMemo(() => {
        const resultado = plantillas.filter(p =>
            p.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase())
        );

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
    }, [plantillas, filtros]);

    // --- Separación Temporal: Mensual (Novedades) vs Anual (Populares) ---
    const { mensuales, anuales } = useMemo(() => {
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);

        return {
            mensuales: plantillasFiltradas.filter(p => new Date(p.fechaSubida) >= unMesAtras),
            anuales: plantillasFiltradas.filter(p => new Date(p.fechaSubida) < unMesAtras)
        };
    }, [plantillasFiltradas]);

    return (
        <div className="bg-[#1C1B28] text-white relative">

            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: "url('/paneles.jpg')", backgroundSize: 'cover', filter: 'invert(1)' }}
            ></div>

            {/* ENVOLTORIO FLEXBOX PARA EMPUJAR EL FOOTER ABAJO */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="flex-grow">
                    <header className="py-16 px-6 max-w-7xl mx-auto">
                        <h1 className="text-5xl font-extralight mb-4">
                            Plantillas <span className="text-sky-300 italic font-bold">Demandadas</span>
                        </h1>

                        {/* BARRA DE FILTROS */}
                        <div className="mt-10 flex flex-col md:flex-row gap-4 bg-[#323444]/80 backdrop-blur-sm p-4 rounded-3xl border border-white/5 shadow-2xl">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por estilo o nombre..."
                                    className="w-full bg-transparent py-3 pl-12 pr-4 outline-none text-lg"
                                    value={filtros.busqueda}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltros({ ...filtros, busqueda: e.target.value })}
                                />
                            </div>
                            <div className="h-10 w-[1px] bg-gray-700 hidden md:block self-center"></div>
                            <select
                                className="bg-transparent px-4 py-3 outline-none cursor-pointer text-gray-300 font-light"
                                value={filtros.orden}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFiltros({ ...filtros, orden: e.target.value as FiltrosProyectos['orden'] })}
                            >
                                <option value="reciente" className="bg-[#1C1B28]">Novedades</option>
                                <option value="antiguo" className="bg-[#1C1B28]">Más antiguos</option>
                                <option value="valoracionAlta" className="bg-[#1C1B28]">Mejor valorados</option>
                                <option value="valoracionBaja" className="bg-[#1C1B28]">Peor valorados</option>
                            </select>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-6 pb-24">
                        {loading && <p className="text-sky-300 text-center text-xl animate-pulse font-bold">Cargando las mejores plantillas...</p>}
                        {error && <p className="text-red-400 text-center bg-red-900/20 p-4 rounded-lg">{error}</p>}

                        {/* NOVEDADES MENSUALES */}
                        {!loading && mensuales.length > 0 && (
                            <section className="mb-24">
                                <h2 className="text-3xl font-bold mb-10 flex items-center gap-4">
                                    <span className="w-12 h-[2px] bg-sky-500"></span>
                                    Tendencias del Mes
                                </h2>
                                <ListaProyectos
                                    proyectos={mensuales}
                                    favoritos={favoritos}
                                    onToggleFav={toggleFavorito}
                                    puedeEditar={puedeEditar}
                                    navigate={navigate}
                                    onEliminar={handleEliminar}
                                />
                            </section>
                        )}

                        {/* POPULARES ANUALES */}
                        {!loading && anuales.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 text-gray-400">
                                    <span className="w-12 h-[2px] bg-gray-600"></span>
                                    Catálogo Histórico
                                </h2>
                                <div className="opacity-90">
                                    <ListaProyectos
                                        proyectos={anuales}
                                        favoritos={favoritos}
                                        onToggleFav={toggleFavorito}
                                        puedeEditar={puedeEditar}
                                        navigate={navigate}
                                        onEliminar={handleEliminar}
                                    />
                                </div>
                            </section>
                        )}

                        {!loading && plantillasFiltradas.length === 0 && (
                            <div className="text-gray-500 text-center text-xl py-10">No se encontraron plantillas con esos filtros.</div>
                        )}
                    </main>
                </div>

                <Footer />
            </div>
        </div>
    );
}