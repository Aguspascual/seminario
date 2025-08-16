import React, { useState, useEffect } from "react";
import "../assets/styles/Usuarios.css";
import Head from "../components/Head";
import Footer from "../components/Footer";
import logo from "../assets/avg/LogoEcopolo.ico";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Usuarios = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

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

  // Cargar usuarios al montar el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // Función para agregar usuario
  const manejarEnvio = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await fetch("http://localhost:5000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.get("nombre"),
          telefono: formData.get("telefono"),
          email: formData.get("email"),
          rol: formData.get("rol"),
          area: formData.get("area"),
        }),
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
                <i class="fa-solid fa-user-plus"></i>
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
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo"
                    required
                  />
                  <select name="rol" required>
                    <option value="" hidden>
                      Seleccione un rol
                    </option>
                    <option value="administrador">Administrador</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  <select name="area" required>
                    <option value="" hidden>
                      Seleccione un área
                    </option>
                    <option value="RRHH">RRHH</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="Operaciones">Operaciones</option>
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
                      <i className="fa-solid fa-eye"></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Usuarios;
