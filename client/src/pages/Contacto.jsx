import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

function Contacto() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });
    const [errors, setErrors] = useState({});
    const [feedback, setFeedback] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
        // Clear error when user starts typing
        if (errors[id]) {
            setErrors({ ...errors, [id]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        // Name validation: must not be empty and must not contain numbers
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio.';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.nombre)) {
            newErrors.nombre = 'El nombre no debe contener números ni caracteres especiales.';
        }

        // Email validation: must not be empty and must have a valid format
        if (!formData.email.trim()) {
            newErrors.email = 'El correo electrónico es obligatorio.';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
            newErrors.email = 'El formato del correo electrónico no es válido.';
        }

        // Message validation: must not be empty
        if (!formData.mensaje.trim()) {
            newErrors.mensaje = 'El mensaje es obligatorio.';
        }

        // Phone validation (optional): if present, must be a valid Chilean mobile number
        if (formData.telefono && !/^9\d{8}$/.test(formData.telefono)) {
            newErrors.telefono = 'El número de teléfono debe tener 9 dígitos y comenzar con 9.';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setFeedback({ message: '', type: '' });

        try {
            const response = await axios.post('http://localhost:5000/api/contacto', formData);
            setFeedback({ message: response.data.message, type: 'success' });
            setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
            setErrors({});
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error al enviar el mensaje.';
            setFeedback({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen py-12">
            <div className="container mx-auto px-6 max-w-3xl">
                <Card className="border-none shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-primary">Contáctanos</CardTitle>
                        <p className="text-muted-foreground pt-2">
                            ¿Tienes alguna pregunta o comentario? Rellena el formulario y te responderemos lo antes posible.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input id="nombre" placeholder="Tu nombre completo" value={formData.nombre} onChange={handleChange} className={errors.nombre ? 'border-red-500' : ''} />
                                    {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input id="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} className={errors.email ? 'border-red-500' : ''} />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>
                             <div className="space-y-2 mt-6">
                                <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                                <Input id="telefono" placeholder="9xxxxxxxx" value={formData.telefono} onChange={handleChange} className={errors.telefono ? 'border-red-500' : ''} />
                                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                            </div>
                            <div className="space-y-2 mt-6">
                                <Label htmlFor="mensaje">Mensaje</Label>
                                <Textarea id="mensaje" placeholder="Escribe aquí tu consulta..." className={`min-h-[150px] ${errors.mensaje ? 'border-red-500' : ''}`} value={formData.mensaje} onChange={handleChange} />
                                {errors.mensaje && <p className="text-red-500 text-xs mt-1">{errors.mensaje}</p>}
                            </div>
                            
                            {/* Feedback Message */}
                            {feedback.message && (
                                <div className={`mt-6 p-4 rounded-md text-sm flex items-center gap-3 ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {feedback.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                    {feedback.message}
                                </div>
                            )}

                            <div className="text-center mt-8">
                                <Button type="submit" size="lg" className="px-8" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Enviar Mensaje
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Contacto;