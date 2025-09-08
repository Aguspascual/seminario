import React from 'react';
import styles from '../assets/styles/Head.module.css'; 
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Head = () => {
    return (
        <div className={styles.header}>
            <img src={logo} alt="Logo Ecopolo"/>
            <div className={styles.item}>
                <a className={styles.navbtn} href='/'>Home</a>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Planta</button>
                    <div className={styles.dropdownContent}>
                        <a href="/usuarios">Usuarios</a>
                        <a href="/proveedores">Proveedores</a>
                        <a href="/maquinaria">Maquinaria</a>
                        <a href="/capacitaciones">Capacitaciones</a>
                        <a href="/auditorias">Auditorias</a>
                        <a href="/areas">Areas</a>
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Mantenimiento</button>
                    <div className={styles.dropdownContent}>
                        <a href="/usuarios">Maquinas</a>
                    </div>
                </div>
                <div className={styles.dropdown}>
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>Mi Perfil</button>
                    <div className={styles.dropdownContent}>
                        <a href="/usuarios">Mensajes</a>
                        <a href="/cambiarContraseña">Cambiar contraseña</a>
                        <a href="/">Cerrar sesion</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Head;
