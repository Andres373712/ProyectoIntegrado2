import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('tmm_token');

    if (!token) {
        // Si no hay token, redirigir a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si hay token, mostrar el componente que se quería ver
    return children;
}

export default ProtectedRoute;