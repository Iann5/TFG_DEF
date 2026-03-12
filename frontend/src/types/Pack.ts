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
    creador?: {
        id?: number;
        usuario?: {
            nombre?: string;
            apellidos?: string;
        }
    }
}