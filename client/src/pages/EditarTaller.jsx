import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Importar Checkbox

function EditarTaller() {
    const [taller, setTaller] = useState({
        nombre: '',
        descripcion: '',
        fecha: '',
        tipo: 'B2C',
        precio: 0,
        activo: true,
        imageUrl: null,
        lugar: '' // <-- CAMBIO: Estado añadido
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
        const { name, value, type } = e.target;
        // Checkbox se maneja diferente
        if (type === 'checkbox') {
             setTaller(prev => ({ ...prev, [name]: e.target.checked }));
        } else {
             setTaller(prev => ({ ...prev, [name]: value }));
        }
    };
    
    // Manejador especial para el Select de Shadcn
    const handleSelectChange = (value) => {
        setTaller(prev => ({ ...prev, tipo: value }));
    };

    // Manejador especial para el Checkbox de Shadcn
    const handleCheckboxChange = (checked) => {
         setTaller(prev => ({ ...prev, activo: checked }));
    };

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
        formData.append('lugar', taller.lugar || ''); // <-- CAMBIO: Añadido

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
                
                <div>
                    <Label htmlFor="nombre">Nombre del Taller</Label>
                    <Input id="nombre" name="nombre" value={taller.nombre || ''} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea id="descripcion" name="descripcion" value={taller.descripcion || ''} onChange={handleChange} />
                </div>
                <div>
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input id="fecha" name="fecha" type="datetime-local" value={taller.fecha || ''} onChange={handleChange} />
                </div>
                <div>
                    <Label>Tipo</Label>
                    <Select value={taller.tipo || 'B2C'} onValueChange={handleSelectChange}>
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
                
                {/* --- CAMBIO: CAMPO LUGAR AÑADIDO --- */}
                <div>
                    <Label htmlFor="lugar">Lugar del Taller</Label>
                    <Input id="lugar" name="lugar" value={taller.lugar || ''} onChange={handleChange} placeholder="Ej: Online, Mi taller en Valparaíso..." />
                </div>

                <div>
                    <Label htmlFor="precio">Precio (CLP)</Label>
                    <Input id="precio" name="precio" type="number" value={taller.precio || 0} onChange={handleChange} required />
                </div>
                
                <div className="flex items-center space-x-2">
                    <Checkbox id="activo" name="activo" checked={taller.activo} onCheckedChange={handleCheckboxChange} />
                    <Label htmlFor="activo" className="font-bold">¿Taller activo? (Visible en el catálogo público)</Label>
                </div>
                
                <div>
                    <Label>Imagen Actual</Label>
                    {taller.imageUrl ? (
                        <img 
                            src={`http://localhost:5000${taller.imageUrl}`} 
                            alt="Imagen actual" 
                            className="w-full h-48 object-cover rounded-md mb-2" 
                        />
                    ) : (
                        <p className="text-muted-foreground text-sm mb-2">Este taller no tiene imagen actual.</p>
                    )}
                    <Label htmlFor="file-input-edit" className="mt-4">Subir Nueva Imagen (opcional)</Label>
                    <Input 
                        id="file-input-edit"
                        type="file" 
                        onChange={e => setImagen(e.target.files[0])}
                    />
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