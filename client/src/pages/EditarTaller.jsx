import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function EditarTaller() {
    const [taller, setTaller] = useState({
        nombre: '',
        descripcion: '',
        fecha: '',
        tipo: 'B2C',
        precio: 0,
        activo: true,
        imageUrl: null
    });
    const [imagen, setImagen] = useState(null); 
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();

    // 1. OBTENER EL TOKEN
    const token = localStorage.getItem('tmm_token');
    
    useEffect(() => {
        // La ruta GET /api/taller/:id es pública, no necesita token
        axios.get(`http://localhost:5000/api/taller/${id}`)
            .then(response => {
                let fechaFormateada = '';
                if (response.data.fecha) {
                    const fechaDB = new Date(response.data.fecha);
                    fechaFormateada = fechaDB.toISOString().slice(0, 16);
                }
                setTaller({ ...response.data, fecha: fechaFormateada });
                setCargando(false);
            })
            .catch(error => {
                console.error("Error al cargar el taller:", error);
                setMensaje('Error al cargar datos del taller.');
                setCargando(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTaller(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nombre', taller.nombre);
        formData.append('descripcion', taller.descripcion || '');
        formData.append('fecha', taller.fecha ? new Date(taller.fecha).toISOString() : '');
        formData.append('tipo', taller.tipo);
        formData.append('precio', parseInt(taller.precio) || 0);
        formData.append('activo', taller.activo);

        if (imagen) {
            formData.append('imagen', imagen);
        } else if (taller.imageUrl) {
            formData.append('imageUrlActual', taller.imageUrl);
        }

        // 2. AÑADIR TOKEN A LA PETICIÓN DE ACTUALIZAR
        axios.put(`http://localhost:5000/api/talleres/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}` // <--- ¡LA LÍNEA CLAVE!
            }
        })
        .then(response => {
            setMensaje('¡Taller actualizado con éxito!');
            setTimeout(() => navigate('/admin'), 2000);
        })
        .catch(error => {
            setMensaje('Error al actualizar el taller.');
            console.error("Error de Axios:", error.response || error.message);
        });
    };

    if (cargando) return <p className="text-center p-10">Cargando taller...</p>;

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <h1 className="text-3xl font-bold text-tmm-dark mb-6">Editar Taller</h1>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
                
                {/* ... (Todos los inputs del formulario son iguales que antes) ... */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Nombre del Taller</label>
                    <input type="text" name="nombre" value={taller.nombre || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Descripción</label>
                    <textarea name="descripcion" value={taller.descripcion || ''} onChange={handleChange} className="w-full p-2 border rounded"></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Fecha (YYYY-MM-DDTHH:MM)</label>
                    <input type="datetime-local" name="fecha" value={taller.fecha || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Tipo</label>
                    <select name="tipo" value={taller.tipo || 'B2C'} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="B2C">Taller Público (B2C)</option>
                        <option value="B2B">Taller Empresa (B2B)</option>
                        <option value="KIT">Kit de Insumos</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Precio (CLP)</label>
                    <input type="number" name="precio" value={taller.precio || 0} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div className="mb-4">
                    <label className="flex items-center text-gray-700 font-bold">
                        <input type="checkbox" name="activo" checked={taller.activo} onChange={handleChange} className="mr-2" />
                        ¿Taller activo? (Visible en el catálogo público)
                    </label>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Imagen Actual</label>
                    {taller.imageUrl ? (
                        <img 
                            src={`http://localhost:5000${taller.imageUrl}`} 
                            alt="Imagen actual del taller" 
                            className="w-full h-48 object-cover rounded-md mb-2" 
                        />
                    ) : (
                        <p className="text-gray-500 text-sm mb-2">Este taller no tiene imagen actual.</p>
                    )}
                    <label className="block text-gray-700 font-bold mb-2 mt-4">Subir Nueva Imagen (opcional)</label>
                    <p className="text-xs text-gray-500 mb-2">Si seleccionas una nueva imagen, reemplazará a la anterior.</p>
                    <input 
                        type="file" 
                        onChange={e => setImagen(e.target.files[0])}
                        className="w-full p-2 border rounded" 
                    />
                </div>
                <button type="submit" className="w-full bg-tmm-pink text-white font-bold py-3 rounded-lg hover:opacity-90">
                    Guardar Cambios
                </button>
                {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
            </form>
        </div>
    );
}

export default EditarTaller;