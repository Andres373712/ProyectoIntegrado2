import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

function AdminDashboard() {
    const [data, setData] = useState({
        eventosCalendario: [],
        totalClientas: 0,
        totalTalleresActivos: 0
    });
    const [cargando, setCargando] = useState(true);

    // Obtener token y headers (como en los otros componentes de admin)
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
    }, []); // Se ejecuta solo una vez al cargar

    if (cargando) return <p className="text-center p-10">Cargando dashboard...</p>;

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <h1 className="text-3xl font-bold text-tmm-dark mb-8">Dashboard Principal</h1>

            {/* --- Sección de Estadísticas Rápidas --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-4xl font-bold text-tmm-pink">{data.totalClientas}</h2>
                    <p className="text-gray-600 mt-2">Clientas Registradas</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h2 className="text-4xl font-bold text-tmm-mint">{data.totalTalleresActivos}</h2>
                    <p className="text-gray-600 mt-2">Talleres Activos</p>
                </div>
                {/* Puedes añadir más tarjetas aquí si quieres */}
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                     <h2 className="text-4xl font-bold text-tmm-blue">...</h2>
                     <p className="text-gray-600 mt-2">Próxima Métrica</p>
                 </div>
            </div>

            {/* --- Sección del Calendario --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-tmm-dark mb-4">Calendario de Talleres</h2>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={data.eventosCalendario}
                    locale='es' // Poner el calendario en español
                    buttonText={{ // Textos de los botones en español
                       today:    'Hoy',
                       month:    'Mes',
                       week:     'Semana',
                       day:      'Día',
                       list:     'Lista'
                    }}
                    headerToolbar={{ // Qué botones mostrar
                       left: 'prev,next today',
                       center: 'title',
                       right: 'dayGridMonth' // Puedes añadir 'dayGridWeek,dayGridDay' si quieres
                    }}
                    height="auto" // Ajustar altura automáticamente
                />
            </div>
        </div>
    );
}

export default AdminDashboard;