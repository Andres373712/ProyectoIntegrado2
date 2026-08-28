export interface PedidoAdminItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoAdmin {
  id: number;
  total: number;
  estado: string;
  fechaPedido: string;
  cliente: {
    nombre: string | null;
    email: string | null;
    telefono: string | null;
  };
  items: PedidoAdminItem[];
}
