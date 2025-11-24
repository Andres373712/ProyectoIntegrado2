import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputPrecio from '@/components/InputPrecio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

function EditarTaller() {
    const [taller, setTaller] = useState({
        nombre: '',
        descripcion: '',
        fecha: '',
        tipo: 'B2C',
        precio: 0,
        activo: true,
        imageUrl: null,
        lugar: '',
        cupos_totales: 10, // <-- NUEVO
        cupos_inscritos: 0 // <-- NUEVO (Solo lectura)
    });
    
    const [imagen, setImagen] = useState(null); 
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('tmm_token');
    
    useEffect(() => {
        axios.get(`http://localhost:5000/api/taller/${id}`)
            .then(response => {
                let fechaFormateada = '';
                if (response.data.fecha) {
                    const fechaDB = new Date(response.data.fecha);
                    fechaFormateada = fechaDB.toISOString().slice(0, 16);
                }
                // Aseguramos que cupos_totales tenga un valor
                const datos = response.data;
                if (!datos.cupos_totales) datos.cupos_totales = 10;

                setTaller({ ...datos, fecha: fechaFormateada });
                setCargando(false);
            })
            .catch(error => {
                console.error("Error al cargar el taller:", error);
                setMensaje('Error al cargar datos del taller.');
                setCargando(false);
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             setTaller(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
             setTaller(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSelectChange = (value) => setTaller(prev => ({ ...prev, tipo: value }));
    const handleCheckboxChange = (checked) => setTaller(prev => ({ ...prev, activo: checked }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setMensaje('Actualizando...');
        
        const formData = new FormData();
        formData.append('nombre', taller.nombre);
        formData.append('descripcion', taller.descripcion || '');
        formData.append('fecha', taller.fecha ? new Date(taller.fecha).toISOString() : '');
        formData.append('tipo', taller.tipo);
        formData.append('precio', parseInt(taller.precio) || 0);
        formData.append('activo', taller.activo);
        formData.append('lugar', taller.lugar || '');
        formData.append('cupos_totales', parseInt(taller.cupos_totales) || 10); // <-- ENVIAR CUPOS

        if (imagen) {
            formData.append('imagen', imagen);
        } else if (taller.imageUrl) {
            formData.append('imageUrlActual', taller.imageUrl);
        }

        axios.put(`http://localhost:5000/api/talleres/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setMensaje('¡Taller actualizado con éxito!');
            setTimeout(() => navigate('/admin/talleres'), 2000);
        })
        .catch(error => {
            setMensaje('Error al actualizar el taller.');
            console.error("Error de Axios:", error.response || error.message);
        });
    };

    if (cargando) return <p className="text-center p-10">Cargando taller...</p>;

    return (
        <div className="bg-background min-h-screen p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Editar Taller</h1>
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-card p-8 rounded-lg shadow-md border space-y-4">
                
                {/* ... Inputs nombre, descripcion ... */}
                <div>
                    <Label htmlFor="nombre">Nombre del Taller</Label>
                    <Input id="nombre" name="nombre" value={taller.nombre || ''} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea id="descripcion" name="descripcion" value={taller.descripcion || ''} onChange={handleChange} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input id="fecha" name="fecha" type="datetime-local" value={taller.fecha || ''} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Tipo</Label>
                        <Select value={taller.tipo || 'B2C'} onValueChange={handleSelectChange}>
                            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
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
                        <Input id="lugar" name="lugar" value={taller.lugar || ''} onChange={handleChange} />
                    </div>
                    {/* --- NUEVO CAMPO CUPOS --- */}
                    <div>
                        <Label htmlFor="cupos_totales">Cupos Totales</Label>
                        <Input 
                            id="cupos_totales" 
                            name="cupos_totales" 
                            type="number" 
                            min={taller.cupos_inscritos} // No permitir bajar del nº de inscritos
                            value={taller.cupos_totales || 10} 
                            onChange={handleChange} 
                            required 
                        />
                        <p className="text-xs text-muted-foreground mt-1">Inscritos actuales: {taller.cupos_inscritos}</p>
                    </div>
                </div>

                <div>
                    <Label htmlFor="precio">Precio (CLP)</Label>
                    <InputPrecio 
                        id="precio" 
                        value={taller.precio || 0} 
                        onChange={(valor) => setTaller(prev => ({ ...prev, precio: valor }))}
                        required 
                    />
                </div>
                
                <div className="flex items-center space-x-2 py-2">
                    <Checkbox id="activo" name="activo" checked={taller.activo} onCheckedChange={handleCheckboxChange} />
                    <Label htmlFor="activo" className="font-bold">¿Taller activo?</Label>
                </div>
                
                <div>
                    <Label>Imagen Actual</Label>
                    {taller.imageUrl && (
                        <img src={`http://localhost:5000${taller.imageUrl}`} alt="Actual" className="w-full h-48 object-cover rounded-md mb-2" />
                    )}
                    <Label htmlFor="file-input-edit" className="mt-2 cursor-pointer text-primary hover:underline">Cambiar Imagen (opcional)</Label>
                    <Input id="file-input-edit" type="file" onChange={e => setImagen(e.target.files[0])} className="mt-1" />
                </div>
               
                <Button type="submit" className="w-full text-lg h-11">
                    Guardar Cambios
                </Button>
                {mensaje && <p className="mt-4 text-center">{mensaje}</p>}
            </form>
        </div>
    );
}
export default EditarTaller;
