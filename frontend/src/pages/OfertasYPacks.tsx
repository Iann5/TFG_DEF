import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageBackground from '../components/PageBackground';
import { useAuth } from '../context/AuthContext';
import useOfertasYPacks from '../hooks/useOfertasYPacks';
import FiltrosPromociones from '../components/ofertas/FiltrosPromociones';
import GridPromociones from '../components/ofertas/GridPromociones';

export default function OfertasYPacks() {
  const { hasRole, isLoggedIn } = useAuth();
  const puedeEditar = isLoggedIn && (hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN'));

  const {
    filtros,
    setFiltros,
    itemsFiltrados,
    loading,
    error,
    handleToggleCategoria,
    handleEliminar
  } = useOfertasYPacks();

  return (
    <div className="bg-[#1C1B28] text-white relative">
      <PageBackground opacity={0.2} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-light text-center mb-10">
            Ofertas y <span className="text-sky-500 font-bold">Packs</span>
          </h1>

          <FiltrosPromociones
            filtros={filtros}
            setFiltros={setFiltros}
            onToggleCategoria={handleToggleCategoria}
          />

          {error && (
            <div className="text-red-500 text-center text-xl bg-red-900/20 p-4 rounded-xl border border-red-900 mb-6">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="text-white text-center text-xl animate-pulse">
              Cargando la tienda...
            </div>
          )}

          {!loading && !error && (
            <GridPromociones
              items={itemsFiltrados}
              puedeEditar={puedeEditar as boolean}
              onEliminar={handleEliminar}
            />
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}