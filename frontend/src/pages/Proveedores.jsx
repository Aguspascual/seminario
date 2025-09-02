import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/Proveedores.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Proveedores = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [tiposProveedor, setTiposProveedor] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);

    // Función para obtener proveedores de la API
    const obtenerProveedores = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/proveedores", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProveedores(data);
            } else {
                setError("Error al cargar los proveedores");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener tipos de proveedor
    const obtenerTiposProveedor = async () => {
        try {
            const response = await fetch("http://localhost:5000/tipos-proveedor", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTiposProveedor(data);
            }
        } catch (error) {
            console.error("Error al obtener tipos:", error);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        obtenerProveedores();
        obtenerTiposProveedor();
    }, []);

    // Función para agregar proveedor
    const manejarEnvio = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch("http://localhost:5000/proveedores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Nombre: formData.get("nombre"),
                    Numero: parseInt(formData.get("numero")),
                    Email: formData.get("email"),
                    idTipo: parseInt(formData.get("tipo"))
                }),
            });

            if (response.ok) {
                cerrarModal();
                obtenerProveedores(); // Recargar la lista
                e.target.reset(); // Limpiar el formulario
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Error al agregar el proveedor");
            }
        } catch (error) {
            setError("Error de conexión con el servidor");
            console.error("Error:", error);
        }
    };

    // Filtrar proveedores por búsqueda
    const proveedoresFiltrados = proveedores.filter(
        (proveedor) =>
            proveedor.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            proveedor.Email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestion de Proveedores</h6>
                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestion de Proveedores</h2>
                            <button className={styles.btn} onClick={abrirModal}>
                                <i className="fa-solid fa-user-plus"></i>
                            </button>
                        </div>
                        <input 
                            type="text" 
                            placeholder='Buscar Proveedor' 
                            className={styles.buscarUsuario}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>Agregar Proveedor</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input 
                                        type="text" 
                                        name="nombre"
                                        placeholder="Nombre de la empresa" 
                                        required 
                                    />
                                    <input 
                                        type="number" 
                                        name="numero"
                                        placeholder="Número de proveedor" 
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
                                                {tipo.Nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar}>
                                            Agregar
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={cerrarModal} 
                                            className={styles.btnCancelar}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Tabla de proveedores */}
                    <table className={styles.cabecera}>
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th className={styles.tipo}>Tipo</th>
                                <th className={styles.numero}>Número</th>
                                <th className={styles.correo}>Correo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                    </table>
                    
                    <table className={styles.datos}>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                        Cargando proveedores...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "red" }}>
                                        {error}
                                    </td>
                                </tr>
                            ) : proveedoresFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            ) : (
                                proveedoresFiltrados.map((proveedor, index) => (
                                    <tr key={proveedor.idProveedor || index}>
                                        <td>{proveedor.Nombre}</td>
                                        <td>{proveedor.tipo_proveedor || "Sin tipo"}</td>
                                        <td className={styles.numero}>{proveedor.Numero}</td>
                                        <td className={styles.correo}>{proveedor.Email}</td>
                                        <td>
                                            <span style={{ 
                                                color: proveedor.Estado ? "green" : "red",
                                                fontWeight: "bold"
                                            }}>
                                                {proveedor.Estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td>
                                            <i className="fa-solid fa-eye" style={{ cursor: "pointer" }}></i>
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

export default Proveedores;