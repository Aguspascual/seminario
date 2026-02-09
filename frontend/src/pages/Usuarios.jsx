import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "../assets/styles/modals/Usuarios/Usuarios.module.css";
import stylesCrear from "../assets/styles/modals/Usuarios/Usuarios.crear.module.css";
import stylesEditar from "../assets/styles/modals/Usuarios/Usuarios.editar.module.css";
import stylesDetalles from "../assets/styles/modals/Usuarios/Usuarios.detalles.module.css";
import Head from "../components/Head";
import Table from "../components/Table";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { concatenarNombre, separarNombre } from "../utils/nombres";
import { usuarioCreateSchema, usuarioUpdateSchema } from "../validations/usuario_validations";
import { useNotification } from "../context/NotificationContext"; // Importar contexto

const Usuarios = () => {
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce para la busqueda
  useEffect(() => {
    const handler = setTimeout(() => {
        // Solo buscar si tiene 3 o más caracteres, o si está vacío (reset)
        if (busqueda.length >= 3 || busqueda.length === 0) {
            setDebouncedSearch(busqueda);
            setCurrentPage(1); // Resetear a página 1 en nueva búsqueda
        }
    }, 300);

    return () => {
        clearTimeout(handler);
    };
  }, [busqueda]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Forms with Validation
  const {
    register: registerCrear,
    handleSubmit: handleSubmitCrear,
    reset: resetCrear,
    formState: { errors: errorsCrear }
  } = useForm({
    resolver: yupResolver(usuarioCreateSchema)
  });

  const {
    register: registerEditar,
    handleSubmit: handleSubmitEditar,
    reset: resetEditar,
    setValue: setValueEditar,
    formState: { errors: errorsEditar }
  } = useForm({
    resolver: yupResolver(usuarioUpdateSchema)
  });

  // Leer usuario de localStorage para el Header
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario')) || {};
    } catch {
      return {};
    }
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotification(); // Usar notificación

  // Handlers para Modals
  const abrirModalCrear = () => {
    resetCrear();
    setMostrarModalCrear(true);
  };
  const cerrarModalCrear = () => setMostrarModalCrear(false);

  const abrirModalDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalDetalles(true);
  };

  const cerrarModalDetalles = () => {
    setUsuarioSeleccionado(null);
    setMostrarModalDetalles(false);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    // Separar nombre y apellido para la edición
    const { nombre, apellido } = separarNombre(usuario.nombre);
    
    // Setear valores en el formulario
    setValueEditar('nombre', nombre);
    setValueEditar('apellido', apellido);
    setValueEditar('email', usuario.email);
    setValueEditar('telefono', usuario.telefono);
    setValueEditar('rol', usuario.rol);
    setValueEditar('area_id', usuario.area_id);
    setValueEditar('turno_id', usuario.turno_id || "");
    
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setUsuarioSeleccionado(null);
    resetEditar();
    setMostrarModalEditar(false);
  };

  // 1. Fetching Usuarios (Paginado desde Back)
  const { data: dataUsuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios', currentPage, itemsPerPage, debouncedSearch],
    queryFn: async () => {
      let url = `http://localhost:5000/usuarios?page=${currentPage}&limit=${itemsPerPage}`;
      if (debouncedSearch) {
          url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al cargar usuarios");
      return response.json();
    }
  });

  const usuarios = dataUsuarios?.usuarios || [];
  const totalPages = dataUsuarios?.total_pages || 1;
  const totalItems = dataUsuarios?.total_items || 0;

  // 2. Fetching Areas
  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/areas");
      if (!response.ok) throw new Error("Error al cargar áreas");
      return response.json();
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  // 3. Fetching Grupos (para Turnos)
  const { data: grupos = [] } = useQuery({
    queryKey: ['grupos'],
    queryFn: async () => {
      const response = await fetch("http://localhost:5000/api/grupos");
      if (!response.ok) throw new Error("Error al cargar grupos");
      return response.json();
    },
    staleTime: 1000 * 60 * 5
  });

  // 4. Mutation para Crear Usuario
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
      cerrarModalCrear();
      showNotification("success", "Usuario creado exitosamente");
    },
    onError: (err) => {
      showNotification("error", err.message);
    }
  });

  // 5. Mutation para Actualizar Usuario
  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
        const response = await fetch(`http://localhost:5000/usuarios/${updatedUser.id}`, {
            method: "PUT",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al actualizar el usuario");
        }
        return response.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['usuarios']);
        cerrarModalEditar();
        showNotification("success", "Usuario actualizado exitosamente");
    },
    onError: (err) => {
        showNotification("error", err.message);
    }
  });

  // 6. Mutation para Eliminar Usuario (Soft Delete)
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
            throw new Error(errorData.error || "Error al eliminar el usuario");
        }
        return response.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['usuarios']);
        cerrarModalEliminar();
        showNotification("success", "Usuario eliminado exitosamente");
    },
    onError: (err) => {
        showNotification("error", err.message);
    }
  });

  // 7. Query para Historial de Usuario Seleccionado
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
  
  // State para Modal Eliminar
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  const abrirModalEliminar = (usuario) => {
      setUsuarioAEliminar(usuario);
      setMostrarModalEliminar(true);
  };

  const cerrarModalEliminar = () => {
      setUsuarioAEliminar(null);
      setMostrarModalEliminar(false);
  };

  const confirmarEliminar = () => {
      if (usuarioAEliminar) {
          deleteMutation.mutate(usuarioAEliminar.id);
      }
  };

  // Función para agregar usuario
  const onCrearSubmit = (data) => {
    // Concatenar nombre y apellido
    const nombreCompleto = concatenarNombre(data.nombre, data.apellido);

    const datosEnvio = {
      nombre: nombreCompleto,
      contrasena: data.contrasena,
      telefono: data.telefono,
      email: data.email,
      rol: data.rol,
      area_id: data.area_id,
      turno_id: data.turno_id || null,
    };

    createMutation.mutate(datosEnvio);
  };

  // Función para actualizar usuario
  const onEditarSubmit = (data) => {
    // Concatenar nombre y apellido antes de enviar
    const nombreCompleto = concatenarNombre(data.nombre, data.apellido);
    
    const datosParaEnviar = {
        id: usuarioSeleccionado.id,
        ...data,
        nombre: nombreCompleto
    };

    updateMutation.mutate(datosParaEnviar);
  };

  return (
    <div className={styles.container}>
      <Head user={user} />
      <div className={styles.main}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <Link to="/home">Home</Link> <span>/</span>
          <span className={styles.current}>Gestión de Usuarios</span>
        </div>
        
        <div className={styles['header-section']}>
          <h2>Gestión de Usuarios</h2>
        </div>

        <div className={styles['controls-section']}>
          <input
            type="text"
            placeholder="Buscar usuario..."
            className={styles['search-input']}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className={styles['btn-add']} onClick={abrirModalCrear}>
            <i className="fa-solid fa-plus"></i> Nueva Usuario
          </button>
        </div>

        {/* Modal Creación */}
        {mostrarModalCrear && (
          <div className={stylesCrear['modal-fondo']}>
            <div className={stylesCrear['modal-contenido']}>
              <h3>Agregar Usuario</h3>
              <div className={stylesCrear.separator}></div>
              <form onSubmit={handleSubmitCrear(onCrearSubmit)} style={{ marginTop: '20px', gap: '0.5rem' }}>
                <div className={stylesCrear.formRow}>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Nombre</label>
                      <input type="text" placeholder="Nombre" {...registerCrear("nombre")} />
                      {errorsCrear.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.nombre.message}</p>}
                  </div>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Apellido</label>
                      <input type="text" placeholder="Apellido" {...registerCrear("apellido")} />
                      {errorsCrear.apellido && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.apellido.message}</p>}
                  </div>
                </div>

                <div className={stylesCrear.formRow}>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Correo Electrónico</label>
                      <input type="email" placeholder="Correo Electrónico" {...registerCrear("email")} />
                      {errorsCrear.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.email.message}</p>}
                  </div>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Teléfono</label>
                      <input type="tel" placeholder="Teléfono" {...registerCrear("telefono")} />
                      {errorsCrear.telefono && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.telefono.message}</p>}
                  </div>
                </div>

                <div className={stylesCrear.formRow}>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Contraseña</label>
                      <input type="password" placeholder="Contraseña" {...registerCrear("contrasena")} />
                      {errorsCrear.contrasena && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.contrasena.message}</p>}
                  </div>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Confirmar Contraseña</label>
                      <input type="password" placeholder="Repetir Contraseña" {...registerCrear("confirmarContraseña")} />
                      {errorsCrear.confirmarContraseña && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.confirmarContraseña.message}</p>}
                  </div>
                </div>

                <div className={stylesCrear.formRow}>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Rol</label>
                      <select {...registerCrear("rol")}>
                        <option value="" hidden>Seleccionar Rol</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Operario">Operario</option>
                        <option value="Supervisor">Supervisor</option>
                      </select>
                      {errorsCrear.rol && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.rol.message}</p>}
                  </div>
                  <div className={stylesCrear.formGroup}>
                      <label className={stylesCrear.formLabel}>Área</label>
                      <select {...registerCrear("area_id")}>
                        <option value="" hidden>Seleccionar Área</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>{area.nombre}</option>
                        ))}
                      </select>
                      {errorsCrear.area_id && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.area_id.message}</p>}
                  </div>
                </div>

                <div className={stylesCrear.formGroup}>
                    <label className={stylesCrear.formLabel}>Turno</label>
                    <select {...registerCrear("turno_id")}>
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
                    {errorsCrear.turno_id && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.turno_id.message}</p>}
                </div>

                <div className={stylesCrear['modal-botones-derecha']}>
                  <button type="button" onClick={cerrarModalCrear} className={stylesCrear['btn-gris']}>Cancelar</button>
                  <button type="submit" className={stylesCrear['btn-confirmar']} disabled={createMutation.isPending}>
                      <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                    {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabla Reutilizable */}
        <Table
          isLoading={loadingUsuarios}
          data={usuarios}
          columns={[
            { header: "Nombre", accessor: "nombre" },
            { header: "Teléfono", accessor: "telefono" },
            { header: "Correo", accessor: "email" },
            { header: "Rol", accessor: "rol" },
            { header: "Área", accessor: "area" },
            {
              header: "Turno",
              render: (u) => u.turno_nombre ? `${u.turno_nombre}` : '-'
            },
            {
              header: "Acciones",
              render: (user) => (
                <div className={styles['actions-cell']}>
                  <button className={styles['action-btn']} onClick={() => abrirModalDetalles(user)} title="Ver Detalles">
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button className={styles['action-btn']} onClick={() => abrirModalEditar(user)} title="Editar">
                    <i className="fa-solid fa-pencil"></i>
                  </button>
                  {user.telefono && (
                    <a
                      href={`https://wa.me/549${user.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles['btn-whatsapp']}
                      title="Enviar WhatsApp"
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                    </a>
                  )}
                  <button className={styles['btn-delete-action']} onClick={() => abrirModalEliminar(user)} title="Eliminar">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              )
            }
          ]}
          pagination={{
            currentPage: currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            minRows: 10,
            onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
            onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
          }}
        />

        {/* Modal Detalles */}
        {mostrarModalDetalles && usuarioSeleccionado && (
          <div className={stylesDetalles['modal-fondo']} onClick={cerrarModalDetalles}>
            <div className={stylesDetalles['modal-contenido']} onClick={(e) => e.stopPropagation()}>
              <h3>Detalles del Usuario</h3>
              <div className={stylesDetalles.separator}></div>
              
              <div className={stylesDetalles['detalles-usuario']}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                    <div>
                        <p><strong>Nombre:</strong> {usuarioSeleccionado?.nombre || 'N/A'}</p>
                        <p><strong>Email:</strong> {usuarioSeleccionado?.email || 'N/A'}</p>
                        <p><strong>Teléfono:</strong> {usuarioSeleccionado?.telefono || 'N/A'}</p>
                        <p><strong>Rol:</strong> {usuarioSeleccionado?.rol || 'N/A'}</p>
                    </div>
                    <div>
                        <p><strong>Área:</strong> {usuarioSeleccionado?.area || 'N/A'}</p>
                        <p><strong>Turno:</strong> {usuarioSeleccionado?.turno_nombre ? `${usuarioSeleccionado.turno_nombre} (${usuarioSeleccionado.grupo_nombre})` : 'Sin asignar'}</p>
                    </div>
                  </div>

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

              <div className={stylesDetalles['modal-botones-derecha']}>
                  <button type="button" onClick={cerrarModalDetalles} className={stylesDetalles['btn-gris']}>
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                        cerrarModalDetalles();
                        abrirModalEditar(usuarioSeleccionado);
                    }}
                    className={stylesDetalles['btn-editar']}
                  >
                    <i className="fa-solid fa-pencil"></i> Editar
                  </button>
              </div>
            </div>
          </div >
        )}

        {/* Modal Editar */}
        {mostrarModalEditar && (
            <div className={stylesEditar['modal-fondo']}>
                <div className={stylesEditar['modal-contenido']}>
                    <h3>Editar Usuario</h3>
                    <div className={stylesEditar.separator}></div>
                    <form onSubmit={handleSubmitEditar(onEditarSubmit)} style={{ marginTop: '20px', gap: '0.5rem' }}>
                        <div className={stylesEditar.formRow}>
                            <div className={stylesEditar.formGroup}>
                                <label className={stylesEditar.formLabel}>Nombre Completo</label>
                                <input type="text" {...registerEditar("nombre")} />
                                {errorsEditar.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.nombre.message}</p>}
                            </div>
                             <div className={stylesEditar.formGroup}>
                                <label className={stylesEditar.formLabel}>Apellido</label>
                                <input type="text" {...registerEditar("apellido")} />
                                {errorsEditar.apellido && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.apellido.message}</p>}
                            </div>
                        </div>

                        <div className={stylesEditar.formRow}>
                            <div className={stylesEditar.formGroup}>
                                <label className={stylesEditar.formLabel}>Email</label>
                                <input type="email" {...registerEditar("email")} />
                                {errorsEditar.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.email.message}</p>}
                            </div>
                            <div className={stylesEditar.formGroup}>
                                <label className={stylesEditar.formLabel}>Teléfono</label>
                                <input type="tel" {...registerEditar("telefono")} />
                                {errorsEditar.telefono && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.telefono.message}</p>}
                            </div>
                        </div>

                        <div className={stylesEditar.formRow}>
                            <div className={stylesEditar.formGroup}>
                                <label className={stylesEditar.formLabel}>Rol</label>
                                <select {...registerEditar("rol")}>
                                    <option value="">Seleccionar Rol</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Operario">Operario</option>
                                    <option value="Supervisor">Supervisor</option>
                                </select>
                                {errorsEditar.rol && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.rol.message}</p>}
                            </div>
                            <div className={stylesEditar.formGroup}>
                                <label className={stylesEditar.formLabel}>Área</label>
                                <select {...registerEditar("area_id")}>
                                    <option value="">Seleccionar Área</option>
                                    {areas.map((area) => (
                                        <option key={area.id} value={area.id}>{area.nombre}</option>
                                    ))}
                                </select>
                                {errorsEditar.area_id && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.area_id.message}</p>}
                            </div>
                        </div>

                        <div className={stylesEditar.formGroup}>
                            <label className={stylesEditar.formLabel}>Turno</label>
                            <select {...registerEditar("turno_id")}>
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
                            {errorsEditar.turno_id && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.turno_id.message}</p>}
                        </div>

                         <div className={stylesEditar['modal-botones-derecha']}>
                            <button type="button" onClick={cerrarModalEditar} className={stylesEditar['btn-gris']}>
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className={stylesEditar['btn-confirmar']}
                              disabled={updateMutation.isPending}
                            >
                              <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                              {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                    </form>
                </div>
            </div>
        )}

        {/* Modal Confirmación Eliminar */}
        {mostrarModalEliminar && (
            <div className={styles['modal-confirmacion-fondo']} onClick={cerrarModalEliminar}>
                <div className={styles['modal-confirmacion-contenido']} onClick={(e) => e.stopPropagation()}>
                    <div style={{ marginBottom: "15px", color: "#ef4444", fontSize: "3rem" }}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                    </div>
                    <h3>¿Estás seguro?</h3>
                    <p>¿Deseas dar de baja a <strong>{usuarioAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</p>
                    <div className={styles['modal-confirmacion-botones']}>
                        <button onClick={cerrarModalEliminar} className={styles['btn-gris-modal']}>Cancelar</button>
                        <button onClick={confirmarEliminar} className={styles['btn-rojo']}>Eliminar</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
