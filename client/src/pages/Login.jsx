import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCog } from 'lucide-react'; // Icono de Admin

function Login() {
    // Usamos el email por defecto para que sea más rápido
    const [email, setEmail] = useState('carolina@tmm.cl'); 
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        axios.post('http://localhost:5000/api/login', { email, password })
            .then(response => {
                // Si el login es exitoso, guardamos el token
                localStorage.setItem('tmm_token', response.data.token);
                // Redirigimos al dashboard de administración
                navigate('/admin'); 
            })
            .catch(err => {
                console.error("Error de login:", err);
                setError(err.response?.data?.message || 'Error de conexión o credenciales incorrectas.'); 
            });
    };

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-xl animate-in zoom-in duration-300">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <UserCog className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-center">Acceso Administrador</CardTitle>
                    <CardDescription className="text-center">Ingresa con tus credenciales de gestión.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 border rounded bg-gray-50" 
                                required 
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Contraseña</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full p-3 border rounded" 
                                required 
                            />
                        </div>
                        {error && (
                            <p className="text-destructive text-sm text-center font-medium">{error}</p>
                        )}
                        <Button type="submit" className="w-full h-11">
                            Ingresar
                        </Button>
                        
                        {/* --- ENLACE DE RECUPERACIÓN AÑADIDO --- */}
                        <div className="text-right pt-1">
                            <Link 
                                to="/forgot-password" 
                                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                    </form>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        Credenciales por defecto: carolina@tmm.cl / tmm.admin.2025
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default Login;