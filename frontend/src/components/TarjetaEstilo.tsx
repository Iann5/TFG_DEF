import type { EstiloType } from "../types/EstiloInterface";


// Definimos qué datos necesita este componente para funcionar
interface Props {
    datos: EstiloType; // Recibe un objeto de tipo Estilo
}

export default function TarjetaEstilo({ datos }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
      
      {/* 1. IMAGEN (Placeholder por ahora) */}
      <div className="h-48 bg-gray-800 flex items-center justify-center">
        <span className="text-4xl">🎨</span>
      </div>

      {/* 2. CONTENIDO */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
            {datos.nombre}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3">
            {datos.informacion}
        </p>

        {/* 3. BOTÓN */}
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
            Ver Tatuadores
        </button>
      </div>
    </div>
  );
}