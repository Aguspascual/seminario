import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/Head.module.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Head = () => {
    const [unreadCount, setUnreadCount] = useState(0);

    const checkUnread = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/mensajes/no-leidos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.cantidad);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        checkUnread();
        const interval = setInterval(checkUnread, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);
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
                    <button className={`${styles.dropbtn} ${styles.navbtn}`}>
                        Mi Perfil
                        {unreadCount > 0 && <span style={{
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            width: '10px',
                            height: '10px',
                            display: 'inline-block',
                            marginLeft: '5px'
                        }}></span>}
                    </button>
                    <div className={styles.dropdownContent}>
                        <a href="/mi-perfil">Ver Perfil</a>
                        <a href="/mensajes">
                            Mensajes
                            {unreadCount > 0 && <span style={{
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '10px',
                                marginLeft: '5px'
                            }}>{unreadCount}</span>}
                        </a>
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
