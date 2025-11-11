import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Admin() {
    // --- Estado para el formulario de CREAR ---
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [tipo, setTipo] = useState('B2C');
    const [precio, setPrecio] = useState('');
    const [imagen, setImagen] = useState(null);
    const [crearMensaje, setCrearMensaje] = useState('');

    // --- Estado para la LISTA de talleres ---
    const [talleres, setTalleres] = useState([]);
    const [listaMensaje, setListaMensaje] = useState('');

    // --- 1. OBTENER EL TOKEN DE AUTORIZACIÓN ---
    const token = localStorage.getItem('tmm_token');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    // Función para cargar la lista de talleres
    const fetchTalleres = () => {
        // --- 2. USAR EL TOKEN AL PEDIR LA LISTA ---
        axios.get('http://localhost:5000/api/talleres/todos', authHeaders)
            .then(response => {
                setTalleres(response.data);
            })
            .catch(error => console.error("Error al cargar talleres:", error.response?.data?.message));
    };

    // Cargar la lista de talleres cuando el componente se monta
    useEffect(() => {
        fetchTalleres();
    }, []);

    // --- Manejador para CREAR taller (con FormData para imagen) ---
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('fecha', fecha ? new Date(fecha).toISOString() : '');
        formData.append('tipo', tipo);
        formData.append('precio', parseInt(precio) || 0);
        if (imagen) {
            formData.append('imagen', imagen);
        }
        
        // --- 3. USAR EL TOKEN AL CREAR UN TALLER ---
        axios.post('http://localhost:5000/api/talleres', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}` // <--- ¡LA LÍNEA CLAVE!
            }
        })
        .then(response => {
            setCrearMensaje(`¡Éxito! Taller "${nombre}" creado.`);
            fetchTalleres(); // Recargar la lista de talleres
            // Limpiar formulario
            setNombre(''); 
            setDescripcion(''); 
            setFecha(''); 
            setTipo('B2C'); 
            setPrecio(''); 
            setImagen(null);
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.value = null;
            }
        })
        .catch(error => {
            setCrearMensaje('Error al crear el taller.');
            console.error("Error de Axios:", error.response?.data?.message || error.message);
        });
    };

    // --- Manejador para ELIMINAR taller ---
    const handleEliminar = (id, nombreTaller) => {
        if (window.confirm(`¿Estás segura de que quieres eliminar el taller "${nombreTaller}"?`)) {
            // --- 4. USAR EL TOKEN AL ELIMINAR ---
            axios.delete(`http://localhost:5000/api/talleres/${id}`, authHeaders)
                .then(response => {
                    setListaMensaje(`Taller "${nombreTaller}" eliminado.`);
                    fetchTalleres(); // Recargar la lista
                })
                .catch(error => {
                    setListaMensaje(error.response?.data?.message || 'Error al eliminar.');
                    console.error(error);
                });
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            {/* --- SECCIÓN 1: CREAR TALLER --- */}
            <h1 className="text-3xl font-bold text-tmm-dark mb-6">Panel de Administración</h1>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12">
                <h2 className="text-2xl font-bold mb-4">Crear Nuevo Taller</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Nombre del Taller</label>
                        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Descripción</label>
                        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full p-2 border rounded"></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Fecha (YYYY-MM-DDTHH:MM)</label>
                        <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full p-2 border rounded" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Tipo</label>
                        <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full p-2 border rounded">
                            <option value="B2C">Taller Público (B2C)</option>
                            <option value="B2B">Taller Empresa (B2B)</option>
                            <option value="KIT">Kit de Insumos</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Precio (CLP)</label>
                        <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Imagen del Taller</label>
                        <input 
                            id="file-input"
                            type="file" 
                            onChange={e => setImagen(e.target.files[0])} // Guardar el archivo en el estado
                            className="w-full p-2 border rounded" 
                        />
                    </div>
                    <button type="submit" className="w-full bg-tmm-pink text-white font-bold py-3 rounded-lg hover:opacity-90">
                        Guardar Taller
                    </button>
                    {crearMensaje && <p className="mt-4 text-center">{crearMensaje}</p>}
                </form>
            </div>

            {/* --- SECCIÓN 2: GESTIONAR TALLERES --- */}
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Gestionar Talleres Existentes</h2>
                {listaMensaje && <p className="text-center mb-4">{listaMensaje}</p>}
                <div className="space-y-4">
                    {talleres.length > 0 ? talleres.map(taller => (
                        <div key={taller.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg">
                            <div className='flex items-center gap-4'>
                                <img 
                                    src={`http://localhost:5000${taller.imageUrl || '/placeholder.png'}`} 
                                    alt={taller.nombre} 
                                    className="w-16 h-16 object-cover rounded-md bg-gray-100" 
                                />
                                <div>
                                    <h3 className="text-lg font-bold">{taller.nombre}</h3>
                                    <p className="text-sm text-gray-600">{taller.tipo} - ${taller.precio ? taller.precio.toLocaleString('es-CL') : '0'}</p>
                                    <p className={`text-sm font-bold ${taller.activo ? 'text-green-600' : 'text-red-600'}`}>
                                        {taller.activo ? 'Activo' : 'Inactivo'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4 md:mt-0">
                                <Link 
                                    to={`/admin/editar/${taller.id}`}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Editar
                                </Link>
                                <button 
                                    onClick={() => handleEliminar(taller.id, taller.nombre)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center">Aún no has creado ningún taller.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Admin;