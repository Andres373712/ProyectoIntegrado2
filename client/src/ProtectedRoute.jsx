import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('tmm_token');

    // Si no hay token, redirigir al login de admin
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Decodificar el token para obtener el rol
        const decoded = jwtDecode(token);
        
        // Verificar si el usuario es administrador
        if (decoded.rol !== 'admin') {
            // Si no es admin, redirigir a la página principal
            return <Navigate to="/" replace />;
        }

        // Si es admin, permitir el acceso
        return children;

    } catch (error) {
        // Si el token es inválido o ha expirado, limpiar y redirigir
        console.error('Token inválido:', error);
        localStorage.removeItem('tmm_token');
        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;