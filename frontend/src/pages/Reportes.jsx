import React, { useState, useEffect } from 'react';
import '../assets/styles/Usuarios.css'; // Reusing some styles or create new ones
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Reportes = () => {
    const [reportes, setReportes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [usuarioActual, setUsuarioActual] = useState(null); // Simulado o decoded from token

    // Simular usuario logueado obteniendo el primero de la BD por ahora
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://localhost:5000/usuarios");
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        setUsuarioActual(data[0]); // Usar el primer usuario real
                        console.log("Usuario simulado:", data[0]);
                    } else {
                        console.warn("No hay usuarios en la BD para simular login");
                    }
                }
            } catch (error) {
                console.error("Error fetching users for simulation:", error);
            }
        };
        fetchUser();
    }, []);

    const obtenerReportes = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5000/reportes");
            if (response.ok) {
                const data = await response.json();
                setReportes(data);
            } else {
                setError("Error al cargar reportes");
            }
        } catch (error) {
            console.error(error);
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerReportes();
    }, []);

    const handleCrear = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        // Agregar ID usuario emisor
        formData.append('idUsuarioEmisor', usuarioActual ? usuarioActual.id : 1);

        try {
            const response = await fetch("http://localhost:5000/reportes", {
                method: "POST",
                body: formData // No setear Content-Type, fetch lo pone con boundary
            });

            if (response.ok) {
                setMostrarModalCrear(false);
                obtenerReportes();
            } else {
                const errorData = await response.json();
                alert(`Error al crear reporte: ${errorData.error || 'Desconocido'}`);
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    const handleResponder = async (e) => {
        e.preventDefault();
        const respuesta = e.target.respuesta.value;

        try {
            const response = await fetch(`http://localhost:5000/reportes/${reporteSeleccionado.id}/responder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    respuesta: respuesta,
                    idUsuarioReceptor: usuarioActual ? usuarioActual.id : 2 // Simular receptor ID 2
                })
            });

            if (response.ok) {
                setMostrarModalDetalles(false);
                obtenerReportes();
            } else {
                alert("Error al guardar respuesta");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    };

    return (
        <div className="container">
            <Head />
            <div className="main">
                <h6>Home &gt; Maquinaria &gt; Reportes</h6>
                <div className="tabla">
                    <div className="superior">
                        <div className="sub-titulo">
                            <h2>Gestión de Reportes</h2>
                            <button className="btn" onClick={() => setMostrarModalCrear(true)}>
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    {/* Modal Crear */}
                    {mostrarModalCrear && (
                        <div className="modal-fondo">
                            <div className="modal-contenido">
                                <h3>Nuevo Reporte</h3>
                                <form onSubmit={handleCrear}>
                                    <input type="text" name="asunto" placeholder="Asunto" required />
                                    <textarea name="descripcion" placeholder="Descripción" required rows="4" style={{ width: '100%', marginBottom: '10px' }}></textarea>
                                    <input type="file" name="archivo" />
                                    <div className="modal-botones">
                                        <button type="submit" className="btn-confirmar">Enviar</button>
                                        <button type="button" onClick={() => setMostrarModalCrear(false)} className="btn-cancelar">Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modal Detalles */}
                    {mostrarModalDetalles && reporteSeleccionado && (
                        <div className="modal-fondo">
                            <div className="modal-contenido" style={{ maxWidth: '600px' }}>
                                <h3>Detalle del Reporte</h3>
                                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                                    <p><strong>Fecha:</strong> {new Date(reporteSeleccionado.fechaCreacion).toLocaleString()}</p>
                                    <p><strong>Emisor:</strong> {reporteSeleccionado.nombreEmisor}</p>
                                    <p><strong>Asunto:</strong> {reporteSeleccionado.asunto}</p>
                                    <p><strong>Descripción:</strong> {reporteSeleccionado.descripcion}</p>
                                    {reporteSeleccionado.nombreArchivo && (
                                        <p><strong>Archivo:</strong> <a href={`/assets/reportes/${reporteSeleccionado.nombreArchivo}`} target="_blank" rel="noopener noreferrer">Ver Archivo</a></p>
                                    )}
                                    <hr />
                                    {reporteSeleccionado.respuesta ? (
                                        <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                                            <p><strong>Respuesta de {reporteSeleccionado.nombreReceptor}:</strong></p>
                                            <p>{reporteSeleccionado.respuesta}</p>
                                            <p><small>{new Date(reporteSeleccionado.fechaRespuesta).toLocaleString()}</small></p>
                                        </div>
                                    ) : (
                                        <div>
                                            <h4>Responder</h4>
                                            <form onSubmit={handleResponder}>
                                                <textarea name="respuesta" placeholder="Escribe tu respuesta..." required rows="3" style={{ width: '100%' }}></textarea>
                                                <div className="modal-botones">
                                                    <button type="submit" className="btn-confirmar">Responder</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-botones">
                                    <button type="button" onClick={() => setMostrarModalDetalles(false)} className="btn-cancelar">Cerrar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Asunto</th>
                                <th>Emisor</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportes.map((reporte) => (
                                <tr key={reporte.id}>
                                    <td>{new Date(reporte.fechaCreacion).toLocaleDateString()}</td>
                                    <td>{reporte.asunto}</td>
                                    <td>{reporte.nombreEmisor}</td>
                                    <td>{reporte.respuesta ? "Respondido" : "Pendiente"}</td>
                                    <td>
                                        <i
                                            className="fa-solid fa-eye"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                setReporteSeleccionado(reporte);
                                                setMostrarModalDetalles(true);
                                            }}
                                        ></i>
                                    </td>
                                </tr>
                            ))}
                            {reportes.length === 0 && (
                                <tr><td colSpan="5">No hay reportes.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Reportes;
