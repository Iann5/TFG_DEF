// src/pages/OfertasYPacks.tsx
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-grow max-w-[1400px]">
          <div className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mt-24">
            <div className="relative">
              <span className="font-label text-primary text-xs uppercase tracking-[0.3em] block mb-4">Promociones Especiales</span>
              <h1 className="font-headline text-5xl md:text-7xl font-bold uppercase tracking-tight leading-none">
                Ofertas y<br/>
                <span className="text-outline-variant">Packs</span>
              </h1>
              {/* Decorative elements */}
              <div className="absolute -left-4 top-0 w-1 h-32 bg-primary"></div>
              <div className="absolute left-0 -top-4 w-12 h-1 bg-primary"></div>
            </div>
          </div>

          <FiltrosPromociones
            filtros={filtros}
            setFiltros={setFiltros}
            onToggleCategoria={handleToggleCategoria}
          />

          {error && (
            <div className="text-error bg-error/10 p-4 border border-error/50 font-body text-base mb-8 rounded-sm text-center">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="text-center py-20 text-on-surface/50 font-label text-sm tracking-[0.2em] uppercase animate-pulse">
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