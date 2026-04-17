import { useState, useEffect, type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getUserPhotoKey } from '../utils/authUtils';

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className={`relative transition-all duration-500 hidden md:flex items-center bg-surface-container border-b ${isFocused ? 'w-80 border-primary' : 'w-64 border-outline-variant/30 hover:border-primary/50'} px-4 py-2`}>
      <span className="material-symbols-outlined text-outline">search</span>
      <form onSubmit={handleSearch} className="flex-1 ml-2">
        <input
          type="text"
          placeholder="BUSCAR..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="bg-transparent border-none focus:outline-none w-full font-label tracking-widest text-xs uppercase placeholder:text-outline/50 text-on-surface"
        />
      </form>
      {searchValue && (
        <button
          type="button"
          onClick={() => setSearchValue('')}
          className="flex-shrink-0 text-outline hover:text-primary transition-colors flex items-center justify-center p-1"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
  );
};

const NavDropdown = ({ title, defaultLink, items }: { title: string, defaultLink?: string, items: { label: string, to: string }[] }) => {
  const buttonClasses = "flex items-center gap-1 font-label text-xs uppercase tracking-widest text-[#8c909f] hover:text-[#adc6ff] transition-colors duration-300";
  return (
    <div className="relative group p-4 -m-4">
      {defaultLink ? (
        <Link to={defaultLink} className={buttonClasses}>
          {title}
          <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-180">expand_more</span>
        </Link>
      ) : (
        <button className={buttonClasses}>
          {title}
          <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-180">expand_more</span>
        </button>
      )}
      
      {/* Dropdown Menu - Glassmorphism */}
      <div className="absolute top-full left-0 mt-2 bg-surface/80 backdrop-blur-xl border border-outline-variant/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-48 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 rounded-sm">
        {items.map((item, index) => (
          item.to.startsWith('#') ? (
            <a key={index} href={`/${item.to}`} className="block px-4 py-3 hover:bg-surface-container hover:text-primary transition-colors font-label text-[11px] tracking-widest uppercase text-on-surface border-b border-outline-variant/10 last:border-0 whitespace-nowrap">
              {item.label}
            </a>
          ) : (
            <Link key={index} to={item.to} className="block px-4 py-3 hover:bg-surface-container hover:text-primary transition-colors font-label text-[11px] tracking-widest uppercase text-on-surface border-b border-outline-variant/10 last:border-0 whitespace-nowrap">
              {item.label}
            </Link>
          )
        ))}
      </div>
    </div>
  );
};

function MobileNavLink({
  to,
  children,
  onNavigate,
  className = '',
}: {
  to: string;
  children: ReactNode;
  onNavigate: () => void;
  className?: string;
}) {
  const base =
    'flex min-h-11 items-center px-1 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface hover:text-primary transition-colors';
  const combined = `${base} ${className}`.trim();
  if (to.startsWith('#')) {
    return (
      <a href={`/${to}`} className={combined} onClick={onNavigate}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={combined} onClick={onNavigate}>
      {children}
    </Link>
  );
}

function MobileNavAccordion({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="border-b border-outline-variant/20 last:border-b-0 [&[open]_summary_.nav-chevron]:rotate-180">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-1 py-2 font-label text-xs uppercase tracking-widest text-outline hover:text-primary [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="nav-chevron material-symbols-outlined text-lg transition-transform duration-200">expand_more</span>
      </summary>
      <div className="border-t border-outline-variant/10 bg-surface-container-low/40 pb-2 pl-3 pr-1 pt-1">{children}</div>
    </details>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isLoggedIn, hasRole, refreshAuth } = useAuth();
  const { cartCount } = useCart();

  const isAdmin = hasRole('ROLE_ADMIN');
  const isTrabajador = hasRole('ROLE_TRABAJADOR');
  const isUsuario = !isTrabajador && !isAdmin;

  const citaPath = isAdmin ? '/admin/agenda' : isTrabajador ? '/agenda' : '/cita';
  const closeMobile = () => setMobileMenuOpen(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const syncPhoto = () => {
      const photoKey = getUserPhotoKey();
      const photo = photoKey ? localStorage.getItem(photoKey) : null;
      setUserPhoto(photo);
    };

    syncPhoto();
    window.addEventListener('storage', syncPhoto);
    return () => window.removeEventListener('storage', syncPhoto);
  }, []);

  const handleLogout = () => {
    const photoKey = getUserPhotoKey();
    if (photoKey) localStorage.removeItem(photoKey);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('storage'));
    refreshAuth();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const menuEstudio = [
    { label: "Equipo", to: "/equipo" },
    { label: "Estilos", to: "/estilos" },
    { label: "Proyectos", to: "/proyecto" },
    { label: "Proyectos demandados", to: "/plantillasDemandadas" },
    { label: "Proyectos más gustados", to: "/ProyectosMasGustados" },
  ];

  const menuProductos = [
    { label: "Merchandising", to: "/merchandising" },
    { label: "Ofertas y Packs", to: "/ofertasYpacks" },
  ];

  const menuHerramientas = [
    { label: "Añadir estilo", to: "/crearEstilo" },
    { label: "Añadir tatuaje", to: "/addTatuaje" },
    { label: "Añadir producto", to: "/addProducto" },
    { label: "Crear pack", to: "/crearPack" },
  ];

  const menuGestion = [
    { label: "Historial", to: "/historial" },
    { label: "Gestionar Roles", to: "/gestionRoles" },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 custom-glass border-b border-primary/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex justify-between items-center gap-3 sm:gap-6 min-w-0">

          {/* LOGO */}
          <Link
            to="/"
            className="text-base sm:text-xl font-headline font-black tracking-widest text-[#e3e1ed] uppercase flex items-center hover:text-primary transition-colors shrink-0 min-w-0"
          >
            <span className="truncate">TATTOO</span> <span className="text-primary italic ml-1 shrink-0">PARADISE</span>
          </Link>

          {/* NAVEGACIÓN PRINCIPAL */}
          <div className="hidden lg:flex items-center gap-8 font-label text-xs uppercase tracking-widest">
            
            <NavDropdown title="INICIO" defaultLink="/" items={[{ label: "CONTACTO", to: "#info-local" }]} />

            <NavDropdown title="ESTUDIO" items={menuEstudio} />
            <NavDropdown title="PRODUCTOS" items={menuProductos} />

            {(isTrabajador || isAdmin) && (
              <NavDropdown title="HERRAMIENTAS" items={menuHerramientas} />
            )}

            {isAdmin && (
              <NavDropdown title="GESTIÓN" items={menuGestion} />
            )}

          </div>

          {/* CONTENEDOR DERECHO: hamburguesa delante del buscador (orden visual) */}
          <div className="flex gap-2 sm:gap-4 items-center min-w-0 shrink">
            <button
              type="button"
              className="lg:hidden p-2 min-w-11 min-h-11 flex items-center justify-center text-outline hover:text-primary transition-colors shrink-0"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>

            <SearchBar />

            {(isUsuario || isTrabajador || isAdmin) && (
               <Link to={citaPath} className="hidden md:flex items-center gap-2 text-primary hover:text-secondary transition-colors font-label text-xs uppercase tracking-widest shrink-0">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  <span>Cita</span>
               </Link>
            )}

            <button
              type="button"
              onClick={() => navigate('/carrito')}
              className="relative p-2 text-outline hover:text-primary transition-colors shrink-0"
              title="Carrito"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <>
                <Link
                  to="/perfil"
                  className="lg:hidden w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors flex items-center justify-center shrink-0"
                  title="Mi perfil"
                >
                  {userPhoto ? (
                    <img src={userPhoto} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline">account_circle</span>
                  )}
                </Link>
                <div className="relative group pl-2 hidden lg:block">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary transition-colors flex items-center justify-center cursor-pointer"
                    title="Mi perfil"
                  >
                    {userPhoto ? (
                      <img src={userPhoto} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">account_circle</span>
                    )}
                  </button>

                  <div className="absolute top-full right-0 mt-4 bg-surface/90 backdrop-blur-xl border border-outline-variant/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-w-48 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 rounded-sm">
                    <Link to="/perfil" className="block px-4 py-3 hover:bg-surface-container hover:text-primary transition-colors font-label text-[11px] tracking-widest uppercase text-on-surface border-b border-outline-variant/10">
                      VER PERFIL
                    </Link>
                    <button type="button" onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-error-container hover:text-error transition-colors font-label text-[11px] tracking-widest uppercase text-error">
                      CERRAR SESIÓN
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex gap-4 items-center pl-2 border-l border-outline-variant/30">
                <Link to="/login" className="text-outline hover:text-primary font-label text-xs uppercase tracking-widest transition-colors">ENTRAR</Link>
                <Link to="/registro" className="primary-gradient-cta px-4 py-1.5 rounded-sm font-label tracking-widest text-[#00285d] text-xs font-bold uppercase transition-all shadow-[0_4px_15px_rgba(173,198,255,0.15)] hover:shadow-[0_4px_25px_rgba(173,198,255,0.3)]">CREAR CUENTA</Link>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* Fuera de <nav>: evita que backdrop-filter del nav encierre position:fixed en ~80px de alto */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-20 z-[40] bg-black/60 lg:hidden border-0 p-0 cursor-pointer"
            aria-label="Cerrar menú"
            onClick={closeMobile}
          />
          <div
            id="mobile-nav"
            className="fixed top-20 left-0 bottom-0 z-[45] w-full max-w-sm lg:hidden bg-surface-container border-r border-outline-variant/20 shadow-[8px_0_32px_rgba(0,0,0,0.45)] overflow-y-auto overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
          >
            <div className="p-4 pb-10 flex flex-col">
              <button
                type="button"
                onClick={() => {
                  closeMobile();
                  navigate('/buscar');
                }}
                className="flex min-h-11 items-center gap-2 px-1 py-2 font-label text-[11px] uppercase tracking-widest text-on-surface border-b border-outline-variant/15 hover:text-primary text-left"
              >
                <span className="material-symbols-outlined text-lg text-outline">search</span>
                Buscar
              </button>

              {(isUsuario || isTrabajador || isAdmin) && (
                <MobileNavLink to={citaPath} onNavigate={closeMobile} className="border-b border-outline-variant/15">
                  <span className="material-symbols-outlined text-lg text-outline mr-2">calendar_month</span>
                  Cita / Agenda
                </MobileNavLink>
              )}

              <div className="mt-2 flex flex-col rounded-sm border border-outline-variant/20 overflow-hidden">
                <MobileNavAccordion title="Inicio">
                  <MobileNavLink to="/" onNavigate={closeMobile} className="border-b border-outline-variant/10 last:border-0">
                    Portada
                  </MobileNavLink>
                  <MobileNavLink to="#info-local" onNavigate={closeMobile}>
                    Contacto
                  </MobileNavLink>
                </MobileNavAccordion>

                <MobileNavAccordion title="Estudio">
                  {menuEstudio.map((item) => (
                    <MobileNavLink
                      key={item.to}
                      to={item.to}
                      onNavigate={closeMobile}
                      className="border-b border-outline-variant/10 last:border-0"
                    >
                      {item.label}
                    </MobileNavLink>
                  ))}
                </MobileNavAccordion>

                <MobileNavAccordion title="Productos">
                  {menuProductos.map((item) => (
                    <MobileNavLink
                      key={item.to}
                      to={item.to}
                      onNavigate={closeMobile}
                      className="border-b border-outline-variant/10 last:border-0"
                    >
                      {item.label}
                    </MobileNavLink>
                  ))}
                </MobileNavAccordion>

                {(isTrabajador || isAdmin) && (
                  <MobileNavAccordion title="Herramientas">
                    {menuHerramientas.map((item) => (
                      <MobileNavLink
                        key={item.to}
                        to={item.to}
                        onNavigate={closeMobile}
                        className="border-b border-outline-variant/10 last:border-0"
                      >
                        {item.label}
                      </MobileNavLink>
                    ))}
                  </MobileNavAccordion>
                )}

                {isAdmin && (
                  <MobileNavAccordion title="Gestión">
                    {menuGestion.map((item) => (
                      <MobileNavLink
                        key={item.to}
                        to={item.to}
                        onNavigate={closeMobile}
                        className="border-b border-outline-variant/10 last:border-0"
                      >
                        {item.label}
                      </MobileNavLink>
                    ))}
                  </MobileNavAccordion>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <MobileNavLink to="/perfil" onNavigate={closeMobile}>
                      Ver perfil
                    </MobileNavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-left flex min-h-11 items-center px-1 py-2 font-label text-[11px] uppercase tracking-widest text-error hover:text-error/80 transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="flex min-h-11 items-center justify-center border border-outline-variant/40 font-label text-xs uppercase tracking-widest text-on-surface hover:border-primary hover:text-primary transition-colors rounded-sm"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/registro"
                      onClick={closeMobile}
                      className="flex min-h-11 items-center justify-center primary-gradient-cta rounded-sm font-label text-xs font-bold uppercase tracking-widest text-[#00285d] shadow-md"
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}