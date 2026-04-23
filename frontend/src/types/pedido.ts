// Tipos para pedidos en el perfil de usuario

export interface PedidoProducto {
    id: number;
    nombre: string;
    imagen: string;
}

export interface PedidoLinea {
    cantidad: number;
    precio: number;
    producto: PedidoProducto;
}

export interface Pedido {
    id: number;
    total: number;
    fecha_compra: string;
    estado: string;
    metodo_pago: string;
    direccion: string;
    localidad: string;
    provincia: string;
    cp: string;
    pais: string;
    lineaPedidos?: PedidoLinea[];
}
