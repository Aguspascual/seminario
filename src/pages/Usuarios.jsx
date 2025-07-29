import React, { useState } from 'react';
import '../assets/styles/Usuarios.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Usuarios = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);
    const manejarEnvio = (e) => {
        e.preventDefault();
        cerrarModal();
    };
    return (
    <div className='container'>
        <Head />
        <div className="main">
            <h6>Home &gt; Planta &gt; Gestion de Usuarios</h6>
            <div className="tabla">
                <div className="superior">
                    <div className="sub-titulo">
                        <h2>Gestion de Usuarios</h2>
                        <button className='btn' onClick={abrirModal}><i class="fa-solid fa-user-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Usuario' className='buscar-usuario'/>
                </div>
                    {/* Modal */}
                    {mostrarModal && (
                        <div className="modal-fondo">
                            <div className="modal-contenido">
                                <h3>Agregar Usuario</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input type="text" placeholder="Nombre" required />
                                    <input type="text" placeholder="Apellido" required />
                                    <input type="email" placeholder="Correo" required />
                                    <select required>
                                        <option value="" hidden>Seleccione un rol</option>
                                        <option value="administrador">Administrador</option>
                                        <option value="usuario">A</option>
                                        <option value="usuario">B</option>
                                        <option value="usuario">C</option>
                                    </select>
                                    <select required>
                                        <option value="" hidden>Seleccione un área</option>
                                        <option value="recursos_humanos">Recursos Humanos</option>
                                        <option value="finanzas">Finanzas</option>
                                        <option value="operaciones">Operaciones</option>
                                    </select>
                                    <div className="modal-botones">
                                        <button type="submit" className="btn-confirmar">Agregar</button>
                                        <button type="button" onClick={cerrarModal} className="btn-cancelar">Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                <table className='tabla'>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th className='correo'>Correo</th>
                            <th className='rol'>Rol</th>
                            <th className='area'>Area</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td className='area'>Recursos Humanos</td>
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

export default Usuarios;