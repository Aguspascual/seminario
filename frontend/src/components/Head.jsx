import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import  '../assets/styles/Head.module.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Head = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Limpiamos todo el rastro del usuario
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/'); // Redirige al Login sin recargar la página
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                
                {/* --- LOGO (Izquierda) --- */}
                <Link to="/home" className="navbar-logo">
                    <img src={logo} alt="Logo Ecopolo" style={{height: '45px', marginRight: '10px'}} />
                    <span className="brand-name">ECOPOLO</span>
                </Link>

                {/* --- MENÚ (Derecha) --- */}
                <div className="nav-menu">
                    
                    {/* Botón Home */}

                    {/* Botón Legal */}
                    <Link to="/legal" className="nav-links">Legal</Link>

                    {/* Dropdown PLANTA */}
                    <div className="dropdown">
                        <button className="nav-links dropbtn">Planta ▾</button>
                        <div className="dropdown-content">
                            <Link to="/planta">Usuario</Link>
                            <Link to="/planta">Proveedores</Link>
                            <Link to="/areas">Áreas</Link>
                            <Link to="/auditorias">Auditorías</Link>
                        </div>
                    </div>

                    {/* Dropdown MAQUINARIA */}
                    <div className="dropdown">
                        <button className="nav-links dropbtn">Maquinaria ▾</button>
                        <div className="dropdown-content">
                            <Link to="/maquinaria">Maquina</Link>
                            <Link to="/reportes"><Mantenimiento></Mantenimiento></Link>
                            <Link to="/reportes">Reportes</Link>
                        </div>
                    </div>

                    {/* Dropdown PERFIL */}
                    <div className="dropdown">
                        <button className="nav-links dropbtn profile-link">Mi Perfil ▾</button>
                        <div className="dropdown-content dropdown-right">
                            <Link to="/mi-perfil">Ver Perfil</Link>
                            <Link to="/cambiar-password">Cambiar Contraseña</Link>
                            <button onClick={handleLogout} className="logout-btn">
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