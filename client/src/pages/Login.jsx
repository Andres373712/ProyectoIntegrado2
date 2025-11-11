import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
function Login() {
    const [email, setEmail] = useState('carolina@tmm.cl');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        axios.post('http://localhost:5000/api/login', { email, password })
            .then(response => {
                // Si el login es exitoso, guardamos el "ticket" (token)
                localStorage.setItem('tmm_token', response.data.token);
                // Redirigimos al panel de admin
                navigate('/admin');
            })
            .catch(err => {
                setError('Credenciales inválidas. Inténtalo de nuevo.');
                console.error('Error de login:', err.response?.data?.message || err.message);
            });
    };

    return (
        <div className="bg-tmm-blue min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center text-tmm-dark mb-6">Acceso Administración</h1>
                <p className="text-center text-gray-600 mb-6">Bienvenida, Carolina. Ingresa tus credenciales.</p>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 border rounded bg-gray-50" 
                            required 
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 border rounded" 
                            required 
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-center mb-4">{error}</p>
                    )}
                    <Button type="submit" className="w-full h-12 text-lg">
                    Ingresar
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Login;