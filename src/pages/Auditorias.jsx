import React from 'react';
import styles from '../assets/styles/Auditorias.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Auditorias = () => {
    return (
    <div className={styles.container}>
        <Head />
        <div className={styles.main}>
            <h6>Home &gt; Planta &gt; Gestion de Auditorias</h6>
            <div className={styles.tabla}>
                <div className={styles.superior}>
                    <div className={styles.subtitulo}>
                        <h2>Gestion de Auditorias</h2>
                        <button className={styles.btn}><i class="fa-solid fa-circle-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Auditoria' className={styles.buscarUsuario}/>
                </div>
                <table className={styles.cabecera}>
                    <thead>
                        <tr>
                            <th className={styles.id}>ID</th>
                            <th className={styles.tipo}>Fecha</th>
                            <th className={styles.estado}>Estado</th>
                            <th className={styles.area}>Area</th>
                            <th className={styles.accion}>Acciones</th>
                        </tr>
                    </thead>
                </table>
                <table className={styles.datos}>
                    <tbody>
                      <tr>
                        <td className={styles.id}>1</td>
                        <td className={styles.tipo}>2025-04-10</td>
                        <td className={styles.estado}>Completada</td>
                        <td className={styles.area}>Producción</td>
                        <td className={styles.accion}>
                          <button className={styles.download}><i className="fas fa-download"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.id}>2</td>
                        <td className={styles.tipo}>2025-04-12</td>
                        <td className={styles.estado}>Pendiente</td>
                        <td className={styles.area}>Mantenimiento</td>
                        <td className={styles.accion}>
                          <button className={styles.download}><i className="fas fa-download"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.id}>3</td>
                        <td className={styles.tipo}>2025-04-15</td>
                        <td className={styles.estado}>En proceso</td>
                        <td className={styles.area}>Seguridad</td>
                        <td className={styles.accion}>
                          <button className={styles.download}><i className="fas fa-download"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.id}>4</td>
                        <td className={styles.tipo}>2025-05-01</td>
                        <td className={styles.estado}>Completada</td>
                        <td className={styles.area}>Logística</td>
                        <td className={styles.accion}>
                          <button className={styles.download}><i className="fas fa-download"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td className={styles.id}>5</td>
                        <td className={styles.tipo}>2025-05-10</td>
                        <td className={styles.estado}>Reprogramada</td>
                        <td className={styles.area}>Administración</td>
                        <td className={styles.accion}>
                          <button className={styles.download}><i className="fas fa-download"></i></button>
                        </td>
                      </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <Footer />
    </div>
    );
};

export default Auditorias;