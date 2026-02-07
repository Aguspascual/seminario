<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import './App.css';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario del localStorage al iniciar la app
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        // Normalizar rol: si viene 'admin' pasar a 'Admin', 'supervisor' -> 'Supervisor'
        let r = u.rol || u.Rol || "";
        // Capitalizar primera letra
        if (r) {
          r = r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
        }
        // Asignar rol normalizado
        u.rol = r;
        setUser(u);
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#1F3A52', fontFamily: 'sans-serif' }}>Cargando...</div>;
  }

  return <AppRoutes user={user} />;
=======
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppRoutes from './routes/AppRoutes';

function App() {
  // 1. LEER EL USUARIO GUARDADO AL INICIAR
  // Usamos una función dentro de useState para que lea la memoria solo la primera vez
  const [user, setUser] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

    useEffect(() => {
    if (user) localStorage.setItem('usuario', JSON.stringify(user));
    else localStorage.removeItem('usuario');
  }, [user]);

  // 2. PASAR EL USUARIO A LAS RUTAS
  // Si no le pasas "user={user}", AppRoutes recibe "undefined" y te rebota al login
  return (
      <AppRoutes user={user} setUser={setUser} />
  );
>>>>>>> origin/Home
}

export default App