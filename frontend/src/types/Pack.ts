export interface ItemContenido {
    id: number;
    nombre?: string;         // Para Productos
    tituloTatuaje?: string;  // Para Proyectos
}

export interface PackDetalle {
    id: number;
    titulo: string;
    descripcion: string;
    tipoPack: string;
    imagen: string;
    imagenes?: string[];
    precioOriginal: number;
    precioOferta: number | null;
    stock: number;
    cantidad: number;
    productos?: ItemContenido[];
    proyectos?: ItemContenido[];
    media?: number;
    fecha_subida?: string;
    autor?: {
        id?: number;
    };
    creadorUserId?: number;
    creador?: string | {
        id?: number;
        usuario?: {
            nombre?: string;
            apellidos?: string;
        }
    }
}

// Tipos para el formulario CrearPack

export interface ItemSelect {
    id: number;
    nombre?: string;
    tituloTatuaje?: string;
    tipo?: string;
    imagen?: string;
}

export interface PackAPI {
    id: number;
    titulo: string;
    descripcion: string;
    tipoPack: string;
    precioOriginal: number;
    precioOferta: number | null;
    stock: number;
    cantidad: number;
    imagen: string;
    imagenes: string[];
    productos: (string | { id: number })[];
    proyectos: (string | { id: number })[];
}

export interface PackPayload {
    titulo: string;
    descripcion: string;
    tipoPack: string;
    imagenes: string[];
    imagen: string;
    precioOriginal: number;
    precioOferta: number | null;
    stock: number;
    cantidad: number;
    productos: string[];
    proyectos: string[];
    creador?: string;
}

export interface ApiCollectionResponse<T> {
    'hydra:member'?: T[];
    member?: T[];
}

export type ApiResult<T> = T[] | ApiCollectionResponse<T>;

export type PackType = 'producto' | 'plantilla' | 'tatuaje';