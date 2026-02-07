import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "../assets/styles/Maquinaria.module.css";
import stylesCrear from "../assets/styles/Maquinaria.crear.modal.module.css";
import stylesDetalles from "../assets/styles/Maquinaria.detalles.modal.module.css";
import stylesEditar from "../assets/styles/Maquinaria.editar.modal.module.css";
import Head from "../components/Head";
import Table from "../components/Table";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Maquinarias = () => {
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
            cerrarModalDetalles();
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
            <Head />
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
                    <div className={modoEdicion ? stylesEditar['modal-fondo'] : stylesDetalles['modal-fondo']} onClick={cerrarModalDetalles}>
                        <div className={modoEdicion ? stylesEditar['modal-contenido'] : stylesDetalles['modal-contenido']} onClick={(e) => e.stopPropagation()}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px' }}>
                                    {modoEdicion ? "Editar Maquinaria" : "Detalles de Maquinaria"}
                                </h3>
                                <div className={modoEdicion ? stylesEditar.separator : stylesDetalles.separator}></div>
                            </div>

                            {modoEdicion ? (
                                <form onSubmit={handleEditar} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
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
                                    <p><strong>Código:</strong> {maquinariaSeleccionada.codigo}</p>
                                    <p><strong>Nombre:</strong> {maquinariaSeleccionada.nombre}</p>
                                    <p><strong>Modelo:</strong> {maquinariaSeleccionada.modelo || "-"}</p>
                                    <p><strong>Año:</strong> {maquinariaSeleccionada.anio || "-"}</p>
                                    <p><strong>Ubicación:</strong> {maquinariaSeleccionada.ubicacion || "-"}</p>
                                    <p><strong>Fecha Adq.:</strong> {formatearFecha(maquinariaSeleccionada.fecha_adquisicion)}</p>
                                    <p><strong>Estado:</strong> {getEstadoBadge(maquinariaSeleccionada.estado).texto}</p>
                                    
                                    <div className={stylesDetalles['modal-botones-derecha']}>
                                        <button onClick={cerrarModalDetalles} className={stylesDetalles['btn-gris']}>Cerrar</button>
                                        <button 
                                            onClick={() => setModoEdicion(true)}
                                            className={stylesDetalles['btn-editar']}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i> Editar
                                        </button>
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
