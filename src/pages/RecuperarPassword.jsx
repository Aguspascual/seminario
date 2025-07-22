import React from 'react';
import '../assets/styles/Login.css';
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
      {/* Footer igual al Login */}
      <div className="footer">
        <div className="superior">
          <img src={logo} alt="Logo Ecopolo"/>
          <div className="info">
            <div className="izquierda">
              <h5>Estamos en</h5>
              <p>Ruta Provincial N17, Km 178, Anelo, Neuquen AR</p>
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

export default RecuperarPassword; 