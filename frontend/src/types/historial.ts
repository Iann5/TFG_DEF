// Tipos para la vista de Historial de pedidos (admin)

export interface ProductoMini {
    id: number;
    nombre: string;
    imagen: string;
}

export interface LineaPedidoRaw {
    id: number;
    cantidad: number;
    precio: number;
    producto?: ProductoMini;
}

export interface PedidoRaw {
    id: number;
    metodoPago?: string;
    metodo_pago?: string;
    total: number;
    fechaCompra?: string;
    fecha_compra?: string;
    pais: string;
    direccion: string;
    provincia: string;
    localidad: string;
    cp: string;
    estado: string;
    usuario?: string | {
        id?: number;
        nombre?: string;
        apellidos?: string;
        email?: string;
    };
    lineaPedidos: LineaPedidoRaw[];
}

export interface UserMini {
    id: number;
    nombre?: string;
    apellidos?: string;
    email?: string;
    roles?: string[];
}

export type FiltroRol = 'TODOS' | 'USUARIO' | 'TRABAJADOR' | 'ADMIN';
