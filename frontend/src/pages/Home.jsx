import React from 'react';
import '../assets/styles/Home.css';
import Footer from '../components/Footer';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Home = () => {
  return (
    <div className='Container'>
      <div className='header'>
        <img src={logo} alt="Logo Ecopolo" width="100" height="100" />
        <div className="item">
          <a>Legal</a>
          <a>Protocolo</a>
          <a>Nosotros</a>
          <a href='/login'>Iniciar Sesion</a>
        </div>
      </div>
      <div className="main">
        <img src={fondo} alt="Fondo Ecopolo s.a" width="1920" height="1080" fetchPriority="high" />
        <div className="text-container">
          <div className="subtitle1">Ecopolo Argentina S.A.</div>
          <div className="subtitle2">Servicios Medioambientales</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
