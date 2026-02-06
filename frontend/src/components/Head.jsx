import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                        <Link to="/mi-perfil">Ver Perfil</Link>
                        <Link to="/mensajes">
                            Mensajes
                            {unreadCount > 0 && <span style={{
                                backgroundColor: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '10px',
                                marginLeft: '5px'
                            }}>{unreadCount}</span>}
                        </Link>
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
