import React from 'react';
import styles from '../assets/styles/Head.module.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Head = () => {
    return (
        <div className={styles.header}>
            <img src={logo} alt="Logo Ecopolo" />
            <div className={styles.item}>
                <a className={styles.navbtn} href='/'>Home</a>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Planta</button>
                    <div className={styles.dropdownContent}>
                        <a href="/usuarios">Usuarios</a>
                        <a href="/proveedores">Proveedores</a>
                        <a href="/maquinaria">Maquinaria</a>

                        <a href="/auditorias">Auditorias</a>
                        <a href="/areas">Areas</a>
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Maquinaria</button>
                    <div className={styles.dropdownContent}>
                        <a href="/usuarios">Maquinas</a>
                        <a href="/reportes">Reportes</a>
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Mi Perfil</button>
                    <div className={styles.dropdownContent}>
                        <a href="/mi-perfil">Ver Perfil</a>
                        <a href="/usuarios">Mensajes</a>
                        <a href="/cambiarContraseña">Cambiar contraseña</a>
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
