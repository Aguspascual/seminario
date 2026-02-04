import React, { useState, useEffect } from "react";
import styles from "../assets/styles/MiPerfil.module.css";
import Head from "../components/Head";
import Footer from "../components/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";

const MiPerfil = () => {
  const [usuario, setUsuario] = useState({
    nombre: "",
    email: "",
    telefono: "",
    rol: "",
    area: "",
  });
  const [usuarioOriginal, setUsuarioOriginal] = useState({});
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Obtener datos del usuario al cargar
  useEffect(() => {
    obtenerPerfil();
  }, []);

  const obtenerPerfil = async () => {
    try {
      setLoading(true);
      // Obtener el ID del usuario del localStorage (asumiendo que se guarda al hacer login)
      const usuarioGuardado = localStorage.getItem("usuario");
      
      if (usuarioGuardado) {
        const datosUsuario = JSON.parse(usuarioGuardado);
        setUsuario(datosUsuario);
        setUsuarioOriginal(datosUsuario);
      } else {
        // Si no hay datos en localStorage, intentar obtener de la API
        const response = await fetch("http://localhost:5000/usuarios/perfil", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsuario(data);
          setUsuarioOriginal(data);
        }
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      setMensaje({ texto: "Error al cargar el perfil", tipo: "error" });
    } finally {
      setLoading(false);
    }
  };

  const habilitarEdicion = () => {
    setEditando(true);
    setMensaje({ texto: "", tipo: "" });
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setUsuario(usuarioOriginal);
    setMensaje({ texto: "", tipo: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/usuarios/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
          }),
        }
      );

      if (response.ok) {
        const datosActualizados = await response.json();
        setUsuario(datosActualizados);
        setUsuarioOriginal(datosActualizados);
        localStorage.setItem("usuario", JSON.stringify(datosActualizados));
        setEditando(false);
        setMensaje({ texto: "Perfil actualizado correctamente", tipo: "exito" });
      } else {
        setMensaje({ texto: "Error al actualizar el perfil", tipo: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje({ texto: "Error de conexión con el servidor", tipo: "error" });
    }
  };

  // Obtener iniciales para el avatar
  const obtenerIniciales = (nombre) => {
    if (!nombre) return "?";
    const palabras = nombre.split(" ");
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Head />
        <div className={styles.main}>
          <p style={{ color: "white", textAlign: "center", padding: "50px" }}>
            Cargando perfil...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head />
      <div className={styles.main}>
        <h6 className={styles.breadcrumb}>Home &gt; Mi Perfil &gt; Ver Perfil</h6>
        <div className={styles.tarjeta}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Mi Perfil</h2>
            </div>

            {mensaje.texto && (
              <div
                className={`${styles.mensaje} ${
                  mensaje.tipo === "exito"
                    ? styles.mensajeExito
                    : styles.mensajeError
                }`}
              >
                {mensaje.texto}
              </div>
            )}

            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {obtenerIniciales(usuario.nombre)}
              </div>
              <span className={styles.userName}>{usuario.nombre}</span>
              <span className={styles.userRole}>{usuario.rol}</span>
            </div>

            <form className={styles.formSection} onSubmit={guardarCambios}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={usuario.nombre}
                  onChange={handleChange}
                  disabled={!editando}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={usuario.email}
                    onChange={handleChange}
                    disabled={!editando}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={usuario.telefono}
                    onChange={handleChange}
                    disabled={!editando}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="rol">Rol</label>
                  <input
                    type="text"
                    id="rol"
                    name="rol"
                    value={usuario.rol}
                    disabled
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="area">Área</label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={usuario.area}
                    disabled
                  />
                </div>
              </div>

              <div className={styles.buttonSection}>
                {!editando ? (
                  <button
                    type="button"
                    className={styles.btnEditar}
                    onClick={habilitarEdicion}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    Editar Perfil
                  </button>
                ) : (
                  <>
                    <button type="submit" className={styles.btnGuardar}>
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      className={styles.btnCancelar}
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MiPerfil;
