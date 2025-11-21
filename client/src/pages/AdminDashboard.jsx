import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { 
    LayoutDashboard, 
    BookOpenText, 
    ShoppingBag, 
    Users, 
    CalendarDays,
    ArrowRight
} from 'lucide-react'; 

// Componente de Tarjeta de Estadística
const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 text-white`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
    </div>
);

// Componente de Tarjeta de Acción Rápida (Navegación)
const ActionCard = ({ title, description, link, icon: Icon, color }) => (
    <Link 
        to={link} 
        className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon className={`w-24 h-24 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 text-white shadow-md group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            <span className="text-sm font-medium text-primary flex items-center group-hover:underline">
                Ir a gestionar <ArrowRight className="w-4 h-4 ml-1" />
            </span>
        </div>
    </Link>
);

function AdminDashboard() {
    const [data, setData] = useState({
        eventosCalendario: [],
        totalClientas: 0,
        totalTalleresActivos: 0
    });
    const [cargando, setCargando] = useState(true);

    const token = localStorage.getItem('tmm_token');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    useEffect(() => {
        axios.get('http://localhost:5000/api/dashboard-data', authHeaders)
            .then(response => {
                setData(response.data);
                setCargando(false);
            })
            .catch(error => {
                console.error("Error al cargar datos del dashboard:", error);
                setCargando(false);
            });
    }, []);

    if (cargando) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-lg text-gray-500 animate-pulse">Cargando panel de control...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            
            {/* --- Encabezado --- */}
            <header className="mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    Panel de Control
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                    Bienvenida, Carolina. Aquí tienes el resumen de tu negocio hoy.
                </p>
            </header>

            {/* --- Sección 1: Estadísticas Clave --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard 
                    title="Clientas Registradas" 
                    value={data.totalClientas} 
                    icon={Users} 
                    color="bg-pink-500" 
                />
                <StatCard 
                    title="Talleres Activos" 
                    value={data.totalTalleresActivos} 
                    icon={BookOpenText} 
                    color="bg-indigo-500" 
                />
                <StatCard 
                    title="Próximos Eventos" 
                    value={data.eventosCalendario.length} 
                    icon={CalendarDays} 
                    color="bg-green-500" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- Sección 2: Accesos Directos (Gestión) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Gestión Rápida</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ActionCard 
                            title="Gestionar Talleres" 
                            description="Crea nuevos talleres, edita la información, sube fotos y controla los cupos."
                            link="/admin/talleres"
                            icon={BookOpenText}
                            color="bg-indigo-600"
                        />
                        <ActionCard 
                            title="Inventario de Productos" 
                            description="Administra tu stock de kits, insumos y productos físicos para la venta."
                            link="/admin/productos"
                            icon={ShoppingBag}
                            color="bg-green-600"
                        />
                        <ActionCard 
                            title="Base de Clientas (CRM)" 
                            description="Consulta la lista de asistentes, revisa su historial y añade notas de seguimiento."
                            link="/admin/clientes"
                            icon={Users}
                            color="bg-orange-600"
                        />
                    </div>
                </div>

                {/* --- Sección 3: Calendario --- */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Agenda</h2>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={data.eventosCalendario}
                            locale='es'
                            headerToolbar={{
                                left: 'prev,next',
                                center: 'title',
                                right: ''
                            }}
                            height="400px"
                            eventColor="#E4007C" // Color fucsia corporativo
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;