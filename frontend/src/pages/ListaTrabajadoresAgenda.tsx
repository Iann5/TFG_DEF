import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { type TrabajadorResumen } from '../types/trabajador';

export default function ListaTrabajadoresAgenda() {
  const navigate = useNavigate();
  const { isLoggedIn, hasRole } = useAuth();
  const [trabajadores, setTrabajadores] = useState<TrabajadorResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!hasRole('ROLE_ADMIN')) {
      navigate('/perfil');
      return;
    }

    const fetchTrabajadores = async () => {
      try {
        const res = await api.get<TrabajadorResumen[]>('/trabajadors');
        const activos = res.data.filter((t: any) => {
            return t.usuario && t.usuario.roles ? t.usuario.roles.includes('ROLE_TRABAJADOR') : true;
        });
        setTrabajadores(activos);
      } catch (err) {
        console.error("Error al obtener trabajadores:", err);
        setError("Error al cargar la lista de trabajadores.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrabajadores();
  }, [isLoggedIn, hasRole, navigate]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Texture overlay */}
      <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />

        <main className="flex-grow pt-40 md:pt-48 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
          <div className="relative overflow-hidden rounded-sm">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/Plantilla-Sesion.png)' }}
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div className="relative z-10 p-6 md:p-8">
              <button
                onClick={() => navigate('/perfil')}
                className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest transition-colors group w-fit mb-10"
              >
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Volver
              </button>

              <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none text-center mb-10">
                Selecciona Trabajador
              </h1>

              {loading ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-primary text-4xl animate-spin">refresh</span>
                  <p className="font-label text-xs uppercase tracking-widest text-outline-variant mt-4">Cargando...</p>
                </div>
              ) : error ? (
                <div className="bg-error/10 border border-error/50 p-6 rounded-sm text-center">
                  <p className="font-body text-error text-sm">{error}</p>
                </div>
              ) : trabajadores.length === 0 ? (
                <div className="bg-surface-container-highest/40 border border-outline-variant/30 p-8 rounded-sm text-center">
                  <p className="font-body text-on-surface/70">No hay trabajadores registrados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trabajadores.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => navigate(`/agenda/${t.id}`)}
                      className="bg-surface-container-highest/40 backdrop-blur-md border border-outline-variant/30 hover:border-primary/50 rounded-sm p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center gap-4 group"
                    >
                      <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border border-outline-variant/30 bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        {t.usuario.foto_perfil ? (
                          <img src={t.usuario.foto_perfil} alt={t.usuario.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>

                      <div className="px-2">
                        <h3 className="font-headline text-xl font-bold uppercase tracking-wide text-on-surface group-hover:text-primary transition-colors">
                          {t.usuario.nombre} {t.usuario.apellidos}
                        </h3>
                        <span className="font-label text-[10px] uppercase tracking-widest text-outline-variant mt-1 block">
                          Tatuador
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
