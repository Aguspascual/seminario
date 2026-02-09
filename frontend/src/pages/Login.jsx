import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/Login.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const { login } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      //petición al back
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/login`, {
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
        login(data.user, data.access_token);
        // Usamos navigate en lugar de window.location para SPA feel, aunque AuthContext maneja el estado
        navigate('/home');
      } else {
        // Error en el login
        setError(data.error || 'Credencial incorrecta');
      }

    } catch (error) {
      setError('Error de conexión con el servidor');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/*Imagen en full screen*/}
      <img className='fondo-imagen' src={fondo} alt="Ecopolo s.a" />

      <div className='login-container'>
        {/* Tarjeta Central */}
        <div className="main-card">
          <img src={logo} alt='Logo Ecopolo' className='logo-img' />

          <p className='login-subtitulo'>Ingresa sus credenciales</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">

            {/* 1. GRUPO EMAIL (Corregido 'imput' por 'input') */}
            <div className='input-group'>
              <label className='login-email'>Email:</label>
              <input
                className="custom-input"
                type="email"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* 2. GRUPO CONTRASEÑA + OJITO */}
            <div className='input-group'>
              <label className='login-contrasena'>Contraseña:</label>
              <div className='password-wrapper'> {/* Contenedor extra para alinear el ojo */}
                <input
                  className="custom-input"
                  type={mostrarContrasena ? "text" : "password"}
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                />

                {/* EL ÍCONO DEL OJITO (Va dentro de este bloque relativo) */}
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  tabIndex="-1"
                >
                  {mostrarContrasena ? (
                    /* Ojo Tachado */
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    /* Ojo Normal */
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {/* 3. BOTÓN INGRESAR (¡Esto es lo que te faltaba!) */}
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            {/* 4. LINK OLVIDE CONTRASEÑA */}
            <Link to='/recuperar' className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>

          </form>
        </div>
      </div>
    </>
  );
};

export default Login;