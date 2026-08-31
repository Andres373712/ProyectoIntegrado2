"use client";

import React from "react";
import { usePedidosAdmin } from "@/features/carrito/usePedidosAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, AlertTriangle, ShoppingBag } from "lucide-react";
import { formatCLP, formatFechaCL } from "@/lib/utils";

const ESTILO_ESTADO: Record<string, string> = {
  pendiente: "bg-warning/10 text-warning",
  pagado: "bg-success/10 text-success",
  enviado: "bg-admin-c/10 text-admin-c",
  cancelado: "bg-destructive/10 text-destructive",
};

function EstadoBadge({ estado }: { estado: string }) {
  const estilo = ESTILO_ESTADO[estado] || "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${estilo}`}
    >
      {estado}
    </span>
  );
}

const AdminPedidos = () => {
  const { pedidos, loading, error } = usePedidosAdmin();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 rounded-md bg-destructive/10 p-4 text-destructive">
          <AlertTriangle size={24} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="whitespace-nowrap align-top">
                      {formatFechaCL(pedido.fechaPedido, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="align-top">
                      <p className="font-medium">{pedido.cliente.nombre || "(Sin nombre)"}</p>
                      <p className="text-sm text-muted-foreground">{pedido.cliente.email || "-"}</p>
                      {pedido.cliente.telefono && (
                        <p className="text-xs text-muted-foreground">{pedido.cliente.telefono}</p>
                      )}
                    </TableCell>
                    <TableCell className="align-top">
                      <ul className="space-y-1">
                        {pedido.items.map((item, i) => (
                          <li key={i} className="text-sm">
                            {item.cantidad}× {item.nombre}{" "}
                            <span className="text-muted-foreground">
                              (${formatCLP(item.precioUnitario)} c/u)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="align-top font-bold whitespace-nowrap">
                      ${formatCLP(pedido.total)}
                    </TableCell>
                    <TableCell className="align-top">
                      <EstadoBadge estado={pedido.estado} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Aún no hay pedidos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPedidos;
