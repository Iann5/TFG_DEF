import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


// Componente auxiliar para las cajas grises con "X"
const Placeholder = ({ className }: { className?: string }) => (
  <div className={`bg-gray-400 rounded-md relative overflow-hidden ${className}`}>
    <svg className="absolute inset-0 w-full h-full text-gray-500" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <line x1="0" y1="0" x2="100" y2="100" />
      <line x1="100" y1="0" x2="0" y2="100" />
    </svg>
  </div>
);

export default function HomePage() {
  return (
    // CONTENEDOR PRINCIPAL CON EL FONDO
    <div className="min-h-screen font-sans relative bg-[#1C1B28] overflow-hidden">
        
      {/* CAPA DE FONDO MANGA (Opacidad 24% y Filtro Invertir para "Exposición Negativa") */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
            backgroundImage: "url('/paneles.jpg')", // ¡Asegúrate de que la imagen está en /public!
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.24,
            filter: 'invert(1)' // Esto crea el efecto de negativo
        }}
      ></div>

      {/* CONTENIDO DE LA PÁGINA (Z-10 para estar encima del fondo) */}
      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar />

        {/* CUERPO PRINCIPAL */}
        <main className="container mx-auto px-4 py-8 flex-grow space-y-8">

            {/* SECCIÓN 1: Especialidad Principal */}
            <section className="bg-gray-600 p-4 rounded-lg shadow-lg bg-opacity-80 backdrop-blur-sm">
                <div className="bg-gray-300 text-gray-800 font-bold inline-block px-4 py-1 rounded-t-md mb-2">
                    Estilo Principal
                </div>
                <div className="bg-gray-200 h-16 rounded-md mb-4 flex items-center px-4 text-gray-600 font-bold">
                    INFO
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Placeholder className="aspect-square" />
                    <Placeholder className="aspect-square" />
                    <Placeholder className="aspect-square" />
                </div>
            </section>

            {/* SECCIÓN 2: Estilos más solicitados */}
            <section className="bg-gray-600 p-4 rounded-lg shadow-lg bg-opacity-80 backdrop-blur-sm">
                <div className="bg-gray-300 text-gray-800 font-bold inline-block px-4 py-1 rounded-t-md mb-2">
                    Estilos más solicitados
                </div>
                <div className="bg-gray-200 h-16 rounded-md mb-4 flex items-center px-4 text-gray-600 font-bold">
                    INFO
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Placeholder className="aspect-square" />
                    <Placeholder className="aspect-square" />
                    <Placeholder className="aspect-square" />
                </div>
            </section>

            {/* SECCIÓN 3: Google Maps */}
            <section className="bg-gray-600 p-4 rounded-lg shadow-lg bg-opacity-80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl cursor-pointer">
                <div className="bg-gray-200 h-32 rounded-md flex items-center justify-center text-gray-700 font-bold text-xl hover:h-96 transition-all duration-300 overflow-hidden">
                    Google Maps
                </div>
            </section>

            {/* SECCIÓN 4: INFO Inferior */}
            <section className="bg-gray-600 p-4 rounded-lg shadow-lg bg-opacity-80 backdrop-blur-sm">
                 <div className="bg-gray-300 text-gray-800 font-bold inline-block px-4 py-1 rounded-t-md mb-2">
                    INFO
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="bg-gray-200 flex-grow rounded-md p-8 flex items-center justify-center text-center font-bold text-gray-700 min-h-[200px]">
                        Texto Informativo del local
                    </div>
                    <div className="flex flex-col gap-4 md:w-auto">
                      <Placeholder className="h-64 w-64" />
                      <Placeholder className="h-64 w-64" />
                    </div>
                </div>
            </section>

        </main>

        {/* FOOTER */}
        <Footer />

      </div>
    </div>
  );
}