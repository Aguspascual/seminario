import React from 'react';
import styles from '../assets/styles/Maquinaria.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Maquinaria = () => {
    return (
    <div className={styles.container}>
        <Head />
        <div className={styles.main}>
            <h6>Home &gt; Planta &gt; Gestion de Maquinaria</h6>
            <div className={styles.tabla}>
                <div className={styles.superior}>
                    <div className={styles.subtitulo}>
                        <h2>Gestion de Maquinaria</h2>
                        <button className={styles.btn}><i class="fa-solid fa-circle-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Usuario' className={styles.buscarUsuario}/>
                </div>
                <table className={styles.cabecera}>
                    <thead>
                        <tr>
                            <th className={styles.id}>ID</th>
                            <th className={styles.tipo}>Tipo</th>
                            <th className={styles.nombre}>Nombre</th>
                            <th className={styles.accion}>Acciones</th>
                        </tr>
                    </thead>
                </table>
                <table className={styles.datos}>
                    <tbody>
                      <tr>
                        <td className={styles.id}>1</td>
                        <td className={styles.tipo}>Perforadora</td>
                        <td className={styles.nombre}>Perforadora Rotativa TRX-9000</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>2</td>
                        <td className={styles.tipo}>Bomba</td>
                        <td className={styles.nombre}>Bomba de Cavidad Progresiva PCM-500</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>3</td>
                        <td className={styles.tipo}>Extractor</td>
                        <td className={styles.nombre}>Unidad de Bombeo Mecánico Mark II</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>4</td>
                        <td className={styles.tipo}>Compresor</td>
                        <td className={styles.nombre}>Compresor de Gas Ariel JG-200</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>5</td>
                        <td className={styles.tipo}>Generador</td>
                        <td className={styles.nombre}>Generador Diésel Cummins QSK50</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>6</td>
                        <td className={styles.tipo}>Separador</td>
                        <td className={styles.nombre}>Separador Trifásico VSM-4000</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>7</td>
                        <td className={styles.tipo}>Estación</td>
                        <td className={styles.nombre}>Estación de Medición Modular EMT-700</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>8</td>
                        <td className={styles.tipo}>Tanque</td>
                        <td className={styles.nombre}>Tanque de Almacenamiento Horizontal 150m³</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>9</td>
                        <td className={styles.tipo}>Controlador</td>
                        <td className={styles.nombre}>Sistema SCADA Rockwell RSLinx</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td className={styles.id}>10</td>
                        <td className={styles.tipo}>Elevador</td>
                        <td className={styles.nombre}>Elevador Hidráulico HL-2500</td>
                        <td className={styles.accion}><i class="fa-solid fa-eye"></i></td>
                      </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <Footer />
    </div>
    );
};

export default Maquinaria;