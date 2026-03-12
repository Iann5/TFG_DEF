interface PageBackgroundProps {
    /** Opacidad del fondo (0-1). Por defecto 0.15. */
    opacity?: number;
}

/** Fondo decorativo fijo con la imagen de paneles invertida, común a todas las páginas. */
export default function PageBackground({ opacity = 0.15 }: PageBackgroundProps) {
    return (
        <div
            className="fixed inset-0 z-0 pointer-events-none"
            style={{
                backgroundImage: "url('/paneles.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity,
                filter: 'invert(1)',
            }}
        />
    );
}
