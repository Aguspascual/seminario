import React, { useState } from 'react';
import styles from '../assets/styles/Areas.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Areas = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);
    const manejarEnvio = (e) => {
        e.preventDefault();
        cerrarModal();
    };
    return (
    <div className={styles.container}>
        <Head />
        <div className={styles.main}>
            <h6>Home &gt; Planta &gt; Gestion de Areas</h6>
            <div className={styles.tabla}>
                <div className={styles.superior}>
                    <div className={styles.subtitulo}>
                        <h2>Gestion de Areas</h2>
                        <button className={styles.btn} onClick={abrirModal}><i class="fa-solid fa-circle-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Areas' className={styles.buscarArea}/>
                </div>
                {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>Agregar Proveedor</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input type="text" placeholder="Nombre" required />
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar}>Agregar</button>
                                        <button type="button" onClick={cerrarModal} className={styles.btnCancelar}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                <table className={styles.cabecera}>
                    <thead>
                        <tr>
                            <th className={styles.id}>ID</th>
                            <th className={styles.nombre}>Nombre</th>
                            <th className={styles.estado}>Estado</th>
                            <th className={styles.FechaCreacion}>Fecha Creacion</th>
                            <th className={styles.accion}>Acciones</th>
                        </tr>
                    </thead>
                </table>
                <table className={styles.datos}>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Recursos Humanos</td>
                        <td>Activa</td>
                        <td>2024-06-15</td>
                        <td className={styles.accion}>
                          <button className={styles.download} title="Descargar área">
                            <i className="fas fa-download"></i>
                          </button>
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

export default Areas;