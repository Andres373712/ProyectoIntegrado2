import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import axios from 'axios';

function ClienteDetalle() {
    // Estado para los datos (ahora editables)
    const [clienta, setClienta] = useState({ nombre: '', email: '', telefono: '', intereses: '', fecha_registro: '' });
    // Estados para historial y notas
    const [historial, setHistorial] = useState([]);
    const [notas, setNotas] = useState([]);
    const [nuevaNota, setNuevaNota] = useState('');
    // Estados de control
    const [cargando, setCargando] = useState(true);
    const [mensajeNota, setMensajeNota] = useState('');
    const [mensajeCliente, setMensajeCliente] = useState(''); 
    
    const { id } = useParams();

    const token = localStorage.getItem('tmm_token');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    // --- Carga de Datos ---
    const fetchNotas = useCallback(() => {
        axios.get(`http://localhost:5000/api/cliente/${id}/notas`, authHeaders)
            .then(res => setNotas(res.data))
            .catch(err => console.error("Error cargando notas:", err));
    }, [id, token]); // Añadimos token a las dependencias

    useEffect(() => {
        setCargando(true); // Indicar que estamos cargando
        Promise.all([
            axios.get(`http://localhost:5000/api/cliente/${id}`, authHeaders),
            axios.get(`http://localhost:5000/api/cliente/${id}/historial`, authHeaders),
            axios.get(`http://localhost:5000/api/cliente/${id}/notas`, authHeaders)
        ]).then(([resClienta, resHistorial, resNotas]) => {
            setClienta(resClienta.data || { nombre: '', email: '', telefono: '', intereses: '', fecha_registro: '' }); // Asegurar que clienta no sea null
            setHistorial(resHistorial.data);
            setNotas(resNotas.data);
            setCargando(false);
        }).catch(err => {
            console.error("Error al cargar datos de la clienta:", err);
            setMensajeCliente('Error al cargar los datos. Intenta recargar.'); // Mensaje de error
            setCargando(false);
        });
    }, [id, token]); // fetchNotas ya no es necesaria aquí si la lógica está dentro

    // --- Guardar Nota ---
    const handleGuardarNota = (e) => {
        e.preventDefault();
        if (!nuevaNota) return;
        setMensajeNota('Guardando nota...');

        axios.post(`http://localhost:5000/api/cliente/${id}/notas`, { nota: nuevaNota }, authHeaders)
            .then(res => {
                setMensajeNota('Nota guardada.');
                setNuevaNota(''); 
                fetchNotas(); // Recargar notas
                setTimeout(() => setMensajeNota(''), 3000);
            })
            .catch(err => {
                setMensajeNota('Error al guardar nota.');
                console.error("Error guardando nota:", err);
            });
    };

    // --- Editar Datos Cliente ---
    const handleClientaChange = (e) => {
        const { name, value } = e.target;
        setClienta(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardarCliente = (e) => {
        e.preventDefault();
        setMensajeCliente('Guardando...'); 

        const datosActualizados = {
            nombre: clienta.nombre,
            email: clienta.email,
            telefono: clienta.telefono,
            intereses: clienta.intereses
        };

        axios.put(`http://localhost:5000/api/cliente/${id}`, datosActualizados, authHeaders)
            .then(res => {
                setMensajeCliente('¡Datos guardados!');
                setTimeout(() => setMensajeCliente(''), 3000);
            })
            .catch(err => {
                setMensajeCliente(err.response?.data?.message || 'Error al guardar.');
                console.error("Error guardando cliente:", err);
            });
    };


    if (cargando) return <p className="text-center p-10">Cargando perfil de la clienta...</p>;
    // Aseguramos que clienta tenga datos antes de renderizar
    if (!clienta || !clienta.email) return <p className="text-center p-10">Clienta no encontrada o error al cargar.</p>; 

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* --- Cabecera con Info Editable de la Clienta --- */}
                <form onSubmit={handleGuardarCliente} className="bg-white p-8 rounded-lg shadow-md mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input 
                                type="text" name="nombre" value={clienta.nombre || ''} onChange={handleClientaChange}
                                className="mt-1 w-full p-2 border rounded" required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input 
                                type="email" name="email" value={clienta.email || ''} onChange={handleClientaChange}
                                className="mt-1 w-full p-2 border rounded" required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
                            <input 
                                type="tel" name="telefono" value={clienta.telefono || ''} onChange={handleClientaChange}
                                className="mt-1 w-full p-2 border rounded" 
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Intereses (separados por coma)</label>
                            <input 
                                type="text" name="intereses" value={clienta.intereses || ''} onChange={handleClientaChange}
                                className="mt-1 w-full p-2 border rounded" 
                            />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                         Clienta desde: {clienta.fecha_registro ? new Date(clienta.fecha_registro).toLocaleDateString('es-CL') : 'N/A'}
                     </div>
                     <div className="mt-6 flex justify-end items-center gap-4">
                         {mensajeCliente && <span className="text-sm">{mensajeCliente}</span>}
                         <button 
                             type="submit" 
                             className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600"
                         > Guardar Cambios </button>
                     </div>
                </form>

                {/* --- Columnas de Historial y Notas --- */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Columna 1: Historial de Talleres */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-tmm-dark mb-4">Historial de Trazabilidad</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {historial.length > 0 ? historial.map((taller, index) => (
                                <div key={index} className="p-4 border-l-4 border-tmm-pink bg-gray-50 rounded">
                                    <h3 className="font-bold text-lg">{taller.nombre}</h3>
                                    <p className="text-sm text-gray-600">Fecha taller: {taller.fecha ? new Date(taller.fecha).toLocaleDateString('es-CL') : 'N/A'}</p>
                                    <p className="text-xs text-gray-500">Inscripción: {taller.fecha_inscripcion ? new Date(taller.fecha_inscripcion).toLocaleDateString('es-CL') : 'N/A'}</p>
                                </div>
                            )) : (
                                <p>Esta clienta aún no se ha inscrito a ningún taller.</p>
                            )}
                        </div>
                    </div>

                    {/* Columna 2: Notas de Fidelización */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-tmm-dark mb-4">Notas de Fidelización</h2>
                        <form onSubmit={handleGuardarNota} className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2">Añadir nota personal:</label>
                            <textarea
                                value={nuevaNota} onChange={e => setNuevaNota(e.target.value)}
                                className="w-full p-2 border rounded" rows="3"
                                placeholder="Ej: Le encantó la resina..."
                            ></textarea>
                            <button type="submit" className="mt-2 w-full bg-tmm-pink text-white font-bold py-2 rounded-lg hover:opacity-90">
                                Guardar Nota
                            </button>
                            {mensajeNota && <p className="text-center mt-2 text-sm">{mensajeNota}</p>}
                        </form>
                        
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                            {notas.length > 0 ? notas.map(nota => (
                                <div key={nota.id} className="p-4 bg-yellow-100 rounded">
                                    <p className="text-gray-800">{nota.nota}</p>
                                    <p className="text-xs text-gray-500 mt-2 text-right">{new Date(nota.fecha).toLocaleString('es-CL')}</p>
                                </div>
                            )) : (
                                <p>Aún no hay notas para esta clienta.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClienteDetalle;