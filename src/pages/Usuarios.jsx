import React from 'react';
import '../assets/styles/Usuarios.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Usuarios = () => {
    return (
    <div className='container'>
        <Head />
        <div className="main">
            <h6>Home &gt; Planta &gt; Gestion de Usuarios</h6>
            <div className="tabla">
                <div className="superior">
                    <div className="sub-titulo">
                        <h2>Gestion de Usuarios</h2>
                        <button className='btn'><i class="fa-solid fa-user-plus"></i></button>
                    </div>
                    <input type="text" placeholder='Buscar Usuario' className='buscar-usuario'/>
                </div>
                <table className='tabla'>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th className='correo'>Correo</th>
                            <th className='rol'>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td className='correo'>JuanPerez@gmail.com</td>
                            <td className='rol'>Administrador</td>
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