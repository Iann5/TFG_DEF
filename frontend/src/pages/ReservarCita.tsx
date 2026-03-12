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
        packsTrabajador,
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
        <div className="min-h-screen bg-[#0B0A10] font-sans selection:bg-sky-500/30">
            <Navbar />

            <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                        Reserva tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">Cita</span>
                    </h1>
                    <p className="text-xl text-white/60 font-light max-w-2xl">
                        Sigue los pasos para asegurar tu sesión.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/5 rounded-full h-2 mb-12 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(paso / 5) * 100}%` }}
                    ></div>
                </div>

                {/* Dynamic Steps rendering based on current state */}
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
                        packsTrabajador={packsTrabajador}
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
            <Footer />
        </div>
    );
}
