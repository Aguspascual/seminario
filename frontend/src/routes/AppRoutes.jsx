import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Loader from '../components/Loader';
import PrivateRoute from '../components/PrivateRoute';

// Lazy load pages
const HomePage = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Usuarios = lazy(() => import('../pages/Usuarios'));
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword'));
const Proveedores = lazy(() => import('../pages/Proveedores'));
const Maquinaria = lazy(() => import('../pages/Maquinaria'));
const Capacitaciones = lazy(() => import('../pages/Capacitaciones'));
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
            <Route path="/cambiarContraseña" element={<CambiarContraseña />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
