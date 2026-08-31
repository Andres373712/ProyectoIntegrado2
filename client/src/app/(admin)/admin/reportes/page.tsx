"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DollarSign, ShoppingCart, Receipt } from "lucide-react";
import { useReportes } from "@/features/reportes/useReportes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCLP } from "@/lib/utils";

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center space-x-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="rounded-full bg-brand/10 p-3">
        <Icon className="h-8 w-8 text-brand" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold text-foreground">{value}</h3>
      </div>
    </div>
  );
}

function AdminReportes() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const { ventas, clientas, productos } = useReportes(desde || undefined, hasta || undefined);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">Ventas, clientas recurrentes y productos más vendidos.</p>
      </header>

      <div className="mb-8 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      {ventas.error && <p className="mb-4 text-destructive">{ventas.error}</p>}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Vendido"
          value={ventas.loading ? "…" : `$${formatCLP(ventas.data?.totalVentas ?? 0)}`}
          icon={DollarSign}
        />
        <StatCard
          title="N° de Pedidos"
          value={ventas.loading ? "…" : (ventas.data?.totalPedidos ?? 0)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Ticket Promedio"
          value={ventas.loading ? "…" : `$${formatCLP(ventas.data?.ticketPromedio ?? 0)}`}
          icon={Receipt}
        />
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-foreground">Ventas por día</h2>
        {ventas.loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : ventas.data && ventas.data.porPeriodo.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventas.data.porPeriodo}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => `$${formatCLP(value)}`} />
              <Line
                type="monotone"
                dataKey="totalVentas"
                name="Ventas"
                stroke="hsl(var(--brand))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">No hay ventas en el rango seleccionado.</p>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-foreground">Clientas recurrentes</h2>
        {clientas.error && <p className="mb-4 text-destructive">{clientas.error}</p>}
        {clientas.loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : clientas.data && clientas.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Total gastado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientas.data.map((c) => (
                <TableRow key={c.clienteId}>
                  <TableCell>{c.nombre ?? "—"}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell className="text-right">{c.totalPedidos}</TableCell>
                  <TableCell className="text-right">${formatCLP(c.totalGastado)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No hay clientas con pedidos en el rango seleccionado.</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-foreground">Productos más vendidos</h2>
        {productos.error && <p className="mb-4 text-destructive">{productos.error}</p>}
        {productos.loading ? (
          <p className="text-muted-foreground">Cargando…</p>
        ) : productos.data && productos.data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Unidades vendidas</TableHead>
                <TableHead className="text-right">Total generado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.data.map((p) => (
                <TableRow key={p.productoId}>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell className="text-right">{p.cantidadVendida}</TableCell>
                  <TableCell className="text-right">${formatCLP(p.totalGenerado)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No hay productos vendidos en el rango seleccionado.</p>
        )}
      </div>
    </div>
  );
}

export default AdminReportes;
