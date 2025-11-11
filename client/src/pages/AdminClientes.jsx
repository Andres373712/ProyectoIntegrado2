import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminClientes() {
    const [clientes, setClientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    // Estados para los filtros
    const [terminoBusqueda, setTerminoBusqueda] = useState(''); 
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tallerSeleccionado, setTallerSeleccionado] = useState(''); // Nuevo estado para el taller

    // Estado para la lista de talleres (para el dropdown)
    const [listaTalleres, setListaTalleres] = useState([]);

    const token = localStorage.getItem('tmm_token');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    // Función para cargar clientas (ahora con filtro de taller)
    const fetchClientes = useCallback(async (busqueda = '', inicio = '', fin = '', tallerId = '') => {
        setCargando(true);
        try {
            const params = new URLSearchParams();
            if (busqueda) params.append('buscar', busqueda);
            if (inicio) params.append('fechaInicio', inicio);
            if (fin) params.append('fechaFin', fin);
            if (tallerId) params.append('tallerId', tallerId); // Añadir el nuevo filtro

            const queryString = params.toString();
            const url = `http://localhost:5000/api/clientes${queryString ? `?${queryString}` : ''}`;

            const response = await axios.get(url, authHeaders);
            setClientes(response.data);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        } finally {
            setCargando(false);
        }
    }, [token]);

    // Cargar clientas Y la lista de talleres al inicio
    useEffect(() => {
        fetchClientes(); // Carga inicial de clientas

        // Cargar la lista de talleres para el dropdown
        axios.get('http://localhost:5000/api/talleres/todos', authHeaders)
            .then(response => {
                setListaTalleres(response.data);
            })
            .catch(error => console.error("Error al cargar lista de talleres:", error));
    }, [fetchClientes]); // fetchClientes ya incluye token como dependencia

    // Manejadores para los inputs
    const handleBusquedaChange = (e) => setTerminoBusqueda(e.target.value);
    const handleFechaInicioChange = (e) => setFechaInicio(e.target.value);
    const handleFechaFinChange = (e) => setFechaFin(e.target.value);
    const handleTallerChange = (e) => setTallerSeleccionado(e.target.value); // Nuevo manejador

    // Manejador para el envío del formulario de búsqueda
    const handleBuscarSubmit = (e) => {
        e.preventDefault(); 
        fetchClientes(terminoBusqueda, fechaInicio, fechaFin, tallerSeleccionado); // Incluir taller
    };

    // Manejador para limpiar todos los filtros
    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setFechaInicio('');
        setFechaFin('');
        setTallerSeleccionado(''); // Limpiar también el taller
        fetchClientes('', '', '', ''); // Volver a cargar sin filtros
    };


    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-5xl mx-auto"> {/* Ampliado un poco el ancho */}
                <h1 className="text-3xl font-bold text-tmm-dark mb-6">Gestión de Clientas</h1>

                {/* --- Formulario de Filtros --- */}
                <form onSubmit={handleBuscarSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-end">
                    {/* Input de Texto */}
                    <div className="flex-grow min-w-[150px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                        <input
                            type="text" placeholder="Nombre/Email..." value={terminoBusqueda}
                            onChange={handleBusquedaChange} className="w-full p-2 border rounded"
                        />
                    </div>
                     {/* Input de Fecha Inicio */}
                     <div className="min-w-[140px]">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                         <input
                             type="date" value={fechaInicio} onChange={handleFechaInicioChange}
                             className="w-full p-2 border rounded"
                         />
                     </div>
                     {/* Input de Fecha Fin */}
                     <div className="min-w-[140px]">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                         <input
                             type="date" value={fechaFin} onChange={handleFechaFinChange}
                             className="w-full p-2 border rounded"
                         />
                     </div>
                     {/* NUEVO Dropdown de Taller */}
                     <div className="flex-grow min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inscritas en Taller</label>
                        <select 
                            value={tallerSeleccionado} 
                            onChange={handleTallerChange}
                            className="w-full p-2 border rounded bg-white"
                        >
                            <option value="">-- Todos los talleres --</option>
                            {listaTalleres.map(taller => (
                                <option key={taller.id} value={taller.id}>
                                    {taller.nombre} ({new Date(taller.fecha).toLocaleDateString('es-CL')})
                                </option>
                            ))}
                        </select>
                     </div>
                     {/* Botones */}
                     <button 
                         type="submit" className="bg-tmm-pink text-white px-4 py-2 rounded-lg hover:opacity-90 self-end h-[42px]"
                     > Filtrar </button>
                      <button 
                         type="button" onClick={limpiarFiltros}
                         className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 self-end h-[42px]"
                         title="Limpiar filtros"
                     > Limpiar </button>
                </form>

                {/* --- Lista de Clientas --- */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    {/* ... (El resto del código de la lista es igual que antes) ... */}
                    {cargando ? (
                        <p className="text-center text-gray-500">Cargando clientas...</p>
                    ) : (
                        <div className="space-y-4">
                            {clientes.length > 0 ? clientes.map(clienta => (
                                <div key={clienta.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <h3 className="text-lg font-bold">{clienta.nombre}</h3>
                                        <p className="text-sm text-gray-600">{clienta.email || '(Sin email)'}</p> 
                                        <p className="text-xs text-gray-500">Tel: {clienta.telefono || '-'}</p>
                                        <p className="text-xs text-gray-500">Registrada: {new Date(clienta.fecha_registro).toLocaleDateString('es-CL')}</p> 
                                    </div>
                                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                                        {/* Nota: total_inscripciones podría no ser preciso si filtramos por taller */}
                                        {/* Podríamos quitarlo o mostrar solo si no hay filtro de taller */}
                                        <p className="font-bold">{clienta.total_inscripciones} {clienta.total_inscripciones === 1 ? 'taller' : 'talleres'}</p>
                                        <Link 
                                            to={`/admin/cliente/${clienta.id}`} 
                                            className="text-sm text-blue-500 hover:underline font-bold"
                                        >
                                            Ver Trazabilidad
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center">
                                    {terminoBusqueda || fechaInicio || fechaFin || tallerSeleccionado ? 'No se encontraron clientas con esos filtros.' : 'Aún no hay clientas registradas.'}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminClientes;