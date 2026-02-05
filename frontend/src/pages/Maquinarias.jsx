import React, { useState, useEffect } from "react";
import "../assets/styles/Usuarios.css"; // Reutilizar estilos existentes
import Head from "../components/Head";
import Footer from "../components/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Maquinarias = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [maquinariaSeleccionada, setMaquinariaSeleccionada] = useState(null);
    const [maquinarias, setMaquinarias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [mensaje, setMensaje] = useState({ tipo: "", texto: "" });

    // Obtener token del localStorage
    const getToken = () => localStorage.getItem("token");

    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => {
        setMostrarModal(false);
        setError("");
    };

    const abrirModalEditar = (maquinaria) => {
        setMaquinariaSeleccionada(maquinaria);
        setMostrarModalEditar(true);
    };

    const cerrarModalEditar = () => {
        setMaquinariaSeleccionada(null);
        setMostrarModalEditar(false);
        setError("");
    };

    const abrirModalEliminar = (maquinaria) => {
        setMaquinariaSeleccionada(maquinaria);
        setMostrarModalEliminar(true);
    };

    const cerrarModalEliminar = () => {
        setMaquinariaSeleccionada(null);
        setMostrarModalEliminar(false);
    };

    // Mostrar mensaje temporal
    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto });
        setTimeout(() => setMensaje({ tipo: "", texto: "" }), 5000);
    };

    // Función para obtener maquinarias de la API
    const obtenerMaquinarias = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/maquinarias/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMaquinarias(data.maquinarias || []);
            } else {
                setError("Error al cargar las maquinarias");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar maquinarias al montar el componente
    useEffect(() => {
        obtenerMaquinarias();
    }, []);

    // Función para agregar maquinaria
    const manejarEnvio = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const datosEnvio = {
            codigo: formData.get("codigo"),
            nombre: formData.get("nombre"),
            modelo: formData.get("modelo") || null,
            anio: formData.get("anio") || null,
            ubicacion: formData.get("ubicacion") || null,
            fecha_adquisicion: formData.get("fecha_adquisicion") || null,
            estado: parseInt(formData.get("estado")),
        };

        try {
            const response = await fetch("http://localhost:5000/maquinarias/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(datosEnvio),
            });

            const data = await response.json();

            if (response.ok) {
                cerrarModal();
                obtenerMaquinarias();
                mostrarMensaje("success", "Maquinaria creada exitosamente");
            } else {
                setError(data.message || "Error al agregar la maquinaria");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    // Función para editar maquinaria
    const manejarEdicion = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const datosEnvio = {
            codigo: formData.get("codigo"),
            nombre: formData.get("nombre"),
            modelo: formData.get("modelo") || null,
            anio: formData.get("anio") || null,
            ubicacion: formData.get("ubicacion") || null,
            fecha_adquisicion: formData.get("fecha_adquisicion") || null,
            estado: parseInt(formData.get("estado")),
        };

        try {
            const response = await fetch(
                `http://localhost:5000/maquinarias/${maquinariaSeleccionada.id_maquinaria}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify(datosEnvio),
                }
            );

            const data = await response.json();

            if (response.ok) {
                cerrarModalEditar();
                obtenerMaquinarias();
                mostrarMensaje("success", "Maquinaria actualizada exitosamente");
            } else {
                setError(data.message || "Error al actualizar la maquinaria");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    // Función para eliminar maquinaria
    const confirmarEliminacion = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/maquinarias/${maquinariaSeleccionada.id_maquinaria}`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getToken()}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                cerrarModalEliminar();
                obtenerMaquinarias();
                mostrarMensaje("success", "Maquinaria dada de baja exitosamente");
            } else {
                setError(data.message || "Error al eliminar la maquinaria");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    // Filtrar maquinarias por búsqueda
    const maquinariasFiltradas = maquinarias.filter(
        (maquinaria) =>
            maquinaria.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
            maquinaria.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            maquinaria.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Helpers para formatear datos
    const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-AR");
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            0: { texto: "Inactiva", clase: "badge-inactivo" },
            1: { texto: "Activa", clase: "badge-activo" },
            2: { texto: "En Reparación", clase: "badge-reparacion" },
        };
        return estados[estado] || { texto: "Desconocido", clase: "" };
    };

    return (
        <div className="container">
            <Head />
            <div className="main">
                <h6>Home &gt; Planta &gt; Gestión de Maquinaria</h6>

                {/* Mensaje de notificación */}
                {mensaje.texto && (
                    <div className={`mensaje-notificacion ${mensaje.tipo === 'success' ? 'success' : 'error'}`}>
                        {mensaje.texto}
                    </div>
                )}

                <div className="tabla">
                    <div className="superior">
                        <div className="sub-titulo">
                            <h2>Gestión de Maquinaria</h2>
                            <button className="btn" onClick={abrirModal}>
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por código, nombre o ubicación"
                            className="buscar-usuario"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Modal Crear */}
                    {mostrarModal && (
                        <div className="modal-fondo" onClick={cerrarModal}>
                            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                                <h3>Nueva Maquinaria</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input
                                        type="text"
                                        name="codigo"
                                        placeholder="Código* (ej: MAQ-001)"
                                        required
                                        maxLength={50}
                                    />
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombre*"
                                        required
                                        maxLength={100}
                                    />
                                    <input
                                        type="text"
                                        name="modelo"
                                        placeholder="Modelo (opcional)"
                                        maxLength={100}
                                    />
                                    <input
                                        type="text"
                                        name="anio"
                                        placeholder="Año (4 dígitos)"
                                        maxLength={4}
                                        pattern="\d{4}"
                                    />
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        placeholder="Ubicación (ej: Planta A - Sector 1)"
                                        maxLength={200}
                                    />
                                    <input
                                        type="date"
                                        name="fecha_adquisicion"
                                        placeholder="Fecha de Adquisición"
                                    />
                                    <select name="estado" required defaultValue="1">
                                        <option value="1">Activa</option>
                                        <option value="0">Inactiva</option>
                                        <option value="2">En Reparación</option>
                                    </select>
                                    {error && <p style={{ color: "red" }}>{error}</p>}
                                    <div className="modal-botones">
                                        <button type="submit" className="btn-confirmar">
                                            Guardar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cerrarModal}
                                            className="btn-cancelar"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal Editar */}
                    {mostrarModalEditar && maquinariaSeleccionada && (
                        <div className="modal-fondo" onClick={cerrarModalEditar}>
                            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                                <h3>Editar Maquinaria</h3>
                                <form onSubmit={manejarEdicion}>
                                    <input
                                        type="text"
                                        name="codigo"
                                        placeholder="Código*"
                                        defaultValue={maquinariaSeleccionada.codigo}
                                        required
                                        maxLength={50}
                                        readOnly
                                        style={{ backgroundColor: "#f0f0f0" }}
                                    />
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombre*"
                                        defaultValue={maquinariaSeleccionada.nombre}
                                        required
                                        maxLength={100}
                                    />
                                    <input
                                        type="text"
                                        name="modelo"
                                        placeholder="Modelo (opcional)"
                                        defaultValue={maquinariaSeleccionada.modelo || ""}
                                        maxLength={100}
                                    />
                                    <input
                                        type="text"
                                        name="anio"
                                        placeholder="Año"
                                        defaultValue={maquinariaSeleccionada.anio || ""}
                                        maxLength={4}
                                        pattern="\d{4}"
                                    />
                                    <input
                                        type="text"
                                        name="ubicacion"
                                        placeholder="Ubicación"
                                        defaultValue={maquinariaSeleccionada.ubicacion || ""}
                                        maxLength={200}
                                    />
                                    <input
                                        type="date"
                                        name="fecha_adquisicion"
                                        defaultValue={maquinariaSeleccionada.fecha_adquisicion || ""}
                                    />
                                    <select name="estado" required defaultValue={maquinariaSeleccionada.estado}>
                                        <option value="1">Activa</option>
                                        <option value="0">Inactiva</option>
                                        <option value="2">En Reparación</option>
                                    </select>
                                    {error && <p style={{ color: "red" }}>{error}</p>}
                                    <div className="modal-botones">
                                        <button type="submit" className="btn-confirmar">
                                            Actualizar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cerrarModalEditar}
                                            className="btn-cancelar"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal Eliminar */}
                    {mostrarModalEliminar && maquinariaSeleccionada && (
                        <div className="modal-fondo" onClick={cerrarModalEliminar}>
                            <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
                                <h3>Confirmar Baja de Maquinaria</h3>
                                <p style={{ marginBottom: "20px" }}>
                                    ¿Está seguro que desea dar de baja la maquinaria <strong>{maquinariaSeleccionada.codigo} - {maquinariaSeleccionada.nombre}</strong>?
                                </p>
                                <p style={{ fontSize: "0.9em", color: "#666" }}>
                                    Esta acción marcará la maquinaria como inactiva.
                                </p>
                                <div className="modal-botones" style={{ marginTop: "20px" }}>
                                    <button onClick={confirmarEliminacion} className="btn-confirmar">
                                        Confirmar
                                    </button>
                                    <button onClick={cerrarModalEliminar} className="btn-cancelar">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabla de maquinarias */}
                    <table className="tabla">
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
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                        Cargando maquinarias...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        style={{ textAlign: "center", padding: "20px", color: "red" }}
                                    >
                                        {error}
                                    </td>
                                </tr>
                            ) : maquinariasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                                        No se encontraron maquinarias
                                    </td>
                                </tr>
                            ) : (
                                maquinariasFiltradas.map((maquinaria, index) => {
                                    const estadoBadge = getEstadoBadge(maquinaria.estado);
                                    return (
                                        <tr key={maquinaria.id_maquinaria || index}>
                                            <td><strong>{maquinaria.codigo}</strong></td>
                                            <td>{maquinaria.nombre}</td>
                                            <td>{maquinaria.modelo || "N/A"}</td>
                                            <td>{maquinaria.anio || "N/A"}</td>
                                            <td>{maquinaria.ubicacion || "N/A"}</td>
                                            <td>{formatearFecha(maquinaria.fecha_adquisicion)}</td>
                                            <td>
                                                <span className={`badge ${estadoBadge.clase}`}>
                                                    {estadoBadge.texto}
                                                </span>
                                            </td>
                                            <td>
                                                <i
                                                    className="fa-solid fa-pen-to-square"
                                                    style={{ cursor: "pointer", marginRight: "10px", color: "#4CAF50" }}
                                                    onClick={() => abrirModalEditar(maquinaria)}
                                                    title="Editar"
                                                ></i>
                                                <i
                                                    className="fa-solid fa-trash"
                                                    style={{ cursor: "pointer", color: "#f44336" }}
                                                    onClick={() => abrirModalEliminar(maquinaria)}
                                                    title="Dar de baja"
                                                ></i>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />

            <style jsx>{`
        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 500;
        }
        .badge-activo {
          background-color: #4CAF50;
          color: white;
        }
        .badge-inactivo {
          background-color: #9E9E9E;
          color: white;
        }
        .badge-reparacion {
          background-color: #FF9800;
          color: white;
        }
        .mensaje-notificacion {
          padding: 12px 20px;
          margin-bottom: 15px;
          border-radius: 4px;
          font-weight: 500;
        }
        .mensaje-notificacion.success {
          background-color: #4CAF50;
          color: white;
        }
        .mensaje-notificacion.error {
          background-color: #f44336;
          color: white;
        }
      `}</style>
        </div>
    );
};

export default Maquinarias;
