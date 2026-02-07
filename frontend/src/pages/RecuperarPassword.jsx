import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import '../assets/styles/RecuperarPassword.css';
import '../assets/styles/Login.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import fondo from '../assets/images/Fondo.jpeg';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Pagina para recuperar la contraseña
const RecuperarPassword = () => {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
<<<<<<< HEAD

      // Corrección: El endpoint en el backend es /recuperar-password (con guion), no /recuperar_contrasena
      const response = await fetch(`${apiUrl}/recuperar-password`, {
=======
      
      const response = await fetch(`${apiUrl}/recuperar_contrasena`, { 
>>>>>>> origin/Home
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMensaje('¡Listo! Revisa tu correo para las instrucciones.');
<<<<<<< HEAD
        setEmail('');
=======
        setEmail(''); 
>>>>>>> origin/Home
      } else {
        setError(data.error || 'No encontramos ese email en el sistema.');
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Fondo Pantalla Completa */}
      <img className='fondo-imagen' src={fondo} alt="Fondo Ecopolo" />

      <div className='login-container'>
<<<<<<< HEAD
        <div className="main-card"> {/* Usamos main-card de Login.css para consistencia */}

          <img src={logo} alt="Logo Ecopolo" className='logo-img' />

          <div>
            <p className='recovery-subtitle'>Ingresa tu email para restablecerla</p>
=======
        <div className="login-card">
          
          <img src={logo} alt="Logo Ecopolo" className='logo-img'/>
          
          <div>
            <h2 className='login-titulo'>Recuperar Contraseña</h2>
            <p className='login-subtitle'>Ingresa tu email para restablecerla</p>
>>>>>>> origin/Home
          </div>

          {/* Mensajes de feedback */}
          {error && <div className="error-msg">{error}</div>}
<<<<<<< HEAD
          {mensaje && <div className="success-msg" style={{ color: 'green', backgroundColor: '#e6fffa', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{mensaje}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className='input-group'>
              <label className='login-email'>Email:</label>
              <input
                className="custom-input"
                type="email"
                placeholder="ejemplo@ecopolo.com"
=======
          {mensaje && <div className="success-msg">{mensaje}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className='input-group'>
              <label className='login-email' style={{display: 'block', marginBottom: '0.5rem', color: '#003459', fontSize: '0.9rem'}}>Email:</label>
              <input 
                className="custom-input"
                type="email" 
                placeholder="ejemplo@ecopolo.com" 
>>>>>>> origin/Home
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            {/* Link para volver */}
<<<<<<< HEAD
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/login" className="forgot-link">
                ← Volver al inicio de sesión
=======
            <div style={{textAlign: 'center', marginTop: '1rem'}}>
              <Link to="/" className="forgot-link">
                 ← Volver al inicio de sesión
>>>>>>> origin/Home
              </Link>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default RecuperarPassword;