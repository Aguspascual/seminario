import React from 'react';
import styles from '../assets/styles/Proveedores.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Proveedores = () => {
    return (
    <div className={styles.container}>
        <Head />
        <div className={styles.main}>
            <h6>Home &gt; Planta &gt; Gestion de Proveedores</h6>
            <div className={styles.tabla}>
                <div className={styles.superior}>
                    <div className={styles.subtitulo}>
                        <h2>Gestion de Proveedores</h2>
                        <button className={styles.btn}><i class="fa-solid fa-user-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Usuario' className={styles.buscarUsuario}/>
                </div>
                <table className={styles.cabecera}>
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th className={styles.tipo}>Tipo</th>
                            <th className={styles.numero}>Numero</th>
                            <th className={styles.correo}>Correo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                </table>
                <table className={styles.datos}>
                    <tbody>
                      <tr>
                        <td>Industrias TexWork</td>
                        <td>Ropa de Trabajo</td>
                        <td className={styles.numero}>1011</td>
                        <td className={styles.correo}>ventas@texwork.com.ar</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>PetroRepuestos S.A.</td>
                        <td>Repuestos Industriales</td>
                        <td className={styles.numero}>2045</td>
                        <td className={styles.correo}>contacto@petrorepuestos.com</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>ServiOil Equipamientos</td>
                        <td>Equipos de Extracción</td>
                        <td className={styles.numero}>3098</td>
                        <td className={styles.correo}>info@servioil.com</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>ProtecSeg S.R.L.</td>
                        <td>Elementos de Seguridad</td>
                        <td className={styles.numero}>4123</td>
                        <td className={styles.correo}>ventas@protecseg.com.ar</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>Lubricantes del Sur</td>
                        <td>Lubricantes</td>
                        <td className={styles.numero}>5234</td>
                        <td className={styles.correo}>soporte@lubdelsur.com</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>Industrias TexWork</td>
                        <td>Ropa de Trabajo</td>
                        <td className={styles.numero}>1011</td>
                        <td className={styles.correo}>ventas@texwork.com.ar</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>PetroRepuestos S.A.</td>
                        <td>Repuestos Industriales</td>
                        <td className={styles.numero}>2045</td>
                        <td className={styles.correo}>contacto@petrorepuestos.com</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>ServiOil Equipamientos</td>
                        <td>Equipos de Extracción</td>
                        <td className={styles.numero}>3098</td>
                        <td className={styles.correo}>info@servioil.com</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>ProtecSeg S.R.L.</td>
                        <td>Elementos de Seguridad</td>
                        <td className={styles.numero}>4123</td>
                        <td className={styles.correo}>ventas@protecseg.com.ar</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                      <tr>
                        <td>Lubricantes del Sur</td>
                        <td>Lubricantes</td>
                        <td className={styles.numero}>5234</td>
                        <td className={styles.correo}>soporte@lubdelsur.com</td>
                        <td><i class="fa-solid fa-eye"></i></td>
                      </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <Footer />
    </div>
    );
};

export default Proveedores;