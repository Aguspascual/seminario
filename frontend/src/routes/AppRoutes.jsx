import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
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

=======
import Loader from '../components/Loader';
>>>>>>> origin/master
import PrivateRoute from '../components/PrivateRoute';

// Lazy load pages
const HomePage = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Usuarios = lazy(() => import('../pages/Usuarios'));
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword'));
const Proveedores = lazy(() => import('../pages/Proveedores'));
const Maquinarias = lazy(() => import('../pages/Maquinarias'));
const Auditorias = lazy(() => import('../pages/Auditorias'));
const Areas = lazy(() => import('../pages/Areas'));
const Reportes = lazy(() => import('../pages/Reportes'));
const CambiarContraseña = lazy(() => import('../pages/CambiarContraseña'));
const MiPerfil = lazy(() => import('../pages/MiPerfil'));

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<RecuperarPassword />} />

<<<<<<< HEAD
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
=======
          {/* Rutas Privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/maquinaria" element={<Maquinarias />} />
            <Route path="/auditorias" element={<Auditorias />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/cambiarContraseña" element={<CambiarContraseña />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
          </Route>
        </Routes>
      </Suspense>
>>>>>>> origin/master
    </BrowserRouter>
  );
}

export default AppRoutes;
