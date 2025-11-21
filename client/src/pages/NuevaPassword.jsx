import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

function NuevaPassword() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { token } = useParams(); // Obtenemos el token de la URL
    const navigate = useNavigate();

    // Validación visual (actualizada con . y ,)
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[@$!%*?&.,]/.test(password); // <-- AÑADIDO . y ,
    const isStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isStrong) {
            setError('La contraseña no cumple los requisitos.');
            return;
        }
        axios.post('http://localhost:5000/api/auth/reset-password', { token, newPassword: password })
            .then(res => {
                alert(res.data.message);
                navigate('/login-cliente');
            })
            .catch(err => setError(err.response?.data?.message || 'Error al restablecer. Token inválido.'));
    };

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Nueva Contraseña</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nueva Contraseña</Label>
                            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                            
                            {/* Requisitos Visuales */}
                            <div className="text-xs text-muted-foreground pt-2 space-y-1">
                                <RequirementItem met={hasMinLength} text="Mínimo 8 caracteres" />
                                <RequirementItem met={hasUpper} text="Mayúscula" />
                                <RequirementItem met={hasLower} text="Minúscula" />
                                <RequirementItem met={hasNumber} text="Número" />
                                <RequirementItem met={hasSymbol} text="Símbolo (@ $ ! % * ? & . ,)" />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={!isStrong}>Cambiar Contraseña</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function RequirementItem({ met, text }) {
    return (
        <div className={`flex items-center ${met ? 'text-green-600' : ''}`}>
            {met ? <Check size={12} className="mr-1" /> : <X size={12} className="mr-1" />} {text}
        </div>
    );
}

export default NuevaPassword;
