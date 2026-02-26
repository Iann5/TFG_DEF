import { useEffect, useState } from 'react'; // <--- 1. NUEVO: Importar Hooks
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api'; // <--- 1. NUEVO: Importar API
import type { EstiloType } from '../types/estilo'; // <--- 1. NUEVO: Importar el Tipo (Le cambio el nombre a EstiloType para que no choque)
import ListaEstilos from '../components/ListaEstilo';// <--- 1. NUEVO: Importar tu lista

const Estilo = () => { // Mejor llamar a la página "EstilosPage"

  // 2. NUEVO: Lógica para pedir los datos
  const [estilos, setEstilos] = useState<EstiloType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstilos = async () => {
        try {
            const response = await api.get('/estilos');
            setEstilos(response.data['hydra:member']);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchEstilos();
  }, []);


  return (
    // CONTENEDOR PRINCIPAL CON EL FONDO
        <div className="min-h-screen font-sans relative bg-[#1C1B28] overflow-hidden">
            
          {/* CAPA DE FONDO MANGA */}
          <div 
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                backgroundImage: "url('/paneles.jpg')", 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.24,
                filter: 'invert(1)' 
            }}
          ></div>
    
          {/* CONTENIDO DE LA PÁGINA */}
          <div className="relative z-10 flex flex-col min-h-screen">
    
            <Navbar />
    
            {/* CUERPO PRINCIPAL */}
            <main className="container mx-auto px-4 py-8 flex-grow space-y-8">

              {/* BARRA DE BOTONES (FILTROS) - La dejamos porque queda bonita */}
              <section className="bg-gray-600 p-4 rounded-lg shadow-lg bg-opacity-80 backdrop-blur-sm">
                  <div className="bg-gray-300 text-gray-800 font-bold inline-block px-4 py-1 rounded-t-md mb-2">
                    Filtros Rápidos
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="bg-gray-200 w-full p-4 rounded-md mb-4 flex flex-wrap gap-2 items-center justify-center font-bold text-gray-700">
                      {/* Aquí podrías hacer que estos botones filtren la lista de abajo en el futuro */}
                      <button className='px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm transition'>Todos</button>
                      <button className='px-4 py-2 bg-gray-600 hover:bg-cyan-500 text-white rounded-lg text-sm transition'>Manga</button>
                      <button className='px-4 py-2 bg-gray-600 hover:bg-cyan-500 text-white rounded-lg text-sm transition'>Realismo</button>
                      {/* ... más botones ... */}
                    </div>
                  </div>
                </section>

              {/* 3. NUEVO: AQUÍ SUSTITUIMOS TUS SECCIONES "DURAS" POR LA LISTA DINÁMICA */}
              
              {loading ? (
                  <p className="text-white text-center">Cargando estilos...</p>
              ) : (
                  // Aquí se pintan todos los estilos que vengan de la base de datos
                  // Usando el diseño que definiste en TarjetaEstilo.tsx
                  <ListaEstilos estilos={estilos} />
              )}

              {/* HE BORRADO LAS SECCIONES MANUALES DE "MANGA" Y "PUNTILLISMO" 
                  PORQUE AHORA SALDRÁN AUTOMÁTICAMENTE ARRIBA GRACIAS A <ListaEstilos /> 
              */}

            </main>
    
            <Footer />
    
          </div>
        </div>
  )
}

export default Estilo;