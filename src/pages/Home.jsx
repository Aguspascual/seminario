import React from 'react';
import '../assets/styles/Home.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Home = () => {
  return (
    <div className='Container'>
      <div className='header'>
        <img src={logo} alt="Logo Ecopolo" />
        <div className="item">
          <p>Legal</p>
          <p>Protocolo</p>
          <p>Nosotros</p>
          <p>Iniciar Sesion</p>
        </div>
      </div>
      <div className="main">
        <img src={fondo} alt="Fondo Ecopolo s.a" />
        <div className="text-container">
          <div className="subtitle1">Ecopolo Argentina S.A.</div>
          <div className="subtitle2">Servicios Medioambientales</div>
        </div>
      </div>
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
    </div>
  );
};

export default Home;
