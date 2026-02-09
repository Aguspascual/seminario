import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import styles from '../assets/styles/modals/Auditorias/Auditorias.module.css';
import stylesCrear from '../assets/styles/modals/Auditorias/Auditorias.crear.module.css';
import stylesEditar from '../assets/styles/modals/Auditorias/Auditorias.editar.module.css';

import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNotification } from "../context/NotificationContext";

// Schema Validation
const auditoriaSchema = yup.object().shape({
    fecha: yup.string().required("La fecha es requerida"),
    hora: yup.string().required("La hora es requerida"),
    lugar: yup.string().required("El lugar es requerido")
});

const finalizarSchema = yup.object().shape({
    archivo: yup.mixed().required("El archivo es requerido")
        .test("fileSize", "El archivo es muy grande", (value) => {
            return value && value.length > 0;
        })
});

const Auditorias = () => {
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalFinalizar, setMostrarModalFinalizar] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);

    const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState(null);
    const [auditoriaAEliminar, setAuditoriaAEliminar] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [fechaFiltro, setFechaFiltro] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // User from localStorage
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
        resolver: yupResolver(auditoriaSchema)
    });

    const {
        register: registerFinalizar,
        handleSubmit: handleSubmitFinalizar,
        reset: resetFinalizar,
        formState: { errors: errorsFinalizar }
    } = useForm({
        resolver: yupResolver(finalizarSchema)
    });


    // 1. Fetching Auditorias
    const { data: auditorias = [], isLoading } = useQuery({
        queryKey: ['auditorias'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/auditorias");
            if (!response.ok) throw new Error("Error al cargar auditorias");
            return response.json();
        }
    });

    // 3. Fetching Areas (Lugares)
    const { data: areas = [] } = useQuery({
        queryKey: ['areas'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/areas");
            if (!response.ok) throw new Error("Error al cargar areas");
            return response.json();
        }
    });

    // Mutations
    const crearMutation = useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();
            formData.append('fecha', data.fecha);
            formData.append('hora', data.hora);
            formData.append('lugar', data.lugar);

            const response = await fetch("http://localhost:5000/auditorias", {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear auditoria");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
            setMostrarModalCrear(false);
            resetCrear();
            showNotification("success", "Auditoría programada correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const formData = new FormData();
            formData.append('fecha', data.fecha);
            formData.append('hora', data.hora);
            formData.append('lugar', data.lugar);

            const response = await fetch(`http://localhost:5000/auditorias/${id}`, {
                method: "PUT",
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al actualizar auditoria");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
            setMostrarModalEditar(false);
            setAuditoriaSeleccionada(null);
            showNotification("success", "Auditoría actualizada correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    const finalizarMutation = useMutation({
        mutationFn: async (data) => {
            const formData = new FormData();
            // data.archivo is FileList
            formData.append('archivo', data.archivo[0]);

            const response = await fetch(`http://localhost:5000/auditorias/${auditoriaSeleccionada.id}/finalizar`, {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al finalizar auditoria");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
            setMostrarModalFinalizar(false);
            resetFinalizar();
            setAuditoriaSeleccionada(null);
            showNotification("success", "Auditoría finalizada correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    const eliminarMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/auditorias/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Error al eliminar auditoria");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
            setMostrarModalEliminar(false);
            setAuditoriaAEliminar(null);
            showNotification("success", "Auditoría eliminada correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    // Filtering
    const auditoriasFiltradas = useMemo(() => {
        if (!auditorias) return [];
        return auditorias.filter((aud) => {
            const matchTexto = (aud.lugar?.toLowerCase().includes(busqueda.toLowerCase())) ||
                (aud.estado?.toLowerCase().includes(busqueda.toLowerCase()));
            const matchFecha = fechaFiltro ? aud.fecha === fechaFiltro : true;
            return matchTexto && matchFecha;
        });
    }, [auditorias, busqueda, fechaFiltro]);

    // Pagination (Client Side)
    const totalItems = auditoriasFiltradas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return auditoriasFiltradas.slice(startIndex, startIndex + itemsPerPage);
    }, [auditoriasFiltradas, currentPage, itemsPerPage]);

    // Handlers
    const handleCrear = (data) => {
        crearMutation.mutate(data);
    };

    const handleUpdate = (data) => {
        if (auditoriaSeleccionada) {
            updateMutation.mutate({ id: auditoriaSeleccionada.id, data });
        }
    };

    const handleFinalizar = (data) => {
        finalizarMutation.mutate(data);
    };

    const handleConfirmarEliminar = () => {
        if (auditoriaAEliminar) {
            eliminarMutation.mutate(auditoriaAEliminar);
        }
    };

    const abrirModalFinalizar = (aud) => {
        setAuditoriaSeleccionada(aud);
        setMostrarModalFinalizar(true);
    };

    const abrirModalEliminar = (id) => {
        setAuditoriaAEliminar(id);
        setMostrarModalEliminar(true);
    };

    const abrirModalEditar = (aud) => {
        setAuditoriaSeleccionada(aud);
        // Pre-fill form
        resetCrear({
            fecha: aud.fecha,
            hora: aud.hora,
            lugar: aud.lugar
        });
        setMostrarModalEditar(true);
    };

    const abrirModalDetalles = (aud) => {
        setAuditoriaSeleccionada(aud);
        setMostrarModalDetalles(true);
    };

    // Columns
    const columns = [
        {
            header: "Fecha y Hora",
            render: (aud) => `${aud.fecha} - ${aud.hora}`
        },
        {
            header: "Estado",
            render: (aud) => (
                <span style={{
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    backgroundColor:
                        aud.estado === 'Programado' ? '#e0f2fe' :
                            aud.estado === 'En Proceso' ? '#fef3c7' :
                                '#dcfce7',
                    color:
                        aud.estado === 'Programado' ? '#0369a1' :
                            aud.estado === 'En Proceso' ? '#b45309' :
                                '#15803d'
                }}>
                    {aud.estado}
                </span>
            )
        },
        { header: "Área", accessor: "lugar" },
        {
            header: "Archivo",
            render: (aud) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    {aud.archivo_path ? (
                        <a
                            href={`/assets/auditorias/${aud.archivo_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles['action-btn']}
                            title="Descargar PDF"
                            style={{ border: 'none' }}
                        >
                            <i className="fas fa-download"></i>
                        </a>
                    ) : (
                        <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                </div>
            )
        },
        {
            header: "Acciones",
            render: (aud) => (
                <div className={styles['actions-cell']}>

                    <button className={styles['action-btn']} onClick={() => abrirModalDetalles(aud)} title="Ver detalles">
                        <i className="fa-solid fa-eye"></i>
                    </button>

                    {aud.estado !== 'Terminado' && (
                        <button className={styles['action-btn']} onClick={() => abrirModalEditar(aud)} title="Editar">
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    )}

                    {aud.estado === 'En Proceso' && (
                        <button
                            className={styles['action-btn']}
                            onClick={() => abrirModalFinalizar(aud)}
                            title="Subir Archivo / Finalizar"
                        >
                            <i className="fa-solid fa-upload"></i>
                        </button>
                    )}

                    <button
                        className={styles['btn-delete-action']}
                        onClick={() => abrirModalEliminar(aud.id)}
                        title="Eliminar"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <Link to="/home">Home</Link> <span>/</span>
                    <span className={styles.current}>Gestión de Auditorias</span>
                </div>

                {/* Header */}
                <div className={styles['header-section']}>
                    <h2>Gestión de Auditorias</h2>
                </div>

                {/* Controls */}
                <div className={styles['controls-section']}>
                    <input
                        type="text"
                        placeholder='Buscar por lugar o estado...'
                        className={styles['search-input']}
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <input
                        type="date"
                        className={styles['search-input']}
                        style={{ width: '150px' }}
                        value={fechaFiltro}
                        onChange={(e) => {
                            setFechaFiltro(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <button className={styles['btn-add']} onClick={() => setMostrarModalCrear(true)}>
                        <i className="fa-solid fa-plus"></i> Programar Auditoria
                    </button>
                </div>

                {/* Table */}
                <Table
                    isLoading={isLoading}
                    data={paginatedData}
                    columns={columns}
                    pagination={{
                        currentPage: currentPage,
                        totalPages: totalPages,
                        totalItems: totalItems,
                        minRows: itemsPerPage, // Use itemsPerPage as minRows for consistent height
                        onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
                        onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
                    }}
                    emptyMessage="No se encontraron auditorías."
                />

                {/* Modal Crear */}
                {mostrarModalCrear && (
                    <div className={stylesCrear['modal-fondo']}>
                        <div className={stylesCrear['modal-contenido']}>
                            <h3>Programar Auditoria</h3>
                            <div className={stylesCrear.separator}></div>
                            <form onSubmit={handleSubmitCrear(handleCrear)} style={{ marginTop: '20px', gap: '10px' }}>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Fecha</label>
                                    <input type="date" {...registerCrear("fecha")} />
                                    {errorsCrear.fecha && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.fecha.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Hora</label>
                                    <input type="time" {...registerCrear("hora")} />
                                    {errorsCrear.hora && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.hora.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Lugar</label>
                                    <select {...registerCrear("lugar")}>
                                        <option value="">Seleccione un Lugar</option>
                                        {areas.map((area) => (
                                            <option key={area.id} value={area.nombre}>{area.nombre}</option>
                                        ))}
                                    </select>
                                    {errorsCrear.lugar && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.lugar.message}</p>}
                                </div>

                                <div className={stylesCrear['modal-botones-derecha']}>
                                    <button type="button" onClick={() => { setMostrarModalCrear(false); resetCrear(); }} className={stylesCrear['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesCrear['btn-confirmar']} disabled={crearMutation.isPending}>
                                        {crearMutation.isPending ? (
                                            'Programando...'
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-save" style={{ marginRight: '5px' }}></i> Programar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Editar */}
                {mostrarModalEditar && (
                    <div className={stylesCrear['modal-fondo']}>
                        <div className={stylesCrear['modal-contenido']}>
                            <h3>Editar Auditoria</h3>
                            <div className={stylesCrear.separator}></div>
                            <form onSubmit={handleSubmitCrear(handleUpdate)} style={{ marginTop: '20px', gap: '10px' }}>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Fecha</label>
                                    <input type="date" {...registerCrear("fecha")} />
                                    {errorsCrear.fecha && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.fecha.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Hora</label>
                                    <input type="time" {...registerCrear("hora")} />
                                    {errorsCrear.hora && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.hora.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Lugar</label>
                                    <select {...registerCrear("lugar")}>
                                        <option value="">Seleccione un Lugar</option>
                                        {areas.map((area) => (
                                            <option key={area.id} value={area.nombre}>{area.nombre}</option>
                                        ))}
                                    </select>
                                    {errorsCrear.lugar && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.lugar.message}</p>}
                                </div>

                                <div className={stylesCrear['modal-botones-derecha']}>
                                    <button type="button" onClick={() => { setMostrarModalEditar(false); resetCrear(); }} className={stylesCrear['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesCrear['btn-confirmar']} disabled={updateMutation.isPending}>
                                        {updateMutation.isPending ? (
                                            'Guardando...'
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-save" style={{ marginRight: '5px' }}></i> Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detalles */}
                {mostrarModalDetalles && auditoriaSeleccionada && (
                    <div className={stylesCrear['modal-fondo']} onClick={() => setMostrarModalDetalles(false)}>
                        <div className={stylesCrear['modal-contenido']} onClick={(e) => e.stopPropagation()}>
                            <h3>Detalles de Auditoría</h3>
                            <div className={stylesCrear.separator}></div>
                            <div style={{ marginTop: '15px' }}>

                                <p><strong>Fecha Programada:</strong> {auditoriaSeleccionada.fecha}</p>
                                <p><strong>Hora Programada:</strong> {auditoriaSeleccionada.hora}</p>
                                <p><strong>Lugar (Área):</strong> {auditoriaSeleccionada.lugar}</p>
                                <p><strong>Estado Actual:</strong> {auditoriaSeleccionada.estado}</p>
                                <p><strong>Archivo:</strong> {auditoriaSeleccionada.archivo_path ? (
                                    <a href={`/assets/auditorias/${auditoriaSeleccionada.archivo_path}`} target="_blank" rel="noopener noreferrer" style={{ color: '#2E4F6E' }}>Ver PDF</a>
                                ) : "No adjunto"}</p>
                            </div>
                            <div className={stylesCrear['modal-botones-derecha']}>
                                <button type="button" onClick={() => setMostrarModalDetalles(false)} className={stylesCrear['btn-gris']}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Finalizar (Upload) - Using stylesEditar for form look */}
                {mostrarModalFinalizar && (
                    <div className={stylesEditar['modal-fondo']}>
                        <div className={stylesEditar['modal-contenido']}>
                            <h3>Finalizar Auditoria</h3>
                            <div className={stylesEditar.separator}></div>
                            <p style={{ margin: '15px 0', color: '#4b5563', fontSize: '0.95rem' }}>
                                Sube el archivo PDF para completar la auditoría de <strong>{auditoriaSeleccionada?.lugar}</strong>.
                            </p>
                            <form onSubmit={handleSubmitFinalizar(handleFinalizar)}>
                                <div className={stylesEditar.formGroup}>
                                    <label className={stylesEditar.formLabel}>Archivo de Informe (PDF)</label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        {...registerFinalizar("archivo", { required: "El archivo es obligatorio" })}
                                        style={{ padding: '10px' }} // Extra padding for file input
                                    />
                                    {errorsFinalizar.archivo && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsFinalizar.archivo.message}</p>}
                                </div>

                                <div className={stylesEditar['modal-botones-derecha']}>
                                    <button type="button" onClick={() => { setMostrarModalFinalizar(false); resetFinalizar(); }} className={stylesEditar['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesEditar['btn-confirmar']} disabled={finalizarMutation.isPending}>
                                        {finalizarMutation.isPending ? 'Subiendo...' : 'Finalizar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Eliminar */}
                {mostrarModalEliminar && (
                    <div className={styles['modal-confirmacion-fondo']}>
                        <div className={styles['modal-confirmacion-contenido']}>
                            <h3 style={{ color: '#ef4444', fontSize: '1.5rem', marginBottom: '10px' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i> ¿Estás seguro?
                            </h3>
                            <p>¿Deseas eliminar esta auditoría? Esta acción no se puede deshacer.</p>
                            <div className={styles['modal-confirmacion-botones']}>
                                <button onClick={() => setMostrarModalEliminar(false)} className={styles['btn-gris-modal']}>Cancelar</button>
                                <button onClick={handleConfirmarEliminar} className={styles['btn-rojo']}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Auditorias;