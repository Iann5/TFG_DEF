import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente de utilidad que hace scroll al inicio de la página
 * cada vez que cambia la ruta de navegación.
 * Debe colocarse dentro de <BrowserRouter>.
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
