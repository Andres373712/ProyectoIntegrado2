import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputPrecio from '@/components/InputPrecio';

function AdminProductos() {
    // --- Estado Formulario ---
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState(''); // <-- NUEVO CAMPO STOCK
    const [imagen, setImagen] = useState(null);
    const [crearMensaje, setCrearMensaje] = useState('');

    // --- Estado Lista ---
    const [productos, setProductos] = useState([]);
    const [listaMensaje, setListaMensaje] = useState('');

    const token = localStorage.getItem('tmm_token');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    // Cargar productos
    const fetchProductos = () => {
        axios.get('http://localhost:5000/api/productos/todos', authHeaders)
            .then(res => setProductos(res.data))
            .catch(err => console.error("Error cargando productos:", err));
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    // Crear Producto
    const handleSubmit = (e) => {
        e.preventDefault();
        setCrearMensaje('Guardando...');

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('precio', parseInt(precio) || 0);
        formData.append('stock', parseInt(stock) || 0);
        if (imagen) formData.append('imagen', imagen);

        axios.post('http://localhost:5000/api/productos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setCrearMensaje(`¡Producto "${nombre}" creado!`);
            fetchProductos();
            // Limpiar
            setNombre(''); setDescripcion(''); setPrecio(''); setStock(''); setImagen(null);
            const fileInput = document.getElementById('file-input-prod');
            if (fileInput) fileInput.value = null;
        })
        .catch(err => {
            setCrearMensaje('Error al crear producto.');
            console.error(err);
        });
    };

    // Eliminar Producto
    const handleEliminar = (id, nombreProd) => {
        if (window.confirm(`¿Eliminar "${nombreProd}"?`)) {
            axios.delete(`http://localhost:5000/api/productos/${id}`, authHeaders)
                .then(() => {
                    setListaMensaje(`Producto eliminado.`);
                    fetchProductos();
                })
                .catch(err => setListaMensaje('Error al eliminar.'));
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">Gestión de Productos (Marketplace)</h1>

            {/* --- FORMULARIO DE CREACIÓN --- */}
            <div className="max-w-xl mx-auto bg-card p-8 rounded-lg shadow-md mb-12 border">
                <h2 className="text-2xl font-bold mb-4">Nuevo Producto</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nombre">Nombre del Producto</Label>
                        <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="precio">Precio (CLP)</Label>
                        <InputPrecio 
                            id="precio" 
                            value={precio} 
                            onChange={setPrecio}
                            required 
                        />
                    </div>
                        <div>
                            <Label htmlFor="stock">Stock Inicial</Label>
                            <Input id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="file-input-prod">Imagen</Label>
                        <Input id="file-input-prod" type="file" onChange={e => setImagen(e.target.files[0])} />
                    </div>
                    <Button type="submit" className="w-full">Guardar Producto</Button>
                    {crearMensaje && <p className="mt-2 text-center text-sm">{crearMensaje}</p>}
                </form>
            </div>

            {/* --- LISTA DE PRODUCTOS --- */}
            <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-md border">
                <h2 className="text-2xl font-bold mb-4">Inventario Actual</h2>
                {listaMensaje && <p className="text-center mb-4 text-red-500">{listaMensaje}</p>}
                
                <div className="space-y-4">
                    {productos.length > 0 ? productos.map(prod => (
                        <div key={prod.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg">
                            <div className='flex items-center gap-4'>
                                <img 
                                    src={prod.imageUrl ? `http://localhost:5000${prod.imageUrl}` : '/placeholder.png'} 
                                    alt={prod.nombre} 
                                    className="w-16 h-16 object-cover rounded-md bg-muted" 
                                />
                                <div>
                                    <h3 className="text-lg font-bold">{prod.nombre}</h3>
                                    <p className="text-sm text-muted-foreground">${prod.precio.toLocaleString('es-CL')}</p>
                                    {/* INDICADOR DE STOCK */}
                                    <p className={`text-sm font-bold ${prod.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Stock: {prod.stock} {prod.stock === 0 && '(AGOTADO)'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4 md:mt-0">
                                {/* (Podríamos añadir botón de Editar aquí en el futuro) */}
                                <Button variant="destructive" size="sm" onClick={() => handleEliminar(prod.id, prod.nombre)}>
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-muted-foreground">No hay productos registrados.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminProductos;