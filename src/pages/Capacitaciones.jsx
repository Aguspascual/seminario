import React from 'react';
import styles from '../assets/styles/Capacitaciones.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Capacitaciones = () => {
    return (
    <div className={styles.container}>
        <Head />
        <div className={styles.main}>
            <h6>Home &gt; Planta &gt; Gestion de Capacitaciones</h6>
            <div className={styles.tabla}>
                <div className={styles.superior}>
                    <div className={styles.subtitulo}>
                        <h2>Gestion de Capacitaciones</h2>
                        <button className={styles.btn}><i class="fa-solid fa-circle-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Capacitacion' className={styles.buscarUsuario}/>
                </div>
                <table className={styles.cabecera}>
                    <thead>
                        <tr>
                            <th className={styles.id}>ID</th>
                            <th className={styles.tipo}>Fecha</th>
                            <th className={styles.profesional}>Profesional</th>
                            <th className={styles.nombre}>Descripcion</th>
                            <th className={styles.accion}>Acciones</th>
                        </tr>
                    </thead>
                </table>
                <table className={styles.datos}>
                    <tbody>
                      <tr>
                        <td className={styles.id}>1</td>
                        <td className={styles.tipo}>2025-01-10</td>
                        <td className={styles.profesional}>Ing. Laura Fernández</td>
                        <td className={styles.nombre}>Seguridad en áreas con gas</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>2</td>
                        <td className={styles.tipo}>2025-02-14</td>
                        <td className={styles.profesional}>Lic. Matías Gómez</td>
                        <td className={styles.nombre}>Uso de equipos de protección personal (EPP)</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>3</td>
                        <td className={styles.tipo}>2025-03-05</td>
                        <td className={styles.profesional}>Dra. Cecilia Ríos</td>
                        <td className={styles.nombre}>Evacuación y primeros auxilios</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>4</td>
                        <td className={styles.tipo}>2025-03-25</td>
                        <td className={styles.profesional}>Ing. Pablo Medina</td>
                        <td className={styles.nombre}>Manejo de materiales peligrosos</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>5</td>
                        <td className={styles.tipo}>2025-04-18</td>
                        <td className={styles.profesional}>Lic. Mónica Salas</td>
                        <td className={styles.nombre}>Formación en normativas ISO 45001</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>6</td>
                        <td className={styles.tipo}>2025-05-03</td>
                        <td className={styles.profesional}>Tec. Jorge Araya</td>
                        <td className={styles.nombre}>Procedimientos ante derrames</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>7</td>
                        <td className={styles.tipo}>2025-06-11</td>
                        <td className={styles.profesional}>Ing. Claudia Díaz</td>
                        <td className={styles.nombre}>Uso seguro de maquinaria pesada</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>8</td>
                        <td className={styles.tipo}>2025-07-01</td>
                        <td className={styles.profesional}>Lic. Sergio Rivas</td>
                        <td className={styles.nombre}>Capacitación en SCADA y monitoreo remoto</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>9</td>
                        <td className={styles.tipo}>2025-08-08</td>
                        <td className={styles.profesional}>Tec. Valeria Gómez</td>
                        <td className={styles.nombre}>Prevención de incendios en campo</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                      <tr>
                        <td className={styles.id}>10</td>
                        <td className={styles.tipo}>2025-09-15</td>
                        <td className={styles.profesional}>Ing. Tomás Ruiz</td>
                        <td className={styles.nombre}>Simulacro de emergencia integral</td>
                        <td className={styles.accion}>📝</td>
                      </tr>
                    </tbody>

                </table>
            </div>
        </div>
        <Footer />
    </div>
    );
};

export default Capacitaciones;