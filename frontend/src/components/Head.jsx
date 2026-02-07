import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../assets/styles/Head.module.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PERMISOS = {
<<<<<<< HEAD
    "Admin": {
        planta: ["usuarios", "proveedores", "area", "auditoria"],
        maquinaria: ["maquinas", "mantenimiento", "reporte"],
        legal: ["documento"],
    },
    "Supervisor": {
=======
    "Admin": { 
        planta: ["usuarios", "proveedores", "area", "auditoria"], // Corregido 'usuario' a 'usuarios'
        maquinaria: ["maquinas", "mantenimiento", "reporte"],
        legal: ["documento"],
    },
    "Supervisor": { 
>>>>>>> origin/Home
        planta: ["proveedores", "area", "auditoria"],
        maquinaria: ["maquinas", "mantenimientos", "reportes"],
        legal: ["documento"],
    },
<<<<<<< HEAD
    "Trabajador": {
=======
    "Trabajador": { 
>>>>>>> origin/Home
        maquinaria: ["maquinas", "mantenimiento", "reportes"],
    }
};

const Head = ({ user }) => {
    const navigate = useNavigate();
<<<<<<< HEAD

    // Normalizamos el rol para evitar errores (si viene null)
    const rol = user?.rol || user?.Rol || "";
=======
    
    // Normalizamos el rol para evitar errores (si viene null)
    const rol = user?.rol || user?.Rol || ""; 
>>>>>>> origin/Home

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
<<<<<<< HEAD
        window.location.href = '/login';
    };

    const irACambiarPass = () => {
        navigate('/cambiarContraseña'); // Asegúrate que esta ruta exista en AppRoutes
=======
        window.location.href = '/'; 
    };

    const irACambiarPass = () => {
        navigate('/cambiarContraseña');
>>>>>>> origin/Home
    };

    const tienePermiso = (seccion, subMenu) => {
        return PERMISOS[rol]?.[seccion]?.includes(subMenu);
    };

    // Objeto styles seguro (por si el CSS falla al cargar)
    const s = styles || {};

    return (
        <nav className={s.navbar}>
            <div className={s.navbarContainer}>
<<<<<<< HEAD

                {/* --- LOGO --- */}
                <Link to="/home" className={s.navbarLogo}>
                    <img src={logo} alt="Logo Ecopolo" style={{ height: '65px' }} />
=======
                
                {/* --- LOGO --- */}
                <Link to="/home" className={s.navbarLogo}>
                    <img src={logo} alt="Logo Ecopolo" style={{height: '45px'}} />
                    <span className={s.brandName}>ECOPOLO</span>
>>>>>>> origin/Home
                </Link>

                {/* --- MENÚ --- */}
                <div className={s.navMenu}>
<<<<<<< HEAD

=======
                    
>>>>>>> origin/Home
                    {/* --- LEGAL (Solo Admin y Supervisor) --- */}
                    {(rol === "Admin" || rol === "Supervisor") && (
                        <div className={s.navItem}>
                            <Link to="/legal" className={s.navLink}>
                                <i className="fas fa-balance-scale"></i> Legal
                            </Link>
                        </div>
                    )}

                    {/* --- PLANTA (Solo Admin y Supervisor) --- */}
                    {(rol === "Admin" || rol === "Supervisor") && (
                        <div className={s.dropdown}>
                            <button className={s.dropbtn}>
                                Planta <i className="fas fa-caret-down"></i>
                            </button>
                            <div className={s.dropdownContent}>
                                {tienePermiso("planta", "usuarios") && <Link to='/usuarios'>Usuarios</Link>}
                                {tienePermiso("planta", "proveedores") && <Link to="/proveedores">Proveedores</Link>}
                                {tienePermiso("planta", "area") && <Link to="/areas">Áreas</Link>}
                                {tienePermiso("planta", "auditoria") && <Link to="/auditorias">Auditorías</Link>}
                            </div>
                        </div>
                    )}

                    {/* --- MAQUINARIA (Todos) --- */}
                    <div className={s.dropdown}>
                        <button className={s.dropbtn}>
                            Maquinaria <i className="fas fa-caret-down"></i>
                        </button>
                        <div className={s.dropdownContent}>
<<<<<<< HEAD
                            <Link to="/maquinaria">Máquinas</Link>
=======
                            <Link to="/maquinas">Máquinas</Link>
>>>>>>> origin/Home
                            <Link to="/mantenimiento">Mantenimiento</Link>
                            <Link to="/reportes">Reportes</Link>
                        </div>
                    </div>
<<<<<<< HEAD

=======
                    
>>>>>>> origin/Home
                    {/* --- PERFIL --- */}
                    <div className={s.dropdown}>
                        <button className={s.dropbtn}>
                            <i className="fas fa-user-circle"></i>
                            {user?.nombre || "Perfil"}
                        </button>
                        <div className={s.dropdownContent}>
<<<<<<< HEAD
                            <Link to="/mi-perfil">Mi Perfil</Link>
                            <Link to="/mensajes">Mensajes</Link>

=======
                            <Link to="/perfil">Mi Perfil</Link>
                            
>>>>>>> origin/Home
                            <button onClick={irACambiarPass} className={s.dropdownButton}>
                                Cambiar Contraseña
                            </button>

                            <hr className={s.separator} />
<<<<<<< HEAD

=======
                            
>>>>>>> origin/Home
                            <button onClick={handleLogout} className={`${s.dropdownButton} ${s.logoutBtn}`}>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Head;