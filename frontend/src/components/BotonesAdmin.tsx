interface BotonesAdminProps {
    onEditar: () => void;
    onEliminar: () => void;
    /** Tamaño de relleno. 'sm' para tarjetas (py-1.5), 'md' para secciones (py-2). Por defecto 'sm'. */
    size?: 'sm' | 'md';
}

/**
 * Par de botones ✏️ Editar / 🗑 Eliminar para usuarios con rol admin/trabajador.
 * Se insertan dentro del componente padre ya condicionado con `puedeEditar`.
 */
export default function BotonesAdmin({ onEditar, onEliminar, size = 'sm' }: BotonesAdminProps) {
    const py = size === 'md' ? 'py-2' : 'py-1.5';

    return (
        <div className="flex gap-2 pt-2">
            <button
                onClick={onEditar}
                className={`flex-1 ${py} bg-amber-600/80 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition`}
            >
                ✏️ Editar
            </button>
            <button
                onClick={onEliminar}
                className={`flex-1 ${py} bg-red-700/80 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition`}
            >
                🗑 Eliminar
            </button>
        </div>
    );
}
