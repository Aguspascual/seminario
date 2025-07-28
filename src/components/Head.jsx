import React from 'react';
import '../assets/styles/Head.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Head = () => {
    return (
        <div className="header">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="item">
                <a className="navbtn" href='/'>Home</a>
                <div class="dropdown">
                <button class="dropbtn navbtn">Planta</button>
                <div class="dropdown-content">
                    <a href="/usuarios">Usuarios</a>
                    <a href="/proveedores">Proveedores</a>
                    <a href="/maquinaria">Maquinaria</a>
                    <a href="/capacitaciones">Capacitaciones</a>
                    <a href="/auditorias">Auditorias</a>
                    <a href="/areas">Areas</a>
                </div>
                </div>
                <div class="dropdown">
                <button class="dropbtn navbtn">Mantenimiento</button>
                <div class="dropdown-content">
                    <a href="/usuarios">Maquinas</a>
                </div>
                </div>
            </div>
        </div>
        
    );
};

export default Head;