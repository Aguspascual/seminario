import React from 'react';
import { Link } from 'react-router-dom';

const Head = () => {
  return (
    <header style={{ 
      backgroundColor: '#003459', 
      color: 'white', 
      padding: '10px 20px', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center' 
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ECOPOLO</div>
      <nav style={{ display: 'flex', gap: '15px' }}>
        <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/legal" style={{ color: 'white', textDecoration: 'none' }}>Legal</Link>
        <button style={{ background: '#3a7d44', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default Head;