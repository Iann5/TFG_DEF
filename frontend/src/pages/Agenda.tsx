import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Agenda() {
    const navigate = useNavigate();
    const { trabajadorId } = useParams<{ trabajadorId?: string }>();
    const { isLoggedIn, hasRole } = useAuth();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());

    // Auth & Access check
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        } else if (!hasRole('ROLE_TRABAJADOR') && !hasRole('ROLE_ADMIN')) {
            navigate('/perfil');
        }
    }, [isLoggedIn, hasRole, navigate]);

    // Helpers para el calendario
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo, 1 = Lunes
    // Ajustamos para que Lunes sea 0 y Domingo sea 6
    const firstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Años disponibles (año actual + 5)
    const availableYears = Array.from({ length: 6 }, (_, i) => today.getFullYear() + i);

    const handleDayClick = (day: number) => {
        // Formatear a YYYY-MM-DD
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (trabajadorId) {
            navigate(`/agenda/${trabajadorId}/dia/${formattedDate}`);
        } else {
            navigate(`/agenda/dia/${formattedDate}`);
        }
    };

    return (
        <div className="min-h-screen bg-background text-on-surface flex flex-col relative selection:bg-primary/30 selection:text-primary">
            {/* Texture overlay */}
            <div className="fixed inset-0 pointer-events-none mix-blend-overlay opacity-20 z-0 bg-[url('/noise.svg')]"></div>
            
            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />

                <main className="flex-grow pt-40 md:pt-48 pb-20 relative z-10 px-4 md:px-8 max-w-[1200px] w-full mx-auto">
                    {/* Header y Navegación */}
                    <div className="mb-12">
                        <button
                            onClick={() => {
                                if (trabajadorId && hasRole('ROLE_ADMIN')) {
                                    navigate('/admin/agenda');
                                } else {
                                    navigate('/perfil');
                                }
                            }}
                            className="flex items-center gap-2 text-outline hover:text-primary font-label text-[10px] uppercase tracking-widest mb-10 transition-colors group w-fit"
                        >
                            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Volver
                        </button>
                        
                        <div className="flex flex-col gap-2 border-b border-outline-variant/20 pb-8 relative">
                           <span className="font-label text-primary text-[10px] uppercase tracking-[0.3em] block">
                               Gestión de Citas
                           </span>
                           <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-wide leading-none flex items-center gap-4">
                               {trabajadorId ? 'Agenda del Trabajador' : 'Tu Agenda'}
                               <span className="material-symbols-outlined text-primary text-4xl mb-1">calendar_month</span>
                           </h1>
                        </div>
                    </div>

                    <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
                         {/* Control Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-10 gap-6 border-b border-outline-variant/20 pb-6">
                            <div>
                                <h2 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wide text-on-surface flex items-baseline gap-3">
                                    {MESES[month]} <span className="text-primary">{year}</span>
                                </h2>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs tracking-widest uppercase rounded-sm px-6 py-3 cursor-pointer outline-none focus:border-primary transition-colors pr-10"
                                        value={month}
                                        onChange={(e) => setMonth(Number(e.target.value))}
                                    >
                                        {MESES.map((m, i) => (
                                            <option key={m} value={i}>{m}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">expand_more</span>
                                </div>

                                <div className="relative">
                                    <select
                                        className="appearance-none bg-surface-container border border-outline-variant/30 text-on-surface font-label text-xs tracking-widest uppercase rounded-sm px-6 py-3 cursor-pointer outline-none focus:border-primary transition-colors pr-10"
                                        value={year}
                                        onChange={(e) => {
                                            const selectedYear = Number(e.target.value);
                                            if (selectedYear === today.getFullYear() && month < today.getMonth()) {
                                                setMonth(today.getMonth());
                                            }
                                            setYear(selectedYear);
                                        }}
                                    >
                                        {availableYears.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none text-[20px]">expand_more</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid del Calendario */}
                        <div className="grid grid-cols-7 gap-3 sm:gap-4">
                            {/* Días de la semana */}
                            {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
                                <div key={d} className="text-center font-label text-xs md:text-sm text-outline uppercase tracking-[0.2em] py-2 border-b border-outline-variant/20">
                                    {d}
                                </div>
                            ))}

                            {/* Celdas vacías */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="p-4 bg-surface-container/20 rounded-sm" />
                            ))}

                            {/* Días del mes */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                                const isPast = (year === today.getFullYear() && month === today.getMonth() && day < today.getDate()) || (year === today.getFullYear() && month < today.getMonth());

                                return (
                                    <button
                                        key={day}
                                        onClick={() => !isPast && handleDayClick(day)}
                                        disabled={isPast}
                                        className={`
                                            relative aspect-square flex flex-col items-center justify-center font-headline text-xl md:text-2xl transition-all duration-300 rounded-sm overflow-hidden border
                                            ${isToday
                                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)] hover:bg-primary hover:text-on-primary'
                                                : isPast
                                                    ? 'bg-surface-container/20 border-transparent text-outline-variant/50 cursor-not-allowed'
                                                    : 'bg-surface-container border-outline-variant/30 text-on-surface hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer'
                                            }
                                        `}
                                    >
                                        {isToday && (
                                            <span className="absolute top-1 left-1 font-label text-[8px] uppercase tracking-widest opacity-80 flex items-center">
                                                ★
                                            </span>
                                        )}
                                        {isPast && (
                                            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay"></div>
                                        )}
                                        <span className="relative z-10">{day}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
