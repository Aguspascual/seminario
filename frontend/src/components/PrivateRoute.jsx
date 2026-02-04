import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');

    // Si no hay token, redirigir al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si hay token, mostrar el contenido (Outlet renderiza las rutas hijas)
    return <Outlet />;
};

export default PrivateRoute;
