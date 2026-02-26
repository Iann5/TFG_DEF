export interface ProductoRaw {
    id: number;
    nombre?: string;
    descripcion?: string;
    imagen?: string;
    precio_original?: number;
    precio_oferta?: number | null;
    stock?: number;
    fecha_subida?: string;
}