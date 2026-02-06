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
import Reportes from '../pages/Reportes';
import CambiarContraseña from '../pages/CambiarContraseña';
import MiPerfil from '../pages/MiPerfil';
import Mensajes from '../pages/Mensajes';

import PrivateRoute from '../components/PrivateRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<RecuperarPassword />} />

        {/* Rutas Privadas */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/maquinaria" element={<Maquinaria />} />
          <Route path="/capacitaciones" element={<Capacitaciones />} />
          <Route path="/auditorias" element={<Auditorias />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/mensajes" element={<Mensajes />} />
          <Route path="/cambiarContraseña" element={<CambiarContraseña />} />
          <Route path="/mi-perfil" element={<MiPerfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
