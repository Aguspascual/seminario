import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/Home';
import Login from '../pages/Login';
import Usuarios from '../pages/Usuarios';
import RecuperarPassword from '../pages/RecuperarPassword';
import Proveedores from '../pages/Proveedores';
import Maquinaria from '../pages/Maquinaria'; 
import Capacitaciones from '../pages/Capacitaciones'; 
import Auditorias from '../pages/Auditorias';
import Areas from '../pages/Areas'; 
import CambiarContraseña from '../pages/CambiarContraseña';
import MiPerfil from '../pages/MiPerfil';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />
        <Route path="/proveedores" element={<Proveedores />} />
        <Route path="/maquinaria" element={<Maquinaria />} />
        <Route path="/capacitaciones" element={<Capacitaciones />} />
        <Route path="/auditorias" element={<Auditorias />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/cambiarContraseña" element={<CambiarContraseña />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
