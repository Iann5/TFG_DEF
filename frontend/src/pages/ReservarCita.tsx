import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useReservaCita from '../hooks/useReservaCita';

// Componentes extraídos
import Paso1Artista from '../components/reservacita/Paso1Artista';
import Paso2FechaHora from '../components/reservacita/Paso2FechaHora';
import Paso3DatosPersonales from '../components/reservacita/Paso3DatosPersonales';
import Paso4DetallesTatuaje from '../components/reservacita/Paso4DetallesTatuaje';
import Paso5Confirmacion from '../components/reservacita/Paso5Confirmacion';

export default function ReservarCita() {
    const {
        paso,
        setPaso,
        trabajadores,
        plantillasTrabajador,
        horasDisponibles,
        isSubmitting,
        firmas,
        formData,
        setFormData,
        handleTrabajadorSelect,
        handleFechaChange,
        handleHoraSelect,
        handleSignComplete,
        handleSubmit
    } = useReservaCita();

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-body text-on-surface">
            <div className="fixed inset-0 z-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col min-h-screen flex-1">
                <Navbar />

                <div className="flex-grow pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full">
                    <div className="mb-12 border-b border-outline-variant/30 pb-4 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-headline text-on-surface mb-2 uppercase tracking-tight">
                            Reserva tu <span className="text-primary italic">Cita</span>
                        </h1>
                        <p className="text-sm md:text-base text-outline-variant font-label uppercase tracking-[0.2em]">
                            Sigue los pasos para asegurar tu sesión.
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface-container/30 border border-outline-variant/30 h-2 mb-12 rounded-sm overflow-hidden relative">
                        <div
                            className="primary-gradient-cta h-full transition-all duration-500 ease-out"
                            style={{ width: `${(paso / 5) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-end mb-4">
                        <span className="text-primary font-label text-xs tracking-[0.2em] uppercase">Paso {paso} de 5</span>
                    </div>

                    {/* Dynamic Steps rendering based on current state */}
                    <div className="glass-panel p-6 md:p-10 relative group">
                        {paso === 1 && (
                            <Paso1Artista
                                trabajadores={trabajadores}
                                onSelect={handleTrabajadorSelect}
                            />
                        )}

                        {paso === 2 && (
                            <Paso4DetallesTatuaje
                                formData={formData}
                                setFormData={setFormData}
                                trabajadores={trabajadores}
                                plantillasTrabajador={plantillasTrabajador}
                                onBack={() => setPaso(1)}
                                onNext={() => setPaso(3)}
                            />
                        )}

                        {paso === 3 && (
                            <Paso2FechaHora
                                formData={formData}
                                horasDisponibles={horasDisponibles}
                                onBack={() => setPaso(2)}
                                onFechaChange={handleFechaChange}
                                onHoraSelect={handleHoraSelect}
                            />
                        )}

                        {paso === 4 && (
                            <Paso3DatosPersonales
                                formData={formData}
                                setFormData={setFormData}
                                onBack={() => setPaso(3)}
                                onNext={() => setPaso(5)}
                            />
                        )}

                        {paso === 5 && (
                            <Paso5Confirmacion
                                isSubmitting={isSubmitting}
                                firmas={firmas}
                                formData={formData}
                                trabajador={trabajadores.find(t => t.id === formData.trabajadorId) || null}
                                onBack={() => setPaso(4)}
                                onSignComplete={handleSignComplete}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </div>

                </div>
                <Footer />
            </div>
        </div>
    );
}
