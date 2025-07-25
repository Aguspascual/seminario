import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Login.css';
import Footer from '../components/Footer';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Login = () => {
  return (
    <div className='container'>
      <div className="main">
        <img className='fondo' src={fondo} alt="Fondo Ecopolo s.a" />
        <div className="tarjeta">
          <div className="dentro">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="datos">
              <input type="text" placeholder="Usuario" />
              <input type="password" placeholder="Contraseña" />
              <p><Link to='/recuperar'>Recuperar contraseña</Link></p>
              <button><Link to='/usuarios'>Entrar</Link></button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;