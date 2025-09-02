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
        <img src={logo} alt="Logo Ecopolo" />
        <div className="item">
          <a>Legal</a>
          <a>Protocolo</a>
          <a>Nosotros</a>
          <a href='/login'>Iniciar Sesion</a>
        </div>
      </div>
      <div className="main">
        <img src={fondo} alt="Fondo Ecopolo s.a" />
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
