import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Head from '../components/Head'; // Importamos la Navbar
import styles from '../assets/styles/Home.module.css'; // Usamos CSS Modules

const Home = ({ user }) => {
  // --- ESTADOS PARA LOS DATOS DEL BACKEND ---
  const [legalStatus, setLegalStatus] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [personalConteo, setPersonalConteo] = useState({ personal_activo: 0, detalle: "Cargando..." });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Obtenemos la URL de la variable de entorno
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // 1. FETCH LEGAL (Tu tabla)
        const resLegal = await fetch(`${apiUrl}/legal/dashboard-status`, { headers });
        if (resLegal.ok) {
            const dataLegal = await resLegal.json();
            setLegalStatus(dataLegal);
        }

        // 2. FETCH BITÁCORA (Tu tabla)
        const resBitacora = await fetch(`${apiUrl}/bitacora/recientes`, { headers });
        if (resBitacora.ok) {
            const dataBitacora = await resBitacora.json();
            setActividad(dataBitacora);
        }

        // 3. FETCH USUARIOS (Solo Admin)
        // Verificamos que user exista antes de chequear el rol
        if (user && user.rol === 'Admin') {
          const resUser = await fetch(`${apiUrl}/usuarios/conteo`, { headers });
          if (resUser.ok) {
              const dataUser = await resUser.json();
              setPersonalConteo(dataUser);
          }
        }

      } catch (error) {
        console.error("Error conectando con el servidor:", error);
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutamos el fetch si tenemos usuario
    if (user) {
        fetchDashboardData();
    }
  }, [user, apiUrl]);

  if (loading) return <div className={styles.loadingContainer}>Cargando Dashboard...</div>;

  return (
    <>
      {/* 1. NAVBAR SUPERIOR */}
      <Head user={user} />

      {/* 2. CONTENIDO DEL DASHBOARD */}
      <div className={styles.homeContainer}>
        
        {/* HEADER: Saludo y Hora */}
        <header className={styles.headerDashboard}>
          <div className={styles.welcomeBox}>
            <h1>Bienvenido, <span className={styles.userName}>{user?.nombre || "Usuario"}</span></h1>
            <span className={styles.time}>
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}hs
            </span>
          </div>
          <button className={styles.btnCrear}>
            <i className="fas fa-plus-circle" style={{marginRight:'8px'}}></i>
            Crear Reporte
          </button>
        </header>

        {/* --- SECCIÓN DE CARDS (KPIs) --- */}
        <section className={styles.kpiGrid}>
          
          {/* CARD AUDITORÍA (Admin y B) */}
          {(user?.rol === 'Admin' || user?.rol === 'Supervisor') && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                  <h3><i className="fas fa-folder-open"></i> Auditoría</h3>
              </div>
              <div className={styles.cardBody}>
                  <p>Última: <span className={styles.statusOk}>Aprobada ✅</span></p>
                  <p>Próxima: <strong>27/08/2026</strong></p>
              </div>
            </div>
          )}

          {/* CARD MAQUINARIA (Todos) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
                <h3><i className="fas fa-cogs"></i> Maquinaria</h3>
            </div>
            <div className={styles.cardBody}>
                <p>En funcionamiento: <strong>3</strong></p>
                <p className={styles.textMuted}>Detalle: en espera de camiones</p>
            </div>
          </div>

          {/* CARD PERSONAL (Solo Admin) */}
          {user?.rol === 'Admin' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                  <h3><i className="fas fa-users"></i> Personal</h3>
              </div>
              <div className={styles.cardBody}>
                  <p>Activos: <strong>{personalConteo.personal_activo}</strong></p>
                  <p className={styles.textMuted}>{personalConteo.detalle}</p>
              </div>
            </div>
          )}
        </section>

        {/* --- SEMÁFORO LEGAL (Admin y B) --- */}
        {(user?.rol === 'Admin' || user?.rol === 'Supervisor') && (
          <section className={styles.legalSection}>
             <h3 className={styles.sectionTitle}>Estado Legal de Planta</h3>
             <div className={styles.legalCard}>
                {legalStatus.length > 0 ? (
                    legalStatus.map((doc, index) => (
                    <div key={index} className={styles.legalItem}>
                        <span className={styles.legalTitle}>{doc.titulo}</span>
                        <span className={styles.legalDate}>Vence {doc.vencimiento}</span>
                        <span className={styles.legalIcon}>
                            {doc.estado_visual === 'ok' ? '✅' : doc.estado_visual === 'warning' ? '⚠️' : '❌'}
                        </span>
                    </div>
                    ))
                ) : (
                    <p>No hay alertas legales pendientes.</p>
                )}
             </div>
          </section>
        )}

        {/* --- ACTIVIDAD RECIENTE (Bitácora) --- */}
        <section className={styles.activitySection}>
            <h3 className={styles.sectionTitle}>Actividad Reciente</h3>
            <div className={styles.activityList}>
                {actividad.length > 0 ? (
                    actividad.map((log) => (
                    <div key={log.id} className={styles.activityItem}>
                        <span className={styles.logTime}>{log.hora}</span>
                        <span className={styles.logDivider}>|</span>
                        <span className={styles.logMessage}>{log.mensaje}</span>
                    </div>
                    ))
                ) : (
                    <p className={styles.textMuted}>No hay actividad reciente registrada.</p>
                )}
            </div>
        </section>

      </div>
    </>
  );
};

export default Home;