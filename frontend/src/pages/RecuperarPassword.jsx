import React from 'react';
import '../assets/styles/RecuperarPassword.css';
import Footer from '../components/Footer';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Pagina para recuperar la contraseña
const RecuperarPassword = () => {
  return (
    <div className='container'>
      {/* Fondo y tarjeta central */}
      <div className="main">
        <img className='fondo' src={fondo} alt="Fondo Ecopolo s.a" />
        <div className="tarjeta">
          <div className="dentro">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="datos">
              <input type="email" placeholder="Ingresa tu email" />
              <button>Enviar</button>
              <p><a href="/login">Volver al login</a></p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecuperarPassword; 