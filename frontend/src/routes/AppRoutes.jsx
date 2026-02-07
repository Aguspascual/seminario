import { BrowserRouter, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import ProtectedRoute from '../components/ProtectedRoute'; // Ajusté la ruta de importación
=======
import ProtectedRoute from './ProtectedRoute'; //proteccion de rutas
>>>>>>> origin/Home
import HomePage from '../pages/Home';
import Login from '../pages/Login';
import Usuarios from '../pages/Usuarios';
import RecuperarPassword from '../pages/RecuperarPassword';
import Proveedores from '../pages/Proveedores';
import Maquinarias from '../pages/Maquinarias';
// import Capacitaciones from '../pages/Capacitaciones'; // No existe el archivo aún
import Auditorias from '../pages/Auditorias';
import Areas from '../pages/Areas';
import Reportes from '../pages/Reportes';
import CambiarContraseña from '../pages/CambiarContraseña';
import MiPerfil from '../pages/MiPerfil';
import Legal from '../pages/Legal';
<<<<<<< HEAD
import Mensajes from '../pages/Mensajes';

function AppRoutes({ user }) {
=======



function AppRoutes({user, setUser}) {
>>>>>>> origin/Home
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
<<<<<<< HEAD
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
=======
        <Route path="/" element={<Login setUser={setUser} />} />
>>>>>>> origin/Home
        <Route path="/recuperar" element={<RecuperarPassword />} />

        {/* Rutas Privadas para los logueados*/}
        <Route element={<ProtectedRoute user={user} />}>
          <Route path="/home" element={<HomePage user={user} />} />
<<<<<<< HEAD
          <Route path="/maquinaria" element={<Maquinarias />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/mensajes" element={<Mensajes />} />
=======
          <Route path="/maquinaria" element={<Maquinaria />} />
          <Route path="/reportes" element={<Reportes />} />
>>>>>>> origin/Home
          <Route path="/mi-perfil" element={<MiPerfil />} />
          <Route path="/cambiarContraseña" element={<CambiarContraseña />} />
        </Route>

        {/* --- 3. Rutas para Planta (Solo admin y Rol B) --- */}
        <Route element={<ProtectedRoute user={user} allowedRoles={['Admin', 'Supervisor']} />}>
          <Route path="/legal" element={<Legal />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/auditorias" element={<Auditorias />} />
          <Route path="/areas" element={<Areas />} />
<<<<<<< HEAD
          {/* <Route path="/capacitaciones" element={<Capacitaciones />} /> */}
=======
          <Route path="/capacitaciones" element={<Capacitaciones />} />
>>>>>>> origin/Home
        </Route>

        <Route element={<ProtectedRoute user={user} allowedRoles={['Admin']} />}>
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
