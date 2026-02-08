import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'; //proteccion de rutas
import HomePage from '../pages/Home';
import Login from '../pages/Login';
import Usuarios from '../pages/Usuarios';
import RecuperarPassword from '../pages/RecuperarPassword';
import Proveedores from '../pages/Proveedores';
import Maquinarias from '../pages/Maquinarias';
// import Capacitaciones from '../pages/Capacitaciones'; // No existe el archivo aún
import Auditorias from '../pages/Auditorias';
import Areas from '../pages/Areas';
import Insumos from '../pages/Insumos';
import Grupos from '../pages/Grupos';
import Reportes from '../pages/Reportes';
import CambiarContraseña from '../pages/CambiarContraseña';
import MiPerfil from '../pages/MiPerfil';
import Legal from '../pages/Legal';
import Mensajes from '../pages/Mensajes';
import MaintenancePage from '../pages/MaintenancePage';



import { useAuth } from '../context/AuthContext';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />

        {/* Rutas Privadas para los logueados*/}
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/maquinaria" element={<Maquinarias user={user} />} />
          <Route path="/reportes" element={<Reportes user={user} />} />
          <Route path="/mensajes" element={<Mensajes />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/cambiarContraseña" element={<CambiarContraseña />} />
        </Route>

        {/* --- 3. Rutas para Planta (Solo admin y Rol B) --- */}
        <Route element={<ProtectedRoute user={user} allowedRoles={['Admin', 'Supervisor']} />}>
          <Route path="/legal" element={<Legal user={user} />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/insumos" element={<Insumos />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/auditorias" element={<Auditorias />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/mantenimiento" element={<MaintenancePage user={user} />} />
          {/* <Route path="/capacitaciones" element={<Capacitaciones />} /> */}
        </Route>

        <Route element={<ProtectedRoute user={user} allowedRoles={['Admin']} />}>
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
