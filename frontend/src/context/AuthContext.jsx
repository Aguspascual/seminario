import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar usuario del localStorage al iniciar la app
        const storedUser = localStorage.getItem('usuario');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const u = JSON.parse(storedUser);
                // Normalizar rol: si viene 'admin' pasar a 'Admin', 'supervisor' -> 'Supervisor'
                let r = u.rol || u.Rol || "";
                if (r) {
                    r = r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
                }
                u.rol = r;
                setUser(u);
            } catch (error) {
                console.error("Error parsing user from localStorage", error);
                localStorage.removeItem('usuario');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/';
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
