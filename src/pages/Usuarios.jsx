import React from 'react';
import '../assets/styles/Usuarios.css';
import logo from '../assets/avg/LogoEcopolo.ico';
import '@fortawesome/fontawesome-free/css/all.min.css';



const Usuarios = () => {
    return (
    <div className='container'>
        <div className="header">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="item">
                <a href='/'>Home</a>
                <div class="dropdown">
                <button class="dropbtn">Planta</button>
                <div class="dropdown-content">
                    <a href="/usuarios">Usuarios</a>
                    <a href="/usuarios">Usuarios</a>
                    <a href="/usuarios">Usuarios</a>
                    <a href="/usuarios">Usuarios</a>
                    <a href="/usuarios">Usuarios</a>
                </div>
                </div>
                <div class="dropdown">
                <button class="dropbtn">Mantenimiento</button>
                <div class="dropdown-content">
                    <a href="/usuarios">Maquinas</a>
                </div>
                </div>
            </div>
        </div>
        <div className="main">
            <h6>Home &gt; Planta &gt; Gestion de Usuarios</h6>
            <div className="tabla">
                <table className='tabla'>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                        <tr>
                            <td>Juan</td>
                            <td>Perez</td>
                            <td>JuanPerez@gmail.com</td>
                            <td>Administrador</td>
                            <td><i class="fa-solid fa-eye"></i></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className="footer">
        <div className="superior">
            <img src={logo} alt="Logo Ecopolo"/>
            <div className="info">
            <div className="izquierda">
                <h5>Estamos en</h5>
                <p>Ruta Provincial N17, Km 178, Añelo, Neuquen AR</p>
            </div>
            <div className="derecha">
                <h5>Contactos</h5>
                <div className="contactos-iconos">
                    <i className="fas fa-phone"></i>
                    <i className="fab fa-linkedin"></i>
                    <i className="far fa-envelope"></i>
                </div>
            </div>
            </div>
        </div>
        <div className="inferior">
            <h5>© 2025 EcoPolo Argentina S.A. Todos los derechos reservados.</h5>
        </div>
        </div>
    </div>
    );
};

export default Usuarios;