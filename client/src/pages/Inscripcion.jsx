import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Users } from 'lucide-react';

function Inscripcion() {
    const [taller, setTaller] = useState(null);
    const [cargando, setCargando] = useState(true);
    const { id } = useParams();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [exito, setExito] = useState(false);

    useEffect(() => {
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
        setMensaje('');
        const datosInscripcion = {
            tallerId: id,
            nombre, email, telefono, intereses: taller.tipo
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

    // CÁLCULO DE CUPOS
    const cuposDisponibles = (taller.cupos_totales || 10) - (taller.cupos_inscritos || 0);
    const agotado = cuposDisponibles <= 0;

    return (
        <div className="bg-background min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                
                <Card className="shadow-lg border-none h-fit">
                    <CardHeader>
                        {taller.imageUrl ? (
                            <img 
                                src={`http://localhost:5000${taller.imageUrl}`} 
                                alt={taller.nombre}
                                className={`w-full h-64 object-cover rounded-md mb-4 ${agotado ? 'grayscale' : ''}`}
                            />
                        ) : (
                            <div className="w-full h-64 bg-muted rounded-md mb-4 flex items-center justify-center">
                                <span className="text-muted-foreground">Sin imagen</span>
                            </div>
                        )}
                        <CardTitle className="text-3xl">{taller.nombre}</CardTitle>
                        <CardDescription className="text-lg text-foreground/80">
                            {taller.descripcion}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-2xl font-bold text-primary">
                            ${taller.precio.toLocaleString('es-CL')}
                        </div>
                        <div className="flex items-center text-md text-foreground/90">
                            <strong>Fecha:</strong>&nbsp; {new Date(taller.fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {taller.lugar && (
                            <div className="flex items-center text-md text-foreground/90">
                                <MapPin className="w-4 h-4 mr-2 text-primary" />
                                En: {taller.lugar}
                            </div>
                        )}

                        {/* --- AVISO DE CUPOS (MODIFICADO) --- */}
                        <div className={`flex items-center p-3 rounded-lg border ${agotado ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            <Users className="w-5 h-5 mr-2" />
                            {agotado ? (
                                <span className="font-bold">¡Lo sentimos! Cupos Agotados.</span>
                            ) : (
                                <span className="font-bold">¡Aún quedan cupos disponibles!</span> // <-- CAMBIO AQUÍ
                            )}
                        </div>

                    </CardContent>
                </Card>

                <Card className="shadow-lg border-none h-fit">
                    <CardHeader>
                        <CardTitle className="text-3xl">{agotado ? 'Inscripción Cerrada' : 'Inscríbete Aquí'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {agotado ? (
                            <div className="text-center p-8">
                                <p className="text-lg text-gray-600 mb-6">
                                    Lo sentimos, este taller ya alcanzó su capacidad máxima.
                                </p>
                                <Button asChild variant="outline" className="w-full">
                                    <Link to="/catalogo">Ver otros talleres disponibles</Link>
                                </Button>
                            </div>
                        ) : exito ? (
                            <div className="text-center p-8">
                                <h2 className="text-2xl font-bold text-green-600 mb-4">¡Inscripción Exitosa!</h2>
                                <p className="mb-6">{mensaje}</p>
                                <Button asChild variant="secondary">
                                    <Link to="/catalogo">Volver al Catálogo</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Completo</Label>
                                    <Input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono (WhatsApp)</Label>
                                    <Input id="telefono" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} />
                                </div>
                                {mensaje && !exito && (
                                    <p className="text-red-500 text-center">{mensaje}</p>
                                )}
                                <Button type="submit" className="w-full text-lg h-12">
                                    Confirmar mi Cupo
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
export default Inscripcion;