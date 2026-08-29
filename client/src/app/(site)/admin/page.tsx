"use client";

import React from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import {
  LayoutDashboard,
  BookOpenText,
  ShoppingBag,
  ShoppingCart,
  Users,
  CalendarDays,
  ArrowRight,
  Mail,
  MessageSquareQuote,
  type LucideIcon,
} from "lucide-react";
import { useDashboardData } from "@/features/admin/useDashboardData";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  color: string;
}

interface ActionCardProps {
  title: string;
  description: string;
  link: string;
  icon: LucideIcon;
  color: string;
}

// Componente de Tarjeta de Estadística
const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="flex items-center space-x-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
    <div className={`rounded-full p-3 ${color}/10 text-white`}>
      <Icon className={`h-8 w-8 ${color.replace("bg-", "text-")}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    </div>
  </div>
);

// Componente de Tarjeta de Acción Rápida (Navegación)
const ActionCard = ({ title, description, link, icon: Icon, color }: ActionCardProps) => (
  <Link
    href={link}
    className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
  >
    <div
      className={`absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20`}
    >
      <Icon className={`h-24 w-24 ${color.replace("bg-", "text-")}`} />
    </div>
    <div className="relative z-10">
      <div
        className={`h-12 w-12 rounded-lg ${color} mb-4 flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <span className="flex items-center text-sm font-medium text-primary group-hover:underline">
        Ir a gestionar <ArrowRight className="ml-1 h-4 w-4" />
      </span>
    </div>
  </Link>
);

function AdminDashboard() {
  const { data, cargando } = useDashboardData();

  if (cargando)
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <p className="animate-pulse text-lg text-muted-foreground">Cargando panel de control...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-muted p-6 md:p-10">
      {/* --- Encabezado --- */}
      <header className="mb-10">
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-foreground md:text-4xl">
          <LayoutDashboard className="h-8 w-8 text-primary" />
          Panel de Control
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Bienvenida, Carolina. Aquí tienes el resumen de tu negocio hoy.
        </p>
      </header>

      {/* --- Sección 1: Estadísticas Clave --- */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Clientas Registradas"
          value={data.totalClientas}
          icon={Users}
          color="bg-admin-d"
        />
        <StatCard
          title="Talleres Activos"
          value={data.totalTalleresActivos}
          icon={BookOpenText}
          color="bg-admin-a"
        />
        <StatCard
          title="Próximos Eventos"
          value={data.eventosCalendario.length}
          icon={CalendarDays}
          color="bg-brand"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* --- Sección 2: Accesos Directos (Gestión) --- */}
        <div className="space-y-6 lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-foreground">Gestión Rápida</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ActionCard
              title="Gestionar Talleres"
              description="Crea nuevos talleres, edita la información, sube fotos y controla los cupos."
              link="/admin/talleres"
              icon={BookOpenText}
              color="bg-admin-a"
            />
            <ActionCard
              title="Inventario de Productos"
              description="Administra tu stock de kits, insumos y productos físicos para la venta."
              link="/admin/productos"
              icon={ShoppingBag}
              color="bg-admin-b"
            />
            <ActionCard
              title="Pedidos"
              description="Revisa los pedidos del carrito: cliente, productos, total y estado de cada compra."
              link="/admin/pedidos"
              icon={ShoppingCart}
              color="bg-admin-c"
            />
            <ActionCard
              title="Base de Clientas (CRM)"
              description="Consulta la lista de asistentes, revisa su historial y añade notas de seguimiento."
              link="/admin/clientes"
              icon={Users}
              color="bg-admin-d"
            />
            <ActionCard
              title="Mensajes de Contacto"
              description="Revisa los mensajes y preguntas enviadas por los visitantes desde el formulario de contacto."
              link="/admin/mensajes"
              icon={Mail}
              color="bg-admin-e"
            />
            <ActionCard
              title="Comentarios y Recomendaciones"
              description="Carga y administra los testimonios de clientas que se muestran en el sitio público."
              link="/admin/testimonios"
              icon={MessageSquareQuote}
              color="bg-admin-f"
            />
          </div>
        </div>

        {/* --- Sección 3: Calendario --- */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-xl font-bold text-foreground">Agenda</h2>
          <div className="h-full rounded-xl border border-border bg-card p-4 shadow-sm">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={data.eventosCalendario}
              locale="es"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "",
              }}
              height="400px"
              eventColor="hsl(var(--brand))" // Token de marca (--brand en globals.css)
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
