import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Agenda() {
    const navigate = useNavigate();
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
        navigate(`/agenda/dia/${formattedDate}`);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <Navbar />

            <div
                className="flex-1 bg-cover bg-center bg-no-repeat relative p-6 flex flex-col items-center"
                style={{ backgroundImage: 'url(/Plantilla-Sesion.png)' }}
            >
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 w-full max-w-5xl mt-8">
                    {/* Botón Volver */}
                    <button
                        onClick={() => navigate('/perfil')}
                        className="text-white hover:text-sky-300 transition text-4xl mb-6 font-bold"
                    >
                        ←
                    </button>

                    <h1 className="text-4xl font-bold text-white text-center mb-8 uppercase tracking-widest">Tu Agenda</h1>

                    <div className="bg-slate-800/80 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">

                        {/* Controles de Mes y Año */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                            <h2 className="text-3xl font-bold text-white">
                                {MESES[month]} <span className="text-sky-400">{year}</span>
                            </h2>

                            <div className="flex gap-4">
                                <select
                                    className="bg-slate-700 border border-white/20 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                                    value={month}
                                    onChange={(e) => setMonth(Number(e.target.value))}
                                >
                                    {MESES.map((m, i) => (
                                        <option key={m} value={i}>{m}</option>
                                    ))}
                                </select>

                                <select
                                    className="bg-slate-700 border border-white/20 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                                    value={year}
                                    onChange={(e) => {
                                        const selectedYear = Number(e.target.value);
                                        // Si cambian al año actual, no permitir un mes anterior al actual
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
                            </div>
                        </div>

                        {/* Grid del Calendario */}
                        <div className="grid grid-cols-7 gap-2">
                            {/* Días de la semana */}
                            {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(d => (
                                <div key={d} className="text-center text-sky-300 font-bold py-2 text-sm sm:text-base border-b border-white/20">
                                    {d}
                                </div>
                            ))}

                            {/* Celdas vacías (offset del primer día del mes) */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="p-4" />
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
                                            relative h-20 sm:h-28 rounded-xl border flex flex-col items-center justify-center text-lg sm:text-2xl font-bold transition-all duration-300
                                            ${isToday
                                                ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:bg-red-500 scale-105 z-10'
                                                : isPast
                                                    ? 'bg-slate-800/40 border-transparent text-white/20 cursor-not-allowed'
                                                    : 'bg-slate-700/60 border-white/10 text-white hover:bg-sky-600/50 hover:border-sky-400 cursor-pointer hover:scale-105'
                                            }
                                        `}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
