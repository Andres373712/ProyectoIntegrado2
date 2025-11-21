import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';

function RecuperarPassword() {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Nota: Asegúrate de que tu backend tenga esta ruta implementada
        axios.post('http://localhost:5000/api/auth/forgot-password', { email })
            .then(res => {
                setMensaje(res.data.message);
                setEnviado(true);
            })
            .catch(err => setMensaje('Error al conectar con el servidor.'));
    };

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-4 pt-24">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Recuperar Contraseña</CardTitle>
                    <CardDescription className="text-center">Te enviaremos un enlace para restablecerla.</CardDescription>
                </CardHeader>
                <CardContent>
                    {enviado ? (
                        <div className="text-center p-4 bg-green-50 text-green-800 rounded-md">
                            {mensaje}
                            <div className="mt-4">
                                <Link to="/login-cliente" className="text-primary underline">Volver al login</Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full">Enviar Enlace</Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
export default RecuperarPassword;