import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import '../assets/styles/Proveedores.css';
import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Proveedores = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
    const [modalEliminar, setModalEliminar] = useState({ mostrar: false, id: null, nombre: '' });
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [datosEdicion, setDatosEdicion] = useState({});

    const [busqueda, setBusqueda] = useState("");
    const [formError, setFormError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Obtener usuario del localStorage para el Head
    const user = JSON.parse(localStorage.getItem('usuario'));

    const queryClient = useQueryClient();

    // 1. Fetching Proveedores
    const { data: proveedores = [], isLoading: loadingProveedores, isError: errorProveedores } = useQuery({
        queryKey: ['proveedores'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/proveedores");
            if (!response.ok) throw new Error("Error al cargar proveedores");
            return response.json();
        }
    });

    // 2. Fetching Tipos de Proveedor
    const { data: tiposProveedor = [] } = useQuery({
        queryKey: ['tiposProveedor'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/tipos-proveedor");
            if (!response.ok) throw new Error("Error al cargar tipos");
            return response.json();
        }
    });

    // 3. Mutation para Crear
    const createMutation = useMutation({
        mutationFn: async (nuevoProveedor) => {
            const response = await fetch("http://localhost:5000/proveedores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoProveedor),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al agregar el proveedor");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 4. Mutation para Eliminar
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/proveedores/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al eliminar");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
        },
        onError: (err) => {
            alert("Error al eliminar: " + err.message);
        }
    });

    // 5. Mutation para Actualizar
    const updateMutation = useMutation({
        mutationFn: async (datosActualizados) => {
            const response = await fetch(`http://localhost:5000/proveedores/${datosActualizados.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datosActualizados),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al actualizar");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            setModoEdicion(false);
            cerrarModalDetalles();
        },
        onError: (err) => {
            alert("Error al actualizar: " + err.message);
        }
    });

    const abrirModal = () => {
        setFormError("");
        setMostrarModal(true);
    };

    const cerrarModal = () => setMostrarModal(false);

    const abrirModalDetalles = (proveedor) => {
        setProveedorSeleccionado(proveedor);
        setDatosEdicion(proveedor);
        setModoEdicion(false);
        setMostrarModalDetalles(true);
    };

    const cerrarModalDetalles = () => {
        setProveedorSeleccionado(null);
        setModoEdicion(false);
        setDatosEdicion({});
        setMostrarModalDetalles(false);
    };

    const activarModoEdicion = () => {
        setDatosEdicion({ ...proveedorSeleccionado });
        setModoEdicion(true);
    };

    const cancelarEdicion = () => {
        setDatosEdicion({ ...proveedorSeleccionado });
        setModoEdicion(false);
    };

    const manejarActualizacion = (e) => {
        e.preventDefault();
        updateMutation.mutate(datosEdicion);
    };

    const eliminarProveedor = (proveedor) => {
        setModalEliminar({ mostrar: true, id: proveedor.id, nombre: proveedor.Nombre });
    };

    const confirmarEliminacion = () => {
        if (modalEliminar.id) {
            deleteMutation.mutate(modalEliminar.id);
            setModalEliminar({ mostrar: false, id: null, nombre: '' });
        }
    };

    const cancelarEliminacion = () => {
        setModalEliminar({ mostrar: false, id: null, nombre: '' });
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        createMutation.mutate({
            Nombre: formData.get("nombre"),
            Numero: formData.get("numero"), // Se envía como string (teléfono)
            Email: formData.get("email"),
            idTipo: parseInt(formData.get("tipo"))
        });
    };

    // Filtrado y Paginación (Client-side)
    const proveedoresFiltrados = proveedores.filter(
        (proveedor) =>
            proveedor.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            proveedor.Email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = proveedoresFiltrados.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="container">
            <Head user={user} />
            <div className="main">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/home">Home</Link> <span>&gt;</span>
                    <Link to="/home">Planta</Link> <span>&gt;</span>
                    <span className="current">Gestión de Proveedores</span>
                </div>

                <div className="header-section">
                    <h2>Gestión de Proveedores</h2>
                </div>

                <div className="controls-section">
                    <input
                        type="text"
                        placeholder='Buscar Proveedor...'
                        className="search-input"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button className="btn-add" onClick={abrirModal}>
                        <i className="fa-solid fa-user-plus"></i> Agregar Proveedor
                    </button>
                </div>

                {/* Modal */}
                {mostrarModal && (
                    <div className="modal-fondo">
                        <div className="modal-contenido">
                            <h3>Agregar Proveedor</h3>
                            <form onSubmit={manejarEnvio}>
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Nombre de la empresa"
                                    required
                                />
                                <input
                                    type="tel"
                                    name="numero"
                                    placeholder="Teléfono"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    required
                                />
                                <select name="tipo" required>
                                    <option value="" hidden>Seleccione un tipo</option>
                                    {tiposProveedor.map((tipo) => (
                                        <option key={tipo.idTipo} value={tipo.idTipo}>
                                            {tipo.nombreTipo}
                                        </option>
                                    ))}
                                </select>

                                {formError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{formError}</p>}
                                {createMutation.isError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{createMutation.error.message}</p>}

                                <div className="modal-botones">
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        className="btn-cancelar"
                                        disabled={createMutation.isPending}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-confirmar" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Guardando...' : 'Agregar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Eliminar */}
                {modalEliminar.mostrar && (
                    <div className="modal-fondo">
                        <div className="modal-contenido">
                            <h3>Eliminar Proveedor</h3>
                            <p>Estas seguro de eliminar al proveedor <strong>{modalEliminar.nombre}</strong>?</p>
                            <div className="modal-botones">
                                <button onClick={cancelarEliminacion} className="btn-cancelar">
                                    Cancelar
                                </button>
                                <button onClick={confirmarEliminacion} className="btn-confirmar" style={{ backgroundColor: '#ef4444' }}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>

                )}

                {/* Modal Detalles / Edición */}
                {mostrarModalDetalles && proveedorSeleccionado && (
                    <div className="modal-fondo" onClick={cerrarModalDetalles}>
                        <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                            <h3>{modoEdicion ? 'Editar Proveedor' : 'Detalles del Proveedor'}</h3>

                            {!modoEdicion ? (
                                <div className="detalles-usuario">
                                    <p><strong>Empresa:</strong> {proveedorSeleccionado.Nombre}</p>
                                    <p><strong>Teléfono:</strong> {proveedorSeleccionado.Numero}</p>
                                    <p><strong>Email:</strong> {proveedorSeleccionado.Email}</p>
                                    <p><strong>Tipo:</strong> {proveedorSeleccionado.tipo_proveedor || 'N/A'}</p>
                                    <p><strong>Estado:</strong> {proveedorSeleccionado.Estado ? 'Activo' : 'Inactivo'}</p>
                                </div>
                            ) : (
                                <form onSubmit={manejarActualizacion}>
                                    <input
                                        type="text"
                                        value={datosEdicion.Nombre || ''}
                                        onChange={(e) => setDatosEdicion({ ...datosEdicion, Nombre: e.target.value })}
                                        placeholder="Nombre de la empresa"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        value={datosEdicion.Numero || ''}
                                        onChange={(e) => setDatosEdicion({ ...datosEdicion, Numero: e.target.value })}
                                        placeholder="Teléfono"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={datosEdicion.Email || ''}
                                        onChange={(e) => setDatosEdicion({ ...datosEdicion, Email: e.target.value })}
                                        placeholder="Email"
                                        required
                                    />
                                    <select
                                        value={datosEdicion.idTipo || ''}
                                        onChange={(e) => setDatosEdicion({ ...datosEdicion, idTipo: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value="" hidden>Seleccione un tipo</option>
                                        {tiposProveedor.map((tipo) => (
                                            <option key={tipo.idTipo} value={tipo.idTipo}>
                                                {tipo.nombreTipo}
                                            </option>
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
                    </div>
                )}

                <div className="table-container-proveedores">
                    <Table
                        isLoading={loadingProveedores}
                        data={currentData}
                        columns={[
                            { header: "Empresa", accessor: "Nombre" },
                            {
                                header: "Tipo",
                                render: (item) => (
                                    <span className="badge-tipo">{item.tipo_proveedor || "Sin tipo"}</span>
                                )
                            },
                            { header: "Número", accessor: "Numero" },
                            { header: "Correo", accessor: "Email" },
                            {
                                header: "Acciones",
                                render: (item) => (
                                    <>
                                        <button className="action-btn" onClick={() => abrirModalDetalles(item)} title="Ver detalles">
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                        <a
                                            href={`https://wa.me/549${item.Numero}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn"
                                            title="Enviar WhatsApp"
                                            style={{ color: '#25D366' }}
                                        >
                                            <i className="fa-brands fa-whatsapp"></i>
                                        </a>
                                        <button className="action-btn delete-btn" onClick={() => eliminarProveedor(item)} title="Eliminar">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </>
                                )
                            }
                        ]}
                    />
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Anterior
                        </button>
                        <span className="pagination-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
            {/* Footer removido */}
        </div >
    );
};

export default Proveedores;
