import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CancelarInscripcion() {
    const { token } = useParams();
    const [estado, setEstado] = useState('cargando'); // 'cargando', 'exito', 'error'
    const [mensaje, setMensaje] = useState('');
    const [datos, setDatos] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/cancelar-inscripcion/${token}`)
            .then(response => {
                setEstado('exito');
                setDatos(response.data);
                setMensaje(response.data.message);
            })
            .catch(error => {
                setEstado('error');
                setMensaje(error.response?.data?.message || 'Error al procesar la cancelación.');
            });
    }, [token]);

    return (
        <div className="bg-tmm-blue min-h-screen flex items-center justify-center p-8">
            <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full text-center">
                {estado === 'cargando' && (
                    <p className="text-xl">Procesando cancelación...</p>
                )}
                
                {estado === 'exito' && (
                    <>
                        <div className="text-6xl mb-4">✓</div>
                        <h1 className="text-3xl font-bold text-green-600 mb-4">Cancelación Exitosa</h1>
                        <p className="text-gray-700 mb-2">Hola {datos?.nombre},</p>
                        <p className="text-gray-700 mb-6">Tu inscripción al taller <strong>{datos?.taller}</strong> ha sido cancelada.</p>
                        <p className="text-sm text-gray-500 mb-6">Esperamos verte en futuros talleres.</p>
                    </>
                )}
                
                {estado === 'error' && (
                    <>
                        <div className="text-6xl mb-4">✗</div>
                        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                        <p className="text-gray-700 mb-6">{mensaje}</p>
                    </>
                )}
                
                <Link to="/" className="inline-block bg-tmm-pink text-white font-bold py-3 px-6 rounded-lg hover:opacity-90">
                    Volver al Catálogo
                </Link>
            </div>
        </div>
    );
}

export default CancelarInscripcion;