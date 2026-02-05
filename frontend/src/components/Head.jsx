import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/Head.module.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Head = () => {
    return (
        <div className={styles.header}>
            <img src={logo} alt="Logo Ecopolo" />
            <div className={styles.item}>
                <Link className={styles.navbtn} to='/'>Home</Link>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Planta</button>
                    <div className={styles.dropdownContent}>
                        <Link to="/usuarios">Usuarios</Link>
                        <Link to="/proveedores">Proveedores</Link>
                        <Link to="/maquinaria">Maquinaria</Link>

                        <Link to="/auditorias">Auditorias</Link>
                        <Link to="/areas">Areas</Link>
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Maquinaria</button>
                    <div className={styles.dropdownContent}>
                        <Link to="/usuarios">Maquinas</Link>
                        <Link to="/reportes">Reportes</Link>
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Mi Perfil</button>
                    <div className={styles.dropdownContent}>
                        <Link to="/mi-perfil">Ver Perfil</Link>
                        <Link to="/usuarios">Mensajes</Link>
                        <Link to="/cambiarContraseña">Cambiar contraseña</Link>
                        <button
                            className={styles.logoutBtn}
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('usuario');
                                window.location.href = '/login';
                            }}
                        >
                            Cerrar sesion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Head;
