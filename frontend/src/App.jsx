import { useState } from 'react'
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

  // 2. PASAR EL USUARIO A LAS RUTAS
  // Si no le pasas "user={user}", AppRoutes recibe "undefined" y te rebota al login
  return <AppRoutes user={user} />;
}

export default App