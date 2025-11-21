import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function Admin() {
    // --- Estado para el formulario de CREAR ---
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState('');
    const [tipo, setTipo] = useState('B2C');
    const [precio, setPrecio] = useState('');
    const [lugar, setLugar] = useState('');
    const [cupos, setCupos] = useState(10); // <-- NUEVO ESTADO: Por defecto 10
    const [imagen, setImagen] = useState(null);
    const [crearMensaje, setCrearMensaje] = useState('');

    // --- Estado para la LISTA de talleres ---
    const [talleres, setTalleres] = useState([]);
    const [listaMensaje, setListaMensaje] = useState('');

    const token = localStorage.getItem('tmm_token');
    const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };

    const fetchTalleres = () => {
        axios.get('http://localhost:5000/api/talleres/todos', authHeaders)
            .then(response => {
                setTalleres(response.data);
            })
            .catch(error => console.error("Error al cargar talleres:", error.response?.data?.message));
    };

    useEffect(() => {
        fetchTalleres();
    }, []);

    // --- Manejador para CREAR taller ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setCrearMensaje('Creando...');

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('fecha', fecha ? new Date(fecha).toISOString() : '');
        formData.append('tipo', tipo);
        formData.append('precio', parseInt(precio) || 0);
        formData.append('lugar', lugar);
        formData.append('cupos_totales', parseInt(cupos) || 10); // <-- NUEVO: Enviamos cupos
        if (imagen) {
            formData.append('imagen', imagen);
        }
        
        axios.post('http://localhost:5000/api/talleres', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}` 
            }
        })
        .then(response => {
            setCrearMensaje(`¡Éxito! Taller "${nombre}" creado.`);
            fetchTalleres(); 
            // Limpiar formulario
            setNombre(''); setDescripcion(''); setFecha(''); 
            setTipo('B2C'); setPrecio(''); setLugar(''); 
            setCupos(10); // <-- Resetear cupos
            setImagen(null);
            const fileInput = document.getElementById('file-input');
            if (fileInput) fileInput.value = null;
        })
        .catch(error => {
            setCrearMensaje('Error al crear el taller.');
            console.error("Error de Axios:", error.response?.data?.message || error.message);
        });
    };

    const handleEliminar = (id, nombreTaller) => {
        if (window.confirm(`¿Estás segura de que quieres eliminar el taller "${nombreTaller}"?`)) {
            axios.delete(`http://localhost:5000/api/talleres/${id}`, authHeaders)
                .then(response => {
                    setListaMensaje(`Taller "${nombreTaller}" eliminado.`);
                    fetchTalleres(); 
                })
                .catch(error => {
                    setListaMensaje(error.response?.data?.message || 'Error al eliminar.');
                });
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Panel de Administración</h1>
            <div className="max-w-xl mx-auto bg-card p-8 rounded-lg shadow-md mb-12 border">
                <h2 className="text-2xl font-bold mb-4">Crear Nuevo Taller</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="nombre">Nombre del Taller</Label>
                        <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea id="descripcion" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="fecha">Fecha</Label>
                            <Input id="fecha" type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} />
                        </div>
                        <div>
                            <Label>Tipo</Label>
                            <Select value={tipo} onValueChange={setTipo}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="B2C">Taller Público (B2C)</SelectItem>
                                    <SelectItem value="B2B">Taller Empresa (B2B)</SelectItem>
                                    <SelectItem value="KIT">Kit de Insumos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="lugar">Lugar</Label>
                            <Input id="lugar" value={lugar} onChange={e => setLugar(e.target.value)} placeholder="Ej: Online..." />
                        </div>
                        {/* --- NUEVO CAMPO CUPOS --- */}
                        <div>
                            <Label htmlFor="cupos">Cupos Totales</Label>
                            <Input 
                                id="cupos" 
                                type="number" 
                                min="1"
                                value={cupos} 
                                onChange={e => setCupos(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="precio">Precio (CLP)</Label>
                        <Input id="precio" type="number" value={precio} onChange={e => setPrecio(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="file-input">Imagen del Taller</Label>
                        <Input 
                            id="file-input"
                            type="file" 
                            onChange={e => setImagen(e.target.files[0])}
                        />
                    </div>
                    <Button type="submit" className="w-full text-lg h-11">
                        Guardar Taller
                    </Button>
                    {crearMensaje && <p className="mt-4 text-center">{crearMensaje}</p>}
                </form>
            </div>

            <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-md border">
                <h2 className="text-2xl font-bold mb-4">Gestionar Talleres Existentes</h2>
                {listaMensaje && <p className="text-center mb-4">{listaMensaje}</p>}
                <div className="space-y-4">
                    {talleres.length > 0 ? talleres.map(taller => (
                        <div key={taller.id} className="flex flex-col md:flex-row justify-between items-center p-4 border rounded-lg">
                            <div className='flex items-center gap-4'>
                                <img 
                                    src={taller.imageUrl ? `http://localhost:5000${taller.imageUrl}` : '/placeholder.png'} 
                                    alt={taller.nombre} 
                                    className="w-16 h-16 object-cover rounded-md bg-muted" 
                                />
                                <div>
                                    <h3 className="text-lg font-bold">{taller.nombre}</h3>
                                    <p className="text-sm text-muted-foreground">{taller.tipo} - ${taller.precio ? taller.precio.toLocaleString('es-CL') : '0'}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Cupos: {taller.cupos_inscritos} / {taller.cupos_totales} {/* Mostramos el estado de cupos */}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-4 md:mt-0">
                                <Button asChild variant="secondary" size="sm">
                                    <Link to={`/admin/editar/${taller.id}`}>Editar</Link>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleEliminar(taller.id, taller.nombre)}>
                                    Eliminar
                                </Button>
                            </div>
                        </div>
                    )) : (
                        <p className="text-muted-foreground text-center">Aún no has creado ningún taller.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Admin;