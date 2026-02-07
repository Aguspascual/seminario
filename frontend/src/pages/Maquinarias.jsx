import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "../assets/styles/Maquinaria.module.css";
import stylesCrear from "../assets/styles/Maquinaria.crear.modal.module.css";
import stylesDetalles from "../assets/styles/Maquinaria.detalles.modal.module.css";
import stylesEditar from "../assets/styles/Maquinaria.editar.modal.module.css";
import Head from "../components/Head";
import Table from "../components/Table";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Maquinarias = ({ user }) => {
    const queryClient = useQueryClient();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [maquinariaSeleccionada, setMaquinariaSeleccionada] = useState(null);
    const [idEliminar, setIdEliminar] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [busquedaDebounced, setBusquedaDebounced] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

    const [activeTab, setActiveTab] = useState('info'); // 'info', 'mantenimientos', 'reportes'
    const [expandedItemId, setExpandedItemId] = useState(null);

    // Toggle expand
    const toggleExpand = (id) => {
        setExpandedItemId(prev => prev === id ? null : id);
    };

    // Queries para historial (se ejecutan solo cuando hay una maquina seleccionada y la tab activa)
    const { data: historialMantenimiento = [] } = useQuery({
        queryKey: ['mantenimientosMaquina', maquinariaSeleccionada?.id_maquinaria],
        queryFn: async () => {
            if (!maquinariaSeleccionada) return [];
            const res = await fetch(`http://localhost:5000/api/mantenimientos/maquinaria/${maquinariaSeleccionada.id_maquinaria}`);
            if (!res.ok) throw new Error("Error al cargar mantenimientos");
            const data = await res.json();
            return data.mantenimientos;
        },
        enabled: !!maquinariaSeleccionada && activeTab === 'mantenimientos'
    });

    const { data: historialReportes = [] } = useQuery({
        queryKey: ['reportesMaquina', maquinariaSeleccionada?.id_maquinaria],
        queryFn: async () => {
            if (!maquinariaSeleccionada) return [];
            const res = await fetch(`http://localhost:5000/api/mantenimientos/reportes/maquinaria/${maquinariaSeleccionada.id_maquinaria}`);
            if (!res.ok) throw new Error("Error al cargar reportes");
            const data = await res.json();
            return data.reportes;
        },
        enabled: !!maquinariaSeleccionada && activeTab === 'reportes'
    });

    // Reset tab on close
    const handleCloseModal = () => {
        cerrarModalDetalles();
        setActiveTab('info');
        setExpandedItemId(null);
    };

    // Obtener token
    const getToken = () => localStorage.getItem("token");

    // Efecto para Debounce de Búsqueda
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (busqueda.length >= 3 || busqueda.length === 0) {
                setBusquedaDebounced(busqueda);
                setCurrentPage(1); // Reset page on new valid search
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [busqueda]);

    // 1. Fetching Maquinarias (Paginado desde Back)
    const { data: dataMaquinarias, isLoading: loading } = useQuery({
        queryKey: ["maquinarias", currentPage, itemsPerPage, busquedaDebounced],
        queryFn: async () => {
            let url = `http://localhost:5000/maquinarias/?page=${currentPage}&limit=${itemsPerPage}`;
            // Solo enviamos q si tiene longitud válida o si el backend lo maneja, 
            // pero optimizamos no enviando calls innecesarios
            if (busquedaDebounced) url += `&q=${busquedaDebounced}`;

            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error("Error al cargar maquinarias");
            return response.json();
        },
        keepPreviousData: true
    });

    const maquinarias = dataMaquinarias?.maquinarias || [];
    const totalPages = dataMaquinarias?.total_pages || 1;
    const totalItems = dataMaquinarias?.total_items || 0;

    // Resetear página al buscar input
    const handleSearch = (e) => {
        setBusqueda(e.target.value);
    };

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (nuevaMaquinaria) => {
            const response = await fetch("http://localhost:5000/maquinarias/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(nuevaMaquinaria),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error al crear");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["maquinarias"]);
            cerrarModal();
            mostrarMensaje("success", "Maquinaria creada exitosamente");
        },
        onError: (err) => mostrarMensaje("error", err.message),
    });

    const updateMutation = useMutation({
        mutationFn: async (maquinaria) => {
            const response = await fetch(
                `http://localhost:5000/maquinarias/${maquinaria.id_maquinaria}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify(maquinaria),
                }
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error al actualizar");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["maquinarias"]);
            handleCloseModal();
            mostrarMensaje("success", "Maquinaria actualizada exitosamente");
        },
        onError: (err) => mostrarMensaje("error", err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/maquinarias/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error al eliminar");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["maquinarias"]);
            cerrarModalEliminar();
            mostrarMensaje("success", "Maquinaria dada de baja exitosamente");
        },
        onError: (err) => mostrarMensaje("error", err.message),
    });

    // Handlers de UI
    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
    };

    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);

    const abrirModalDetalles = (maq) => {
        setMaquinariaSeleccionada(maq);
        setModoEdicion(false);
        setMostrarModalDetalles(true);
    };

    const cerrarModalDetalles = () => {
        setMaquinariaSeleccionada(null);
        setMostrarModalDetalles(false);
        setModoEdicion(false);
    };

    const abrirModalEliminar = (id) => {
        setIdEliminar(id);
        setMostrarModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setIdEliminar(null);
        setMostrarModalEliminar(false);
    };

    const confirmarEliminar = () => {
        if (idEliminar) {
            deleteMutation.mutate(idEliminar);
        }
    };

    const handleCrear = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        createMutation.mutate({
            codigo: formData.get("codigo"),
            nombre: formData.get("nombre"),
            modelo: formData.get("modelo"),
            anio: formData.get("anio"),
            ubicacion: formData.get("ubicacion"),
            fecha_adquisicion: formData.get("fecha_adquisicion"),
            estado: parseInt(formData.get("estado")),
        });
    };

    const handleEditar = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateMutation.mutate({
            id_maquinaria: maquinariaSeleccionada.id_maquinaria,
            codigo: formData.get("codigo"),
            nombre: formData.get("nombre"),
            modelo: formData.get("modelo"),
            anio: formData.get("anio"),
            ubicacion: formData.get("ubicacion"),
            fecha_adquisicion: formData.get("fecha_adquisicion"),
            estado: parseInt(formData.get("estado")),
        });
    };

    const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-AR") : "N/A";

    const getEstadoBadge = (estado) => {
        const text = { 0: "Inactiva", 1: "Activa", 2: "En Reparación" };
        return {
            texto: text[estado] || "Desconocido",
            color: estado === 1 ? "#166534" : (estado === 2 ? "#eab308" : "#991b1b"),
            fondo: estado === 1 ? "#dcfce7" : (estado === 2 ? "#fef9c3" : "#fee2e2")
        };
    };

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                <div className={styles.breadcrumbs}>
                    <a href="/home">Home</a> <span>/</span>
                    <a href="/planta">Planta</a> <span>/</span>
                    <span className={styles.current}>Maquinaria</span>
                </div>

                <div className={styles['header-section']}>
                    <h2>Gestión de Maquinaria</h2>
                </div>

                {mensaje.texto && (
                    <div style={{
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "10px",
                        backgroundColor: mensaje.tipo === 'success' ? '#dcfce7' : '#fee2e2',
                        color: mensaje.tipo === 'success' ? '#166534' : '#991b1b',
                        width: "100%"
                    }}>
                        {mensaje.texto}
                    </div>
                )}

                <div className={styles['controls-section']}>
                    <input
                        type="text"
                        placeholder="Buscar por código, nombre..."
                        className={styles['search-input']}
                        value={busqueda}
                        onChange={handleSearch}
                    />
                    <button className={styles['btn-add']} onClick={abrirModal}>
                        <i className="fa-solid fa-plus"></i> Nueva Maquinaria
                    </button>
                </div>

                <Table
                    isLoading={loading}
                    data={maquinarias}
                    columns={[
                        { header: "Código", accessor: "codigo", render: (m) => <strong>{m.codigo}</strong> },
                        { header: "Nombre", accessor: "nombre" },
                        { header: "Modelo", accessor: "modelo" },
                        { header: "Ubicación", accessor: "ubicacion" },
                        {
                            header: "Estado",
                            render: (m) => {
                                const badge = getEstadoBadge(m.estado);
                                return (
                                    <span style={{
                                        backgroundColor: badge.fondo,
                                        color: badge.color,
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontSize: "0.85rem",
                                        fontWeight: "500"
                                    }}>
                                        {badge.texto}
                                    </span>
                                );
                            }
                        },
                        {
                            header: "Acciones",
                            render: (m) => (
                                <div className={styles['actions-cell']}>
                                    <button className={styles['action-btn']} onClick={() => abrirModalDetalles(m)} title="Ver detalles / Editar">
                                        <i className="fa-solid fa-eye"></i>
                                    </button>
                                    <button className={styles['btn-delete-action']} onClick={() => abrirModalEliminar(m.id_maquinaria)} title="Dar de baja">
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
                        onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
                        onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
                    }}
                />

                {/* Modal Crear */}
                {mostrarModal && (
                    <div className={stylesCrear['modal-fondo']} onClick={cerrarModal}>
                        <div className={stylesCrear['modal-contenido']} onClick={(e) => e.stopPropagation()}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px' }}>Nueva Maquinaria</h3>
                                <div className={stylesCrear.separator}></div>
                            </div>
                            <form onSubmit={handleCrear} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Código</label>
                                    <input name="codigo" placeholder="Ej: MAQ-001" required maxLength={50} />
                                </div>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Nombre</label>
                                    <input name="nombre" placeholder="Nombre" required maxLength={100} />
                                </div>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Modelo</label>
                                    <input name="modelo" placeholder="Modelo" maxLength={100} />
                                </div>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Año</label>
                                    <input name="anio" placeholder="Año" maxLength={4} pattern="\d{4}" />
                                </div>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Ubicación</label>
                                    <input name="ubicacion" placeholder="Ubicación" maxLength={200} />
                                </div>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Fecha Adquisición</label>
                                    <input type="date" name="fecha_adquisicion" />
                                </div>
                                <div className={stylesCrear.formGroup} style={{ margin: "0px" }}>
                                    <label className={stylesCrear.formLabel} style={{ margin: "0px" }}>Estado</label>
                                    <select name="estado" required defaultValue="1" style={{ margin: "0px" }}>
                                        <option value="1">Activa</option>
                                        <option value="0">Inactiva</option>
                                        <option value="2">En Reparación</option>
                                    </select>
                                </div>
                                <div className={stylesCrear['modal-botones-derecha']}>
                                    <button type="button" onClick={cerrarModal} className={stylesCrear['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesCrear['btn-confirmar']}>Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Detalles / Edición */}
                {mostrarModalDetalles && maquinariaSeleccionada && (
                    <div className={modoEdicion ? stylesEditar['modal-fondo'] : stylesDetalles['modal-fondo']} onClick={handleCloseModal}>
                        <div className={modoEdicion ? stylesEditar['modal-contenido'] : stylesDetalles['modal-contenido']} onClick={(e) => e.stopPropagation()}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px' }}>
                                    {modoEdicion ? "Editar Maquinaria" : "Detalles de Maquinaria"}
                                </h3>
                                <div className={modoEdicion ? stylesEditar.separator : stylesDetalles.separator}></div>
                            </div>

                            {modoEdicion ? (
                                <form onSubmit={handleEditar} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
                                    {/* ... Formulario Edición (Mismo código que antes, lo simplifico aquí para brevedad si no cambia, pero debo devolverlo completo si replace borra todo el bloque form) ... */}
                                    {/* Espera, el usuario NO pidió cambiar el modo edición, solo la vista de detalles. */}
                                    {/* Voy a mantener el modo edición intacto y solo cambiar el bloque 'else' del modo lectura */}
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Código</label>
                                        <input name="codigo" defaultValue={maquinariaSeleccionada.codigo} required readOnly style={{ margin: "0px", backgroundColor: "#f3f4f6" }} />
                                    </div>
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Nombre</label>
                                        <input name="nombre" defaultValue={maquinariaSeleccionada.nombre} placeholder="Nombre" required />
                                    </div>
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Modelo</label>
                                        <input name="modelo" defaultValue={maquinariaSeleccionada.modelo} placeholder="Modelo" />
                                    </div>
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Año</label>
                                        <input name="anio" defaultValue={maquinariaSeleccionada.anio} placeholder="Año" />
                                    </div>
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Ubicación</label>
                                        <input name="ubicacion" defaultValue={maquinariaSeleccionada.ubicacion} placeholder="Ubicación" />
                                    </div>
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Fecha Adquisición</label>
                                        <input type="date" name="fecha_adquisicion" defaultValue={maquinariaSeleccionada.fecha_adquisicion} />
                                    </div>
                                    <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                        <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Estado</label>
                                        <select style={{ margin: "0px" }} name="estado" defaultValue={maquinariaSeleccionada.estado} required>
                                            <option value="1">Activa</option>
                                            <option value="0">Inactiva</option>
                                            <option value="2">En Reparación</option>
                                        </select>
                                    </div>

                                    <div className={stylesEditar['modal-botones-derecha']}>
                                        <button type="button" onClick={() => setModoEdicion(false)} className={stylesEditar['btn-gris']}>Cancelar</button>
                                        <button type="submit" className={stylesEditar['btn-confirmar']} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <i className="fa-solid fa-floppy-disk"></i> Actualizar
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={stylesDetalles['detalles-usuario']}>
                                    {/* Tabs Navigation */}
                                    <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '15px' }}>
                                        <button
                                            onClick={() => setActiveTab('info')}
                                            style={{
                                                padding: '10px 15px',
                                                border: 'none',
                                                background: 'transparent',
                                                borderBottom: activeTab === 'info' ? '2px solid #2E4F6E' : 'none',
                                                fontWeight: activeTab === 'info' ? 'bold' : 'normal',
                                                color: activeTab === 'info' ? '#2E4F6E' : '#666',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Información
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('mantenimientos')}
                                            style={{
                                                padding: '10px 15px',
                                                border: 'none',
                                                background: 'transparent',
                                                borderBottom: activeTab === 'mantenimientos' ? '2px solid #2E4F6E' : 'none',
                                                fontWeight: activeTab === 'mantenimientos' ? 'bold' : 'normal',
                                                color: activeTab === 'mantenimientos' ? '#2E4F6E' : '#666',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Historial Mantenimiento
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('reportes')}
                                            style={{
                                                padding: '10px 15px',
                                                border: 'none',
                                                background: 'transparent',
                                                borderBottom: activeTab === 'reportes' ? '2px solid #2E4F6E' : 'none',
                                                fontWeight: activeTab === 'reportes' ? 'bold' : 'normal',
                                                color: activeTab === 'reportes' ? '#2E4F6E' : '#666',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Reportes de Fallas
                                        </button>
                                    </div>

                                    {/* Tab Content: Info */}
                                    {activeTab === 'info' && (
                                        <>
                                            <p><strong>Código:</strong> {maquinariaSeleccionada.codigo}</p>
                                            <p><strong>Nombre:</strong> {maquinariaSeleccionada.nombre}</p>
                                            <p><strong>Modelo:</strong> {maquinariaSeleccionada.modelo || "-"}</p>
                                            <p><strong>Año:</strong> {maquinariaSeleccionada.anio || "-"}</p>
                                            <p><strong>Ubicación:</strong> {maquinariaSeleccionada.ubicacion || "-"}</p>
                                            <p><strong>Fecha Adq.:</strong> {formatearFecha(maquinariaSeleccionada.fecha_adquisicion)}</p>
                                            <p><strong>Estado:</strong> {getEstadoBadge(maquinariaSeleccionada.estado).texto}</p>
                                        </>
                                    )}


                                    {/* Tab Content: Mantenimientos */}
                                    {activeTab === 'mantenimientos' && (
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {historialMantenimiento.length === 0 ? (
                                                <p style={{ color: '#888', fontStyle: 'italic' }}>No hay mantenimientos registrados.</p>
                                            ) : (
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {historialMantenimiento.map(m => (
                                                        <li
                                                            key={m.id}
                                                            style={{
                                                                borderBottom: '1px solid #eee',
                                                                padding: '10px',
                                                                cursor: 'pointer',
                                                                backgroundColor: expandedItemId === m.id ? '#f9fafb' : 'transparent',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onClick={() => toggleExpand(m.id)}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <div>
                                                                    <strong>{m.tipo}</strong>
                                                                    <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '10px' }}>
                                                                        {new Date(m.fecha_programada).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <span style={{
                                                                    fontSize: '0.8em',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '4px',
                                                                    background: m.estado === 'Completado' ? '#dcfce7' : '#fef9c3',
                                                                    color: m.estado === 'Completado' ? '#166534' : '#854d0e'
                                                                }}>
                                                                    {m.estado}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                                <p style={{ margin: '0', fontSize: '0.9em', color: '#374151' }}>{m.descripcion}</p>
                                                                <i className={`fa-solid fa-chevron-${expandedItemId === m.id ? 'up' : 'down'}`} style={{ fontSize: '0.8em', color: '#9ca3af' }}></i>
                                                            </div>

                                                            {expandedItemId === m.id && (
                                                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb', fontSize: '0.9em', color: '#4b5563' }}>
                                                                    <p style={{ margin: '4px 0' }}><strong>Prioridad:</strong> {m.prioridad}</p>
                                                                    <p style={{ margin: '4px 0' }}><strong>Responsable:</strong> {m.responsable_nombre || "No asignado"}</p>
                                                                    {m.observaciones && <p style={{ margin: '4px 0' }}><strong>Observaciones:</strong> {m.observaciones}</p>}
                                                                    {m.tiempo_real && <p style={{ margin: '4px 0' }}><strong>Tiempo Real:</strong> {m.tiempo_real} hs</p>}
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab Content: Reportes */}
                                    {activeTab === 'reportes' && (
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {historialReportes.length === 0 ? (
                                                <p style={{ color: '#888', fontStyle: 'italic' }}>No hay reportes de fallas.</p>
                                            ) : (
                                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                                    {historialReportes.map(r => (
                                                        <li
                                                            key={r.id}
                                                            style={{
                                                                borderBottom: '1px solid #eee',
                                                                padding: '10px',
                                                                cursor: 'pointer',
                                                                backgroundColor: expandedItemId === r.id ? '#f9fafb' : 'transparent',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onClick={() => toggleExpand(r.id)}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <strong style={{ color: r.criticidad === 'Alta' ? '#ef4444' : '#374151' }}>
                                                                    {r.criticidad} - {new Date(r.fecha_reporte).toLocaleDateString()}
                                                                </strong>
                                                                <span style={{ fontSize: '0.8em', color: '#666' }}>{r.estado_reporte}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                                                <p style={{ margin: '0', fontSize: '0.9em', color: '#374151' }}>{r.descripcion_falla}</p>
                                                                <i className={`fa-solid fa-chevron-${expandedItemId === r.id ? 'up' : 'down'}`} style={{ fontSize: '0.8em', color: '#9ca3af' }}></i>
                                                            </div>

                                                            {expandedItemId === r.id && (
                                                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e5e7eb', fontSize: '0.9em', color: '#4b5563' }}>
                                                                    <p style={{ margin: '4px 0' }}><strong>Reportado por:</strong> {r.reportador_nombre}</p>
                                                                    {r.ubicacion_especifica && <p style={{ margin: '4px 0' }}><strong>Ubicación Específica:</strong> {r.ubicacion_especifica}</p>}
                                                                    {r.puede_operar && <p style={{ margin: '4px 0' }}><strong>¿Puede Operar?:</strong> {r.puede_operar}</p>}
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    <div className={stylesDetalles['modal-botones-derecha']} style={{ marginTop: '20px' }}>
                                        <button onClick={handleCloseModal} className={stylesDetalles['btn-gris']}>Cerrar</button>
                                        {activeTab === 'info' && (
                                            <button
                                                onClick={() => setModoEdicion(true)}
                                                className={stylesDetalles['btn-editar']}
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i> Editar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
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
                            <p>¿Deseas dar de baja esta maquinaria? Esta acción cambiará su estado a "Inactiva".</p>
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

export default Maquinarias;
