import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "../assets/styles/Maquinaria.module.css";
import Head from "../components/Head";
import Footer from "../components/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Maquinarias = () => {
    const queryClient = useQueryClient();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [maquinariaSeleccionada, setMaquinariaSeleccionada] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

    // Obtener token
    const getToken = () => localStorage.getItem("token");

    // Fetch Maquinarias
    const { data: maquinarias = [], isLoading: loading, isError: error } = useQuery({
        queryKey: ["maquinarias"],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/maquinarias/", {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error("Error al cargar maquinarias");
            const data = await response.json();
            return data.maquinarias || [];
        },
    });

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
            cerrarModalEditar();
            mostrarMensaje("success", "Maquinaria actualizada exitosamente");
        },
        onError: (err) => mostrarMensaje("error", err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(
                `http://localhost:5000/maquinarias/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${getToken()}` },
                }
            );
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

    // Handlers
    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
    };

    const manejarEnvio = (e) => {
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

    const manejarEdicion = (e) => {
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

    // Modals
    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);
    const abrirModalEditar = (m) => { setMaquinariaSeleccionada(m); setMostrarModalEditar(true); };
    const cerrarModalEditar = () => { setMaquinariaSeleccionada(null); setMostrarModalEditar(false); };
    const abrirModalEliminar = (m) => { setMaquinariaSeleccionada(m); setMostrarModalEliminar(true); };
    const cerrarModalEliminar = () => { setMaquinariaSeleccionada(null); setMostrarModalEliminar(false); };

    // Filter
    const maquinariasFiltradas = maquinarias.filter(
        (m) =>
            m.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            m.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-AR") : "N/A";

    const getEstadoBadge = (estado) => {
        const map = { 0: styles.badgeInactivo, 1: styles.badgeActivo, 2: styles.badgeReparacion };
        const text = { 0: "Inactiva", 1: "Activa", 2: "En Reparación" };
        return { clase: map[estado] || "", texto: text[estado] || "Desconocido" };
    };

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestión de Maquinaria</h6>

                {mensaje.texto && (
                    <div className={`${styles.mensajeNotificacion} ${mensaje.tipo === 'success' ? styles.success : styles.error}`}>
                        {mensaje.texto}
                    </div>
                )}

                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestión de Maquinaria</h2>
                            <button className={styles.btn} onClick={abrirModal}>
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por código, nombre o ubicación"
                            className={styles.buscarMaquinaria}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Modal Crear */}
                    {mostrarModal && (
                        <div className={styles.modalFondo} onClick={cerrarModal}>
                            <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
                                <h3>Nueva Maquinaria</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input name="codigo" placeholder="Código* (ej: MAQ-001)" required maxLength={50} />
                                    <input name="nombre" placeholder="Nombre*" required maxLength={100} />
                                    <input name="modelo" placeholder="Modelo" maxLength={100} />
                                    <input name="anio" placeholder="Año" maxLength={4} pattern="\d{4}" />
                                    <input name="ubicacion" placeholder="Ubicación" maxLength={200} />
                                    <input type="date" name="fecha_adquisicion" />
                                    <select name="estado" required defaultValue="1">
                                        <option value="1">Activa</option>
                                        <option value="0">Inactiva</option>
                                        <option value="2">En Reparación</option>
                                    </select>
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar}>Guardar</button>
                                        <button type="button" onClick={cerrarModal} className={styles.btnCancelar}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal Editar */}
                    {mostrarModalEditar && maquinariaSeleccionada && (
                        <div className={styles.modalFondo} onClick={cerrarModalEditar}>
                            <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
                                <h3>Editar Maquinaria</h3>
                                <form onSubmit={manejarEdicion}>
                                    <input name="codigo" defaultValue={maquinariaSeleccionada.codigo} required readOnly style={{ backgroundColor: "#e0e0e0" }} />
                                    <input name="nombre" defaultValue={maquinariaSeleccionada.nombre} required />
                                    <input name="modelo" defaultValue={maquinariaSeleccionada.modelo} />
                                    <input name="anio" defaultValue={maquinariaSeleccionada.anio} />
                                    <input name="ubicacion" defaultValue={maquinariaSeleccionada.ubicacion} />
                                    <input type="date" name="fecha_adquisicion" defaultValue={maquinariaSeleccionada.fecha_adquisicion} />
                                    <select name="estado" defaultValue={maquinariaSeleccionada.estado} required>
                                        <option value="1">Activa</option>
                                        <option value="0">Inactiva</option>
                                        <option value="2">En Reparación</option>
                                    </select>
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar}>Actualizar</button>
                                        <button type="button" onClick={cerrarModalEditar} className={styles.btnCancelar}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal Eliminar */}
                    {mostrarModalEliminar && maquinariaSeleccionada && (
                        <div className={styles.modalFondo} onClick={cerrarModalEliminar}>
                            <div className={styles.modalContenido} onClick={(e) => e.stopPropagation()}>
                                <h3>Confirmar Baja</h3>
                                <p>¿Desea dar de baja <strong>{maquinariaSeleccionada.codigo}</strong>?</p>
                                <div className={styles.modalBotones}>
                                    <button onClick={() => deleteMutation.mutate(maquinariaSeleccionada.id_maquinaria)} className={styles.btnConfirmar}>Confirmar</button>
                                    <button onClick={cerrarModalEliminar} className={styles.btnCancelar}>Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <table className={styles.tablaDatos}>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Modelo</th>
                                <th>Año</th>
                                <th>Ubicación</th>
                                <th>Fecha Adq.</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className={styles.loading}>Cargando...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="8" className={styles.error}>Error al cargar datos</td></tr>
                            ) : maquinariasFiltradas.length === 0 ? (
                                <tr><td colSpan="8" className={styles.empty}>No hay registros</td></tr>
                            ) : (
                                maquinariasFiltradas.map((m) => (
                                    <tr key={m.id_maquinaria}>
                                        <td className={styles.codigo}><strong>{m.codigo}</strong></td>
                                        <td>{m.nombre}</td>
                                        <td>{m.modelo || "-"}</td>
                                        <td>{m.anio || "-"}</td>
                                        <td>{m.ubicacion || "-"}</td>
                                        <td>{formatearFecha(m.fecha_adquisicion)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${getEstadoBadge(m.estado).clase}`}>
                                                {getEstadoBadge(m.estado).texto}
                                            </span>
                                        </td>
                                        <td>
                                            <button className={styles.btnAction} onClick={() => abrirModalEditar(m)}>
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button className={styles.btnAction} onClick={() => abrirModalEliminar(m)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
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

export default Maquinarias;
