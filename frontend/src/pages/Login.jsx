import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Footer from "../components/Footer.jsx"

const Login = () => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          contrasena: contrasena
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Login exitoso
        console.log('Login exitoso:', data);
        // Aquí puedes guardar el token o datos del usuario en localStorage si es necesario
        navigate('/usuarios'); // Redirigir a la página de usuarios
      } else {
        // Error en el login
        setError(data.error || 'Error en el login');
      }
      
    } catch (error) {
      setError('Error de conexión con el servidor');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <div className="main">
        <img className='fondo' src={fondo} alt="Fondo Ecopolo s.a" />
        <div className="tarjeta">
          <div className="dentro">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="datos">
              <form onSubmit={handleLogin}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />
                {error && <p className="error-message">{error}</p>}
                <p><Link to='/recuperar'>Recuperar contraseña</Link></p>
                <button type="submit" disabled={loading}>
                  {loading ? 'Verificando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
      {/* <div className="footer">
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
      </div> */}
      {/* deberia ir el componente footer pero no me deja */}
    </div>
  );
};

export default Login;