import React from 'react';
import '../assets/styles/Footer.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Footer = () => {
    return (
        <div className="footer">
        <div className="superior">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="info">
            <div className="izquierda">
                <h5>Estamos en</h5>
                <p>Ruta Provincial N17, Km 178, Añelo, Neuquen AR</p>
            </div>
            <div className="derecha">
                <h5>Contactos</h5>
                <div className="contactos-iconos">
                    <i className="fas fa-phone"></i>
                    <i className="fab fa-linkedin"></i>
                    <i className="far fa-envelope"></i>
                </div>
            </div>
            </div>
        </div>
        <div className="inferior">
            <h5>© 2025 EcoPolo Argentina S.A. Todos los derechos reservados.</h5>
        </div>
    </div>
    );
};

export default Footer;