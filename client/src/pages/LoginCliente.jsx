import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

function LoginCliente() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // --- DETECTAR SI VIENE DEL CORREO DE VERIFICACIÓN ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('success') === 'verificado') {
            setSuccessMessage('¡Tu cuenta ha sido verificada exitosamente! Ya puedes ingresar.');
        } else if (params.get('error') === 'token-invalido') {
            setError('El enlace de verificación es inválido o ha expirado.');
        }
    }, [location]);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        axios.post('http://localhost:5000/api/auth/login-cliente', { email, password })
            .then(response => {
                localStorage.setItem('tmm_token', response.data.token);
                navigate('/'); 
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Credenciales inválidas. Inténtalo de nuevo.');
            });
    };

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Acceso Clientes</CardTitle>
                    <CardDescription className="text-center">Ingresa para gestionar tus inscripciones.</CardDescription>
                </CardHeader>
                <CardContent>
                    
                    {/* --- MENSAJES DE ESTADO --- */}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md flex items-center gap-2 text-sm font-bold">
                            <CheckCircle className="w-5 h-5" />
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm font-bold">
                            <XCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            
                            {/* --- ENLACE DE RECUPERACIÓN AÑADIDO AQUÍ --- */}
                            <div className="text-right mt-2">
                                <Link 
                                    to="/forgot-password" 
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11">
                            Ingresar
                        </Button>
                    </form>
                    <p className="mt-4 text-center text-sm">
                        ¿No tienes cuenta? <Link to="/registro-cliente" className="text-primary hover:underline font-bold">Regístrate aquí</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginCliente;