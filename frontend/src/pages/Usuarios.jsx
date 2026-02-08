import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import "../assets/styles/Usuarios.css";
import Head from "../components/Head";
import Table from "../components/Table";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Usuarios = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [formError, setFormError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState({});
  const itemsPerPage = 10;

  // Leer usuario de localStorage para el Header
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario')) || {};
    } catch {
      return {};
    }
  });

  const queryClient = useQueryClient();

  const abrirModal = () => {
    setFormError("");
    setMostrarModal(true);
  };
  const cerrarModal = () => setMostrarModal(false);

  const abrirModalDetalles = (usuario) => {
    console.log('Usuario seleccionado:', usuario);
    setUsuarioSeleccionado(usuario);
    setDatosEdicion(usuario);
    setModoEdicion(false);
    setMostrarModalDetalles(true);
  };

  const cerrarModalDetalles = () => {
    setUsuarioSeleccionado(null);
    setModoEdicion(false);
    setDatosEdicion({});
    setMostrarModalDetalles(false);
  };

  const activarModoEdicion = () => {
    setDatosEdicion({ ...usuarioSeleccionado });
    setModoEdicion(true);
  };

  const cancelarEdicion = () => {
    setDatosEdicion({ ...usuarioSeleccionado });
    setModoEdicion(false);
  };

  // 1. Fetching Usuarios (Paginado desde Back)
  const { data: dataUsuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios', currentPage, itemsPerPage],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/usuarios?page=${currentPage}&limit=${itemsPerPage}`);
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    },
    keepPreviousData: true
  });

  const usuarios = dataUsuarios?.usuarios || [];
  const totalPages = dataUsuarios?.total_pages || 1;
  const totalItems = dataUsuarios?.total_items || 0;

  // 2. Fetching Areas (Se comparte caché con la página de Areas)
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/areas");
      if (!response.ok) throw new Error("Error al cargar áreas");
      return response.json();
    }
  });

  // 3. Fetching Grupos (para Turnos)
  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/api/grupos");
      if (!response.ok) throw new Error("Error al cargar grupos");
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

  // 4. Mutation para Actualizar Usuario
  const updateMutation = useMutation({
    mutationFn: async (datosActualizados) => {
      const response = await fetch(`http://localhost:5000/usuarios/${datosActualizados.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosActualizados),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el usuario");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      setModoEdicion(false);
      cerrarModalDetalles();
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 5. Mutation para Dar de Baja (Soft Delete)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`http://localhost:5000/usuarios/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar usuario");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      cerrarModalDetalles();
      alert("Usuario dado de baja correctamente");
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  // 6. Query para Historial de Usuario Seleccionado
  const { data: historial = [] } = useQuery({
    queryKey: ['historialUsuario', usuarioSeleccionado?.id],
    queryFn: async () => {
      if (!usuarioSeleccionado?.id) return [];
      const response = await fetch(`http://localhost:5000/usuarios/${usuarioSeleccionado.id}/historial`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!usuarioSeleccionado?.id && mostrarModalDetalles
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
      turno_id: formData.get("turno_id") || null,
    };

    createMutation.mutate(datosEnvio);
  };

  // Función para actualizar usuario
  const manejarActualizacion = (e) => {
    e.preventDefault();
    updateMutation.mutate(datosEdicion);
  };

  // Filtrar usuarios por búsqueda y EXCLUIR Admin
  // Filtrar usuarios por búsqueda y EXCLUIR Admin
  // NOTA: Con paginación en backend, el filtrado visual aplica a la página actual.
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const cumpleBusqueda =
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase());

    // Excluir usuarios Admin o Administrador
    const esAdmin = usuario.rol === 'Admin' || usuario.rol === 'Administrador';

    return cumpleBusqueda && !esAdmin;
  });

  // Rellenar con filas vacías para mantener altura constante (10 registros)
  // ELIMINADO: Usuario solicitó que no se muestren filas vacías.

  // Resetear a página 1 cuando cambia la búsqueda
  React.useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  return (
    <div className="container">
      <Head user={user} />
      <div className="main">
        {/* Breadcrumbs clickeables */}
        <div className="breadcrumbs">
          <Link to="/home">Home</Link> <span>/</span>
          <Link to="/home">Planta</Link> <span>/</span>
          <span className="current">Gestión de Usuarios</span>
        </div>
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

                <select name="turno_id">
                  <option value="">Seleccionar Turno (Opcional)</option>
                  {grupos.map((grupo) => (
                    <optgroup key={grupo.id} label={grupo.nombre}>
                      {grupo.turnos.map((turno) => (
                        <option key={turno.id} value={turno.id}>
                          {turno.nombre} ({turno.hora_inicio} - {turno.hora_fin})
                        </option>
                      ))}
                    </optgroup>
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
            { header: "Rol", accessor: "rol" },
            { header: "Área", accessor: "area" },
            {
              header: "Turno",
              render: (u) => u.turno_nombre ? `${u.turno_nombre} (${u.grupo_nombre})` : '-'
            },
            {
              header: "Acciones",
              render: (user) => (
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button className="action-btn" onClick={() => abrirModalDetalles(user)} title="Ver Detalles">
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  {user.telefono && (
                    <a
                      href={`https://wa.me/549${user.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn"
                      style={{
                        color: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '1.1rem'
                      }}
                      title="Enviar WhatsApp"
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                    </a>
                  )}
                </div>
              )
            }
          ]}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
            onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
          }}
        />

        {/* Modal Detalles */}
        {mostrarModalDetalles && usuarioSeleccionado && (
          <div className="modal-fondo" onClick={cerrarModalDetalles}>
            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
              <h3>{modoEdicion ? 'Editar Usuario' : 'Detalles del Usuario'}</h3>

              {!modoEdicion ? (
                <div className="detalles-usuario">
                  <p><strong>Nombre:</strong> {usuarioSeleccionado?.nombre || 'N/A'}</p>
                  <p><strong>Email:</strong> {usuarioSeleccionado?.email || 'N/A'}</p>
                  <p><strong>Teléfono:</strong> {usuarioSeleccionado?.telefono || 'N/A'}</p>
                  <p><strong>Rol:</strong> {usuarioSeleccionado?.rol || 'N/A'}</p>
                  <p><strong>Área:</strong> {usuarioSeleccionado?.area || 'N/A'}</p>
                  <p><strong>Turno:</strong> {usuarioSeleccionado?.turno_nombre ? `${usuarioSeleccionado.turno_nombre} (${usuarioSeleccionado.grupo_nombre})` : 'Sin asignar'}</p>

                  {/* Historial de Actividad */}
                  <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#2E4F6E' }}>Actividad Reciente</h4>
                    {historial.length === 0 ? (
                      <p style={{ color: '#888', fontStyle: 'italic' }}>No hay actividad registrada.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                        {historial.map((h) => (
                          <li key={h.id} style={{ marginBottom: '8px', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '4px' }}>
                            <div style={{ fontWeight: 'bold', color: '#4b5563' }}>{h.accion}</div>
                            <div style={{ color: '#666' }}>{h.detalle}</div>
                            <div style={{ fontSize: '0.8rem', color: '#999', textAlign: 'right' }}>{h.fecha}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={manejarActualizacion}>
                  <input
                    type="text"
                    value={datosEdicion.nombre || ''}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, nombre: e.target.value })}
                    placeholder="Nombre Completo"
                    required
                  />
                  <input
                    type="email"
                    value={datosEdicion.email || ''}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, email: e.target.value })}
                    placeholder="Email"
                    required
                  />
                  <input
                    type="tel"
                    value={datosEdicion.telefono || ''}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, telefono: e.target.value })}
                    placeholder="Teléfono"
                    required
                  />
                  <select
                    value={datosEdicion.rol || ''}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, rol: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar Rol</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Operario">Operario</option>
                    <option value="Supervisor">Supervisor</option>
                  </select>
                  <select
                    value={datosEdicion.area_id || ''}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, area_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar Área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>{area.nombre}</option>
                    ))}
                  </select>
                  <select
                    value={datosEdicion.turno_id || ''}
                    onChange={(e) => setDatosEdicion({ ...datosEdicion, turno_id: e.target.value })}
                  >
                    <option value="">Seleccionar Turno</option>
                    {grupos.map((grupo) => (
                      <optgroup key={grupo.id} label={grupo.nombre}>
                        {grupo.turnos.map((turno) => (
                          <option key={turno.id} value={turno.id}>
                            {turno.nombre} ({turno.hora_inicio} - {turno.hora_fin})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </form>
              )}

              <div className="modal-botones" style={{ marginTop: "20px" }}>
                {!modoEdicion ? (
                  <>
                    <button type="button" onClick={cerrarModalDetalles} className="btn-cancelar">
                      Cerrar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("¿Seguro que deseas dar de baja este usuario?")) {
                          deleteMutation.mutate(usuarioSeleccionado.id);
                        }
                      }}
                      className="btn-cancelar"
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                    >
                      Dar de Baja
                    </button>
                    <button type="button" onClick={activarModoEdicion} className="btn-confirmar">
                      Editar
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={cancelarEdicion} className="btn-cancelar">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={manejarActualizacion}
                      className="btn-confirmar"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div >
        )}
      </div >
    </div >
  );
};

export default Usuarios;
