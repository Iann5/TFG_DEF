import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPhotoKey } from '../utils/authUtils';

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/merchandising?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className={`relative transition-all duration-300 ${isFocused ? 'w-96' : 'w-72'}`}>
      <form onSubmit={handleSearch} className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${isFocused
        ? 'border-sky-400 bg-white'
        : 'border-gray-400 bg-white hover:border-gray-500'
        }`}>
        <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="bg-transparent focus:outline-none flex-1 text-gray-700 placeholder-gray-500 text-sm"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
};

export default function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  // Usar el AuthContext en lugar de gestionar isLoggedIn manualmente
  const { isLoggedIn, hasRole } = useAuth();

  // ¿Es trabajador o admin?
  const isTrabajadorOrAdmin = hasRole('ROLE_TRABAJADOR') || hasRole('ROLE_ADMIN');
  // ¿Es solo admin?
  const isAdmin = hasRole('ROLE_ADMIN');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    const syncPhoto = () => {
      // Leer la foto usando la clave específica del usuario actual
      const photoKey = getUserPhotoKey();
      const photo = photoKey ? localStorage.getItem(photoKey) : null;
      setUserPhoto(photo);
    };

    syncPhoto();
    window.addEventListener('storage', syncPhoto);
    return () => window.removeEventListener('storage', syncPhoto);
  }, []);


  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-black text-white shadow-2xl sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-6">

        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-sky-300 transition duration-300 flex items-center gap-2">
          TATTOO<span className="text-sky-300">PARADISE</span>
        </Link>

        <div className="flex gap-3 items-center">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 hover:bg-gray-800 rounded-lg transition duration-300 group"
              title="Más opciones"
            >
              <svg className="w-6 h-6 group-hover:text-sky-300 transition duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 min-w-56 overflow-hidden">
                {/* Links disponibles para todos */}
                <Link to="/cita" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>📅 Pedir Cita</Link>
                <Link to="/plantillasDemandadas" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>🖼️ Plantillas Demandadas</Link>
                <Link to="/ProyectosMasGustados" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>❤️ Proyectos Más Gustados</Link>
                <Link to="/informacion" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>ℹ️ Información</Link>

                {/* Links solo para Trabajador y Admin */}
                {isTrabajadorOrAdmin && (
                  <>
                    <hr className="border-gray-700" />
                    <Link to="/crearEstilo" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>🖋️ Añadir Estilo</Link>
                    <Link to="/addTatuaje" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>📓 Añadir Tatuaje</Link>
                    <Link to="/addProducto" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>📦 Añadir Producto</Link>
                    <Link to="/crearPack" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>📥 Crear Pack</Link>
                  </>
                )}

                {/* Links solo para Admin */}
                {isAdmin && (
                  <>
                    <hr className="border-gray-700" />
                    <Link to="/historial" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>📋 Historial</Link>
                    <Link to="/gestionRoles" className="block px-4 py-3 hover:bg-sky-300/20 hover:border-l-4 hover:border-l-sky-300 transition text-sm font-medium" onClick={closeMenu}>🔑 Gestionar Roles</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/" className="px-4 py-2.5 bg-gray-700 hover:bg-sky-300 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors">Inicio</Link>
          <Link to="/estilos" className="px-4 py-2.5 bg-gray-700 hover:bg-sky-300 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors">Estilos</Link>
          <Link to="/equipo" className="px-4 py-2.5 bg-gray-700 hover:bg-sky-300 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors">Equipo</Link>
          <Link to="/proyecto" className="px-4 py-2.5 bg-gray-700 hover:bg-sky-300 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors">Proyectos</Link>
          <Link to="/merchandising" className="px-4 py-2.5 bg-gray-700 hover:bg-sky-300 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors">Merchandising</Link>
          <Link to="/ofertasYpacks" className="px-4 py-2.5 bg-gray-700 hover:bg-sky-300 hover:text-gray-900 rounded-lg text-sm font-semibold transition-colors">Ofertas y Packs</Link>
        </div>

        <SearchBar />

        <div className="flex gap-5 items-center">
          <button className="p-2.5 hover:bg-gray-800 rounded-lg transition duration-300 relative group" title="Carrito">
            <svg className="w-6 h-6 group-hover:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">0</span>
          </button>

          {isLoggedIn ? (
            <>
              {/* BOTÓN DE PERFIL CON IMAGEN */}
              <button
                onClick={() => navigate('/perfil')}
                className="p-1 hover:bg-gray-800 rounded-full transition duration-300 group border-2 border-transparent hover:border-sky-300"
                title="Mi perfil"
              >
                {userPhoto ? (
                  <img src={userPhoto} alt="Perfil" className="w-9 h-9 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center group-hover:bg-gray-700 transition duration-300">
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-sky-300 transition font-medium text-sm">Entrar</Link>
              <Link to="/registro" className="bg-sky-300 hover:bg-sky-400 text-gray-900 px-5 py-2.5 rounded-lg font-semibold transition text-sm">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}