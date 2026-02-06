import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import "../assets/styles/Usuarios.css";
import Head from "../components/Head";
import Footer from "../components/Footer";
import Table from "../components/Table";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Usuarios = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [formError, setFormError] = useState("");

  const queryClient = useQueryClient();

  const abrirModal = () => {
    setFormError("");
    setMostrarModal(true);
  };
  const cerrarModal = () => setMostrarModal(false);

  const abrirModalDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalDetalles(true);
  };

  const cerrarModalDetalles = () => {
    setUsuarioSeleccionado(null);
    setMostrarModalDetalles(false);
  };

  // 1. Fetching Usuarios
  const { data: usuarios = [], isLoading: loadingUsuarios, isError: errorUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/usuarios");
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    }
  });

  // 2. Fetching Areas (Se comparte caché con la página de Areas)
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/areas");
      if (!response.ok) throw new Error("Error al cargar áreas");
      return response.json();
    }
  });

  // 3. Mutation para Crear Usuario
  const createMutation = useMutation({
    mutationFn: async (datosEnvio) => {
      const response = await fetch("http://localhost:5000/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEnvio),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al agregar el usuario");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      cerrarModal();
    },
    onError: (err) => {
      setFormError(err.message);
    }
  });

  // Función para agregar usuario
  const manejarEnvio = (e) => {
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

    createMutation.mutate(datosEnvio);
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
        <div className="header-section">
          <h2>Gestión de Usuarios</h2>
        </div>

        <div className="controls-section">
          <input
            type="text"
            placeholder="Buscar usuario..."
            className="search-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-add" onClick={abrirModal}>
            <i className="fa-solid fa-plus"></i> Agregar Usuario
          </button>
        </div>

        {/* Modal creación */}
        {mostrarModal && (
          <div className="modal-fondo">
            <div className="modal-contenido">
              <h3>Agregar Usuario</h3>
              <form onSubmit={manejarEnvio}>
                <input type="text" name="nombre" placeholder="Nombre" required />
                <input type="text" name="apellido" placeholder="Apellido" required />
                <input type="email" name="email" placeholder="Correo Electrónico" required />
                <input type="password" name="contrasena" placeholder="Contraseña" required />
                <input type="tel" name="telefono" placeholder="Teléfono" required />

                <select name="rol" required>
                  <option value="" hidden>Rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Operario">Operario</option>
                  <option value="Supervisor">Supervisor</option>
                </select>

                <select name="area_id" required>
                  <option value="" hidden>Área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.nombre}</option>
                  ))}
                </select>

                {formError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{formError}</p>}

                <div className="modal-botones">
                  <button type="button" onClick={cerrarModal} className="btn-cancelar">Cancelar</button>
                  <button type="submit" className="btn-confirmar" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Guardando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla Reutilizable */}
        <Table
          isLoading={loadingUsuarios}
          data={usuariosFiltrados}
          columns={[
            { header: "Nombre", accessor: "nombre" },
            { header: "Teléfono", accessor: "telefono" },
            { header: "Correo", accessor: "email" },
            { header: "Rol", accessor: "rol" },
            { header: "Área", accessor: "area" },
            {
              header: "Acciones",
              render: (user) => (
                <button className="action-btn" onClick={() => abrirModalDetalles(user)}>
                  <i className="fa-solid fa-eye"></i>
                </button>
              )
            }
          ]}
        />

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
      <Footer />
    </div>
  );
};

export default Usuarios;
