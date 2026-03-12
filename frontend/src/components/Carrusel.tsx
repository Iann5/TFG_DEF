import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarruselProps {
    images: string[];
    alt: string;
}

/**
 * Carrusel de imágenes con controles de navegación y contador.
 * Si no hay imágenes muestra un placeholder "IMG".
 */
export default function Carrusel({ images, alt }: CarruselProps) {
    const [index, setIndex] = useState(0);

    const prev = () => setIndex(i => (i === 0 ? images.length - 1 : i - 1));
    const next = () => setIndex(i => (i === images.length - 1 ? 0 : i + 1));

    if (images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-black">
                IMG
            </div>
        );
    }

    return (
        <div className="relative w-full h-full group">
            <img
                src={images[index]}
                alt={`${alt} - ${index + 1}`}
                className="w-full h-full object-contain transition-transform duration-500"
            />

            {images.length > 1 && (
                <>
                    {/* Contador */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 z-10 shadow-lg border border-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 12 12 17 22 12" /><polyline points="2 17 12 22 22 17" />
                        </svg>
                        <span>{index + 1} / {images.length}</span>
                    </div>

                    {/* Flecha izquierda */}
                    <button
                        onClick={e => { e.preventDefault(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Flecha derecha */}
                    <button
                        onClick={e => { e.preventDefault(); next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-white/20"
                        aria-label="Imagen siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}
        </div>
    );
}
