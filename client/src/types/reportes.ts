export interface VentaPorPeriodo {
  periodo: string;
  totalVentas: number;
  totalPedidos: number;
}

export interface ResumenVentas {
  totalVentas: number;
  totalPedidos: number;
  ticketPromedio: number;
  porPeriodo: VentaPorPeriodo[];
}

export interface ClientaRecurrente {
  clienteId: number;
  nombre: string | null;
  email: string | null;
  totalPedidos: number;
  totalGastado: number;
}

export interface ProductoTop {
  productoId: number;
  nombre: string;
  cantidadVendida: number;
  totalGenerado: number;
}
