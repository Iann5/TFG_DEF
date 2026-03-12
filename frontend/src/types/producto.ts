export interface ProductoRaw {
    id: number;
    nombre?: string;
    descripcion?: string;
    imagen?: string;
    imagenes?: string[];
    // API Platform puede devolver snake_case o camelCase según el grupo de serialización
    precio_original?: number;
    precio_oferta?: number | null;
    precioOriginal?: number;
    precioOferta?: number | null;
    stock?: number;
    fecha_subida?: string;
    fechaSubida?: string;
    /** Media de valoraciones calculada en el backend */
    media?: number;
    creadorUserId?: number;
    creador?: {
        usuario?: {
            nombre?: string;
            apellidos?: string;
        }
    }
}