import type { EstiloType } from "../types/EstiloInterface";
import TarjetaEstilo from "./TarjetaEstilo"; // Importamos la pieza pequeña

interface Props {
    estilos: EstiloType[]; // Recibe un ARRAY de estilos
}

export default function ListaEstilos({ estilos }: Props) {
  // Si la lista está vacía, mostramos un aviso
  if (estilos.length === 0) {
    return <p className="text-center text-gray-500 py-10">No se han encontrado estilos.</p>;
  }

  return (
    // Aquí definimos la GRID (1 columna en móvil, 2 en tablet, 3 en PC)
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      {estilos.map((estilo) => (
        // Renderizamos la tarjeta pasándole los datos
        <TarjetaEstilo key={estilo.id} datos={estilo} />
      ))}
      
    </div>
  );
}