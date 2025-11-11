import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function Inscripcion() {
    // --- Estado para los datos del taller ---
    const [taller, setTaller] =  useState(null);
    const [cargando, setCargando] = useState(true);
    const { id } = useParams(); // Obtiene el ID del taller desde la URL

    // --- Estado para el formulario ---
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [exito, setExito] = useState(false);

    useEffect(() => {
        // Cargar los datos del taller a inscribirse
        axios.get(`http://localhost:5000/api/taller/${id}`)
            .then(response => {
                setTaller(response.data);
                setCargando(false);
            })
            .catch(error => {
                console.error("Error al cargar el taller:", error);
                setCargando(false);
            });
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const datosInscripcion = {
            tallerId: id,
            nombre,
            email,
            telefono,
            intereses: taller.tipo // Un ejemplo simple de segmentación inicial
        };

        axios.post('http://localhost:5000/api/inscripcion', datosInscripcion)
            .then(response => {
                setExito(true);
                setMensaje(response.data.message);
            })
            .catch(error => {
                setExito(false);
                setMensaje(error.response?.data?.message || 'Error en la inscripción.');
            });
    };

    if (cargando) return <p className="text-center p-10">Cargando taller...</p>;
    if (!taller) return <p className="text-center p-10">Taller no encontrado.</p>;

    return (
        <div className="bg-tmm-blue min-h-screen p-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Columna de información */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-tmm-dark">{taller.nombre}</h1>
                    <p className="text-lg text-gray-600 mt-2">{new Date(taller.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-2xl font-bold text-tmm-dark mt-4">${taller.precio.toLocaleString('es-CL')}</p>
                    <p className="mt-4 text-gray-700">{taller.descripcion}</p>
                </div>

                {/* Columna del formulario */}
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    {exito ? (
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-green-600">¡Inscripción Exitosa!</h2>
                            <p className="mt-4">{mensaje}</p>
                            <Link to="/" className="mt-6 inline-block bg-tmm-pink text-white font-bold py-2 px-4 rounded-lg hover:opacity-90">
                                Volver al Catálogo
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-2xl font-bold text-tmm-dark mb-6">Completa tus datos</h2>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">Nombre Completo</label>
                                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-bold mb-2">Teléfono (WhatsApp)</label>
                                <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full p-2 border rounded" />
                            </div>
                            <button type="submit" className="w-full bg-tmm-pink text-white font-bold py-3 rounded-lg hover:opacity-90">
                                Confirmar mi Cupo
                            </button>
                            {mensaje && <p className="mt-4 text-center text-red-600">{mensaje}</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Inscripcion;