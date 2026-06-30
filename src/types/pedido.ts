export interface DetallePedido {
    productoId: number;
    productoNombre?: string;
    idProducto?: number;
    nombreProducto?: string;
    cantidad: number;
    subtotal: number;
}

export interface Pedido {
    id: number | string;
    fecha: string;
    estado: "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";
    total: number;
    formaPago: "TARJETA" | "TRANSFERENCIA" | "EFECTIVO";
    usuarioId: number;
    idUsuario?: number;
    direccion?: string;
    telefono?: string;
    detalles: DetallePedido[];
}
