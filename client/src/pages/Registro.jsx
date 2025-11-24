import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, UserPlus } from 'lucide-react'; // Iconos para feedback visual

function Registro() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    // --- VALIDACIONES EN TIEMPO REAL (Feedback Visual) ---
    
    // Contraseña: Mín 8, Mayúscula, minúscula, número y símbolo.
    const hasMinLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[@$!%*?&]/.test(password);
    const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;
        
    // Teléfono Chileno simple (9 dígitos, empieza con 9)
    const isPhoneValid = /^9[0-9]{8}$/.test(telefono);
    
    // Nombre (Sin números)
    const isNameValid = nombre.length > 0 && !/[0-9]/.test(nombre);


    const handleRegistro = (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

            // --- NUEVA VALIDACIÓN: Las contraseñas deben coincidir ---
    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setCargando(false);
        return;
    }

        // --- VALIDACIONES ANTES DE ENVIAR ---
        if (!aceptaTerminos) {
            setError('Debes aceptar los términos y condiciones.');
            setCargando(false);
            return;
        }
        if (!isNameValid) {
            setError('El nombre no debe contener números.');
            setCargando(false);
            return;
        }
        if (!telefono.startsWith('9')) {
            setError('El teléfono debe comenzar con 9.');
            setCargando(false);
            return;
        }
        if (telefono.length < 9) {
            setError(`El teléfono es muy corto. Faltan ${9 - telefono.length} dígitos. Debe tener 9 dígitos en total.`);
            setCargando(false);
            return;
        }
        if (telefono.length > 9) {
            setError(`El teléfono es muy largo. Sobran ${telefono.length - 9} caracteres. Debe tener 9 dígitos en total.`);
            setCargando(false);
            return;
        }
        if (!isPhoneValid) {
            setError('El teléfono debe ser 9 seguido de 8 dígitos.');
            setCargando(false);
            return;
        }

        if (!isPasswordStrong) {
            setError('La contraseña no cumple con los requisitos de seguridad.');
            setCargando(false);
            return;
        }

        const userData = { nombre, email, telefono, password, aceptaTerminos };

        axios.post('http://localhost:5000/api/auth/register-cliente', userData)
            .then(response => {
                // El registro fue exitoso
                alert(response.data.message); // "Registro exitoso. Revisa tu correo..."
                navigate('/login-cliente'); // Redirigir al login
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.');
                setCargando(false);
            });
    };

    return (
        <div className="bg-background min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl border-none animate-in fade-in zoom-in duration-300">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <UserPlus className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-center font-bold text-foreground">Crear Cuenta</CardTitle>
                    <CardDescription className="text-center">
                        Únete a nuestra comunidad de bienestar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegistro} className="space-y-4">
                        
                        {/* Mensaje de Error */}
                        {error && (
                            <div className="bg-destructive/15 text-destructive border border-destructive/30 p-3 rounded-md text-sm font-medium text-center">
                                {error}
                            </div>
                        )}
                        
                        {/* Nombre y Teléfono */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre Completo</Label>
                                <Input 
                                    id="nombre" 
                                    value={nombre} 
                                    onChange={e => setNombre(e.target.value)} 
                                    required 
                                    placeholder="Ej: Ana Pérez" 
                                    className={nombre && !isNameValid ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {nombre && !isNameValid && <p className="text-xs text-destructive">No uses números.</p>}
                            </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input 
                                id="telefono"
                                type="tel"
                                value={telefono} 
                                onChange={e => setTelefono(e.target.value)} 
                                required 
                                placeholder="912345678" 
                                maxLength="9"
                                className={telefono && !isPhoneValid ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {telefono && !telefono.startsWith('9') && (
                                <p className="text-xs text-destructive">⚠️ Debe comenzar con 9</p>
                            )}
                            {telefono && telefono.startsWith('9') && telefono.length !== 9 && (
                                <p className="text-xs text-destructive">
                                    ⚠️ {telefono.length < 9 ? `Faltan ${9 - telefono.length} dígitos` : `Sobran ${telefono.length - 9} caracteres`}
                                </p>
                            )}
                            {telefono && isPhoneValid && (
                                <p className="text-xs text-green-600">✓ Formato correcto</p>
                            )}
                        </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                placeholder="nombre@ejemplo.com"
                            />
                        </div>
                        
                        {/* Contraseña con Feedback Visual */}
                        <div className="space-y-2 bg-muted/30 p-3 rounded-lg border">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                            />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2">
                                <RequirementItem met={hasMinLength} text="Mínimo 8 caracteres" />
                                <RequirementItem met={hasUpper} text="Una mayúscula" />
                                <RequirementItem met={hasLower} text="Una minúscula" />
                                <RequirementItem met={hasNumber} text="Un número" />
                                <RequirementItem met={hasSymbol} text="Un símbolo (@$!%*?&)" />
                            </div>
                        </div>

                        {/* NUEVO: Confirmar Contraseña */}
<div className="space-y-2">
    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
    <Input 
        id="confirmPassword" 
        type="password" 
        value={confirmPassword} 
        onChange={e => setConfirmPassword(e.target.value)} 
        required 
        className={confirmPassword && password !== confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
    />
    {confirmPassword && password !== confirmPassword && (
        <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
    )}
    {confirmPassword && password === confirmPassword && (
        <p className="text-xs text-green-600">✓ Las contraseñas coinciden</p>
    )}
</div>

                        {/* Términos y Condiciones */}
                        <div className="flex items-start space-x-2 pt-2">
                            <Checkbox id="terms" checked={aceptaTerminos} onCheckedChange={setAceptaTerminos} />
                            <Label htmlFor="terms" className="text-sm leading-none cursor-pointer">
                                He leído y acepto los <Link to="#" className="text-primary hover:underline font-semibold">Términos y Condiciones</Link> y la Política de Privacidad.
                            </Label>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-lg font-semibold shadow-md hover:scale-[1.02] transition-transform duration-200"
                            disabled={cargando}
                        >
                            {cargando ? 'Registrando...' : 'Crear mi Cuenta'}
                        </Button>
                    </form>
                    
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta? <Link to="/login-cliente" className="text-primary hover:underline font-bold">Inicia sesión aquí</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// Componente auxiliar para los requisitos de contraseña
function RequirementItem({ met, text }) {
    return (
        <div className={`flex items-center text-xs ${met ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
            {met ? <Check size={12} className="mr-1.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mr-2" />}
            {text}
        </div>
    );
}

export default Registro;