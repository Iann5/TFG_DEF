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
    precioOriginal: number;
    precioOferta: number | null;
    stock: number;
    cantidad: number;
    productos?: ItemContenido[]; 
    proyectos?: ItemContenido[];
}