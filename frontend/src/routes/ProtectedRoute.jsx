import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ user, allowedRoles }) => {
    // 1. Verificación de Autenticación
    // Si no hay usuario (porque no se ha logueado o el token expiró), al Login
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 2. Verificación de Autorización (RBAC - Role Based Access Control)
    // Si definimos roles permitidos para esta ruta y el rol del usuario no está ahí
    // Usamos 'user.rol' porque así lo definiste en tu modelo de SQLAlchemy
    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        // Si no tiene permiso, lo mandamos al Home en lugar de dejarlo entrar
        return <Navigate to="/home" replace />;
    }

    // 3. Acceso Permitido
    // El 'Outlet' es un componente de react-router que renderiza la página hija
    return <Outlet />;
};

export default ProtectedRoute;