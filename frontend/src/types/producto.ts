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

// Interfaz para manejar la respuesta de API Platform (Hydra)
export interface HydraResponse<T> {
    'hydra:member'?: T[];
    member?: T[];
}

export interface ProductoPayload {
    nombre: string;
    descripcion: string;
    precio_original: number;
    precio_oferta: number | null;
    stock: number;
    imagen?: string | null;
    fecha_subida?: string;
    creador?: string;
}

// Versión simplificada para formularios de edición
export interface ProductoForm {
    id: number;
    nombre: string;
    descripcion: string;
    precio_original: number;
    precio_oferta: number | null;
    stock: number;
    imagen?: string;
    fecha_subida?: string;
}