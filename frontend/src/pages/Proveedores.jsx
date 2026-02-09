import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import styles from '../assets/styles/modals/Proveedores/Proveedores.module.css';
import stylesCrear from '../assets/styles/modals/Proveedores/Proveedores.crear.module.css';
import stylesEditar from '../assets/styles/modals/Proveedores/Proveedores.editar.module.css';
import stylesDetalles from '../assets/styles/modals/Proveedores/Proveedores.detalles.module.css';

import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNotification } from "../context/NotificationContext";

// Schema de Validación (lo defino aquí o en archivo separado, por ahora aquí para consistencia rápida)
const proveedorSchema = yup.object().shape({
  nombre: yup.string().required("El nombre es requerido").min(3, "Mínimo 3 caracteres"),
  email: yup.string().email("Email inválido").required("El email es requerido"),
  numero: yup.string().required("El teléfono es requerido").min(8, "Mínimo 8 caracteres"),
  idTipo: yup.string().required("El tipo de proveedor es requerido"), // Select devuelve string usualmente
});

const Proveedores = () => {
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [proveedorAEliminar, setProveedorAEliminar] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // Obtener usuario del localStorage
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('usuario')) || {};
        } catch {
            return {};
        }
    });

    // Forms
    const {
        register: registerCrear,
        handleSubmit: handleSubmitCrear,
        reset: resetCrear,
        formState: { errors: errorsCrear }
    } = useForm({
        resolver: yupResolver(proveedorSchema)
    });

    const {
        register: registerEditar,
        handleSubmit: handleSubmitEditar,
        reset: resetEditar,
        setValue: setValueEditar,
        formState: { errors: errorsEditar }
    } = useForm({
        resolver: yupResolver(proveedorSchema)
    });

    // Debounce Búsqueda
    useEffect(() => {
        const handler = setTimeout(() => {
            if (busqueda.length >= 3 || busqueda.length === 0) {
                setDebouncedSearch(busqueda);
                setCurrentPage(1);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [busqueda]);

    // 1. Fetching Proveedores
    const { data: dataProveedores, isLoading: loadingProveedores } = useQuery({
        queryKey: ['proveedores', currentPage, itemsPerPage, debouncedSearch],
        queryFn: async () => {
            let url = `http://localhost:5000/proveedores?page=${currentPage}&limit=${itemsPerPage}`;
            if (debouncedSearch) {
                url += `&search=${encodeURIComponent(debouncedSearch)}`;
            }
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al cargar proveedores");
            return response.json();
        }
    });

    // Support both array response (if backend not updated) and paginated response
    const proveedores = Array.isArray(dataProveedores) ? dataProveedores : (dataProveedores?.proveedores || []);
    const totalPages = dataProveedores?.total_pages || 1;
    const totalItems = dataProveedores?.total_items || 0;

    // 2. Fetching Tipos de Proveedor
    const { data: tiposProveedor = [] } = useQuery({
        queryKey: ['tiposProveedor'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/tipos-proveedor");
            if (!response.ok) throw new Error("Error al cargar tipos");
            return response.json();
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch("http://localhost:5000/proveedores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Nombre: data.nombre,
                    Email: data.email,
                    Numero: data.numero,
                    idTipo: parseInt(data.idTipo)
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            cerrarModalCrear();
            showNotification("success", "Proveedor creado exitosamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async (data) => {
             const response = await fetch(`http://localhost:5000/proveedores/${proveedorSeleccionado.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Nombre: data.nombre,
                    Email: data.email,
                    Numero: data.numero,
                    idTipo: parseInt(data.idTipo)
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al actualizar");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            cerrarModalEditar();
            showNotification("success", "Proveedor actualizado exitosamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

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
            cerrarModalEliminar();
            showNotification("success", "Proveedor eliminado exitosamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    // Handlers
    const abrirModalCrear = () => {
        resetCrear();
        setMostrarModalCrear(true);
    };
    const cerrarModalCrear = () => setMostrarModalCrear(false);

    const abrirModalEditar = (proveedor) => {
        setProveedorSeleccionado(proveedor);
        setValueEditar("nombre", proveedor.Nombre);
        setValueEditar("email", proveedor.Email);
        setValueEditar("numero", proveedor.Numero);
        setValueEditar("idTipo", proveedor.idTipo); // Ensure this matches backend field
        setMostrarModalEditar(true);
    };
    const cerrarModalEditar = () => {
        setProveedorSeleccionado(null);
        resetEditar();
        setMostrarModalEditar(false);
    };

    const abrirModalDetalles = (proveedor) => {
        setProveedorSeleccionado(proveedor);
        setMostrarModalDetalles(true);
    };
    const cerrarModalDetalles = () => {
        setProveedorSeleccionado(null);
        setMostrarModalDetalles(false);
    };

    const abrirModalEliminar = (proveedor) => {
        setProveedorAEliminar(proveedor);
        setMostrarModalEliminar(true);
    };
    const cerrarModalEliminar = () => {
        setProveedorAEliminar(null);
        setMostrarModalEliminar(false);
    };

    const confirmarEliminar = () => {
        if (proveedorAEliminar) {
            deleteMutation.mutate(proveedorAEliminar.id);
        }
    };

    const onCrearSubmit = (data) => createMutation.mutate(data);
    const onEditarSubmit = (data) => updateMutation.mutate(data);

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <Link to="/home">Home</Link> <span>/</span>
                    <span className={styles.current}>Gestión de Proveedores</span>
                </div>

                <div className={styles['header-section']}>
                    <h2>Gestión de Proveedores</h2>
                </div>

                {/* Controls */}
                <div className={styles['controls-section']}>
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        className={styles['search-input']}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button className={styles['btn-add']} onClick={abrirModalCrear}>
                        <i className="fa-solid fa-plus"></i> Nuevo Proveedor
                    </button>
                </div>

                {/* Tabla */}
                <Table
                    isLoading={loadingProveedores}
                    data={proveedores}
                    columns={[
                        { header: "Empresa", accessor: "Nombre" },
                        { header: "Teléfono", accessor: "Numero" },
                        { header: "Email", accessor: "Email" },
                        { 
                            header: "Tipo", 
                            render: (p) => p.tipo_proveedor || "Sin tipo" 
                        },
                        {
                            header: "Acciones",
                            render: (item) => (
                                <div className={styles['actions-cell']}>
                                    <button className={styles['action-btn']} onClick={() => abrirModalDetalles(item)} title="Ver Detalles">
                                        <i className="fa-solid fa-eye"></i>
                                    </button>
                                    <button className={styles['action-btn']} onClick={() => abrirModalEditar(item)} title="Editar">
                                        <i className="fa-solid fa-pencil"></i>
                                    </button>
                                    {item.Numero && (
                                        <a
                                            href={`https://wa.me/549${item.Numero.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles['btn-whatsapp']}
                                            title="Enviar WhatsApp"
                                        >
                                            <i className="fa-brands fa-whatsapp"></i>
                                        </a>
                                    )}
                                    <button className={styles['btn-delete-action']} onClick={() => abrirModalEliminar(item)} title="Eliminar">
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

                {/* Modal Crear */}
                {mostrarModalCrear && (
                    <div className={stylesCrear['modal-fondo']}>
                        <div className={stylesCrear['modal-contenido']}>
                            <h3>Agregar Proveedor</h3>
                            <div className={stylesCrear.separator}></div>
                            <form onSubmit={handleSubmitCrear(onCrearSubmit)} style={{ marginTop: '20px', gap: '0.5rem' }}>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Nombre de la Empresa</label>
                                    <input type="text" {...registerCrear("nombre")} placeholder="Ej. Proveedora S.A." />
                                    {errorsCrear.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.nombre.message}</p>}
                                </div>
                                <div className={stylesCrear.formRow}>
                                    <div className={stylesCrear.formGroup}>
                                        <label className={stylesCrear.formLabel}>Teléfono</label>
                                        <input type="tel" {...registerCrear("numero")} placeholder="Ej. 1122334455" />
                                        {errorsCrear.numero && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.numero.message}</p>}
                                    </div>
                                    <div className={stylesCrear.formGroup}>
                                        <label className={stylesCrear.formLabel}>Email</label>
                                        <input type="email" {...registerCrear("email")} placeholder="contacto@empresa.com" />
                                        {errorsCrear.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.email.message}</p>}
                                    </div>
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Tipo de Proveedor</label>
                                    <select {...registerCrear("idTipo")}>
                                        <option value="">Seleccionar Tipo</option>
                                        {tiposProveedor.map((tipo) => (
                                            <option key={tipo.idTipo} value={tipo.idTipo}>{tipo.nombreTipo}</option>
                                        ))}
                                    </select>
                                    {errorsCrear.idTipo && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.idTipo.message}</p>}
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

                {/* Modal Editar */}
                {mostrarModalEditar && (
                    <div className={stylesEditar['modal-fondo']}>
                        <div className={stylesEditar['modal-contenido']}>
                            <h3>Editar Proveedor</h3>
                            <div className={stylesEditar.separator}></div>
                            <form onSubmit={handleSubmitEditar(onEditarSubmit)} style={{ marginTop: '20px', gap: '0.5rem' }}>
                                <div className={stylesEditar.formGroup}>
                                    <label className={stylesEditar.formLabel}>Nombre de la Empresa</label>
                                    <input type="text" {...registerEditar("nombre")} />
                                    {errorsEditar.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.nombre.message}</p>}
                                </div>
                                <div className={stylesEditar.formRow}>
                                    <div className={stylesEditar.formGroup}>
                                        <label className={stylesEditar.formLabel}>Teléfono</label>
                                        <input type="tel" {...registerEditar("numero")} />
                                        {errorsEditar.numero && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.numero.message}</p>}
                                    </div>
                                    <div className={stylesEditar.formGroup}>
                                        <label className={stylesEditar.formLabel}>Email</label>
                                        <input type="email" {...registerEditar("email")} />
                                        {errorsEditar.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.email.message}</p>}
                                    </div>
                                </div>
                                <div className={stylesEditar.formGroup}>
                                    <label className={stylesEditar.formLabel}>Tipo de Proveedor</label>
                                    <select {...registerEditar("idTipo")}>
                                        <option value="">Seleccionar Tipo</option>
                                        {tiposProveedor.map((tipo) => (
                                            <option key={tipo.idTipo} value={tipo.idTipo}>{tipo.nombreTipo}</option>
                                        ))}
                                    </select>
                                    {errorsEditar.idTipo && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsEditar.idTipo.message}</p>}
                                </div>

                                <div className={stylesEditar['modal-botones-derecha']}>
                                    <button type="button" onClick={cerrarModalEditar} className={stylesEditar['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesEditar['btn-confirmar']} disabled={updateMutation.isPending}>
                                        <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                                        {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detalles */}
                {mostrarModalDetalles && proveedorSeleccionado && (
                    <div className={stylesDetalles['modal-fondo']} onClick={cerrarModalDetalles}>
                        <div className={stylesDetalles['modal-contenido']} onClick={(e) => e.stopPropagation()}>
                            <h3>Detalles del Proveedor</h3>
                            <div className={stylesDetalles.separator}></div>
                            
                            <div className={stylesDetalles['detalles-usuario']}>
                                <p><strong>Empresa:</strong> {proveedorSeleccionado.Nombre}</p>
                                <p><strong>Email:</strong> {proveedorSeleccionado.Email}</p>
                                <p><strong>Teléfono:</strong> {proveedorSeleccionado.Numero}</p>
                                <p><strong>Tipo:</strong> {proveedorSeleccionado.tipo_proveedor || 'N/A'}</p>
                            </div>

                            <div className={stylesDetalles['modal-botones-derecha']}>
                                <button type="button" onClick={cerrarModalDetalles} className={stylesDetalles['btn-gris']}>
                                    Cerrar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        cerrarModalDetalles();
                                        abrirModalEditar(proveedorSeleccionado);
                                    }}
                                    className={stylesDetalles['btn-editar']}
                                >
                                    <i className="fa-solid fa-pencil"></i> Editar
                                </button>
                            </div>
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
                            <p>¿Deseas eliminar al proveedor <strong>{proveedorAEliminar?.Nombre}</strong>? Esta acción no se puede deshacer.</p>
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

export default Proveedores;
