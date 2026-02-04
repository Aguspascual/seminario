import React, { useState, useEffect } from "react";
import "../assets/styles/Usuarios.css";
import Head from "../components/Head";
import Footer from "../components/Footer";
import logo from "../assets/avg/LogoEcopolo.ico";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Usuarios = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  const abrirModalDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalDetalles(true);
  };

  const cerrarModalDetalles = () => {
    setUsuarioSeleccionado(null);
    setMostrarModalDetalles(false);
  };

  const [areas, setAreas] = useState([]);

  // Función para obtener usuarios de la API
  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/usuarios", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setError("Error al cargar los usuarios");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerAreas = async () => {
    try {
      const response = await fetch("http://localhost:5000/areas");
      if (response.ok) {
        const data = await response.json();
        setAreas(data);
      }
    } catch (error) {
      console.error("Error obteniendo areas:", error);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    obtenerUsuarios();
    obtenerAreas();
  }, []);

  // Función para agregar usuario
  const manejarEnvio = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const datosEnvio = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      contrasena: formData.get("contrasena"),
      telefono: formData.get("telefono"),
      email: formData.get("email"),
      rol: formData.get("rol"),
      area_id: formData.get("area_id"),
    };

    console.log("Datos que se envían:", datosEnvio); // Debug

    try {
      const response = await fetch("http://localhost:5000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosEnvio),
      });

      if (response.ok) {
        cerrarModal();
        obtenerUsuarios(); // Recargar la lista
      } else {
        setError("Error al agregar el usuario");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
      console.error("Error:", error);
    }
  };

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase())
  );
  return (
    <div className="container">
      <Head />
      <div className="main">
        <h6>Home &gt; Planta &gt; Gestion de Usuarios</h6>
        <div className="tabla">
          <div className="superior">
            <div className="sub-titulo">
              <h2>Gestion de Usuarios</h2>
              <button className="btn" onClick={abrirModal}>
                <i className="fa-solid fa-user-plus"></i>
              </button>
            </div>
            <input
              type="text"
              placeholder="Buscar Usuario"
              className="buscar-usuario"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          {/* Modal */}
          {mostrarModal && (
            <div className="modal-fondo">
              <div className="modal-contenido">
                <h3>Agregar Usuario</h3>
                <form onSubmit={manejarEnvio}>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    required
                  />
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Apellido"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo"
                    required
                  />
                  <input
                    type="password"
                    name="contrasena"
                    placeholder="Contraseña"
                    required
                  />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    required
                  />
                  <select name="rol" required>
                    <option value="" hidden>
                      Seleccione un rol
                    </option>
                    {/* Traer lista de roles desde la API */}
                    <option value="Administrador">Administrador</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  <select name="area_id" required>
                    <option value="" hidden>
                      Seleccione un área
                    </option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="modal-botones">
                    <button type="submit" className="btn-confirmar">
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="btn-cancelar"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Telefono</th>
                <th className="correo">Correo</th>
                <th className="rol">Rol</th>
                <th className="area">Area</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "red",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario, index) => (
                  <tr key={usuario.id || index}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.telefono}</td>
                    <td className="correo">{usuario.email}</td>
                    <td className="rol">{usuario.rol}</td>
                    <td className="area">{usuario.area}</td>
                    <td>
                      <i
                        className="fa-solid fa-eye"
                        style={{ cursor: "pointer" }}
                        onClick={() => abrirModalDetalles(usuario)}
                      ></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Modal Detalles */}
          {mostrarModalDetalles && usuarioSeleccionado && (
            <div className="modal-fondo">
              <div className="modal-contenido">
                <h3>Detalles del Usuario</h3>
                <div className="detalles-usuario" style={{ textAlign: "left" }}>

                  <p><strong>Nombre:</strong> {usuarioSeleccionado.nombre}</p>
                  <p><strong>Email:</strong> {usuarioSeleccionado.email}</p>
                  <p><strong>Teléfono:</strong> {usuarioSeleccionado.telefono}</p>
                  <p><strong>Rol:</strong> {usuarioSeleccionado.rol}</p>
                  <p><strong>Área:</strong> {usuarioSeleccionado.area}</p>
                  <p><strong>Estado:</strong> {usuarioSeleccionado.estado ? "Activo" : "Inactivo"}</p>
                </div>
                <div className="modal-botones" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={cerrarModalDetalles}
                    className="btn-cancelar"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Usuarios;
