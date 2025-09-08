import React, { useState } from 'react';
import styles from '../assets/styles/CambiarContraseña.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Maquinaria = () => {
    return (
    <div className={styles.container}>
        <Head />
        <div className={styles.main}>
            <h6>Perfil &gt; Cambiar Contraseña </h6>
            <div className={styles.tarjeta}>
                <div className={styles.dentro}>
                    <h2>Cambiar Contraseña</h2>
                    <div className={styles.datos}>
                        <label>Contraseña Actual</label>
                        <input type="password" placeholder="Ingrese su contraseña actual" />
                        <label>Nueva Contraseña</label>
                        <input type="password" placeholder="Ingrese su nueva contraseña" />
                        <label>Confirmar Nueva Contraseña</label>
                        <input type="password" placeholder="Confirme su nueva contraseña" />
                    </div>
                    <button className={styles.boton}>Guardar Cambios</button>
                </div>
            </div>
        </div>
        <Footer />
    </div>
    );
};

export default Maquinaria;