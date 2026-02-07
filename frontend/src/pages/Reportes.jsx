import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../assets/styles/Usuarios.css';
import Head from '../components/Head';

import '@fortawesome/fontawesome-free/css/all.min.css';

const Reportes = ({ user }) => {
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
    const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
    const [formError, setFormError] = useState("");

    const queryClient = useQueryClient();

    // El usuario ahora viene por props, usamos 'user' en lugar de 'usuarioActual'
    const usuarioActual = user;

    // 2. Obtener Reportes
    const { data: reportes = [], isLoading: loadingReportes, isError: errorReportes } = useQuery({
        queryKey: ['reportes'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/reportes");
            if (!response.ok) throw new Error("Error al cargar reportes");
            return response.json();
        }
    });

    // 3. Crear Reporte Mutation
    const crearReporteMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await fetch("http://localhost:5000/reportes", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear reporte");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reportes']);
            setMostrarModalCrear(false);
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 4. Responder Reporte Mutation
    const responderReporteMutation = useMutation({
        mutationFn: async ({ id, respuesta, idUsuarioReceptor }) => {
            const response = await fetch(`http://localhost:5000/reportes/${id}/responder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    respuesta,
                    idUsuarioReceptor
                })
            });

            if (!response.ok) throw new Error("Error al guardar respuesta");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reportes']);
            setMostrarModalDetalles(false);
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const handleCrear = (e) => {
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        formData.append('idUsuarioEmisor', usuarioActual ? usuarioActual.id : 1);
        crearReporteMutation.mutate(formData);
    };

    const handleResponder = (e) => {
        e.preventDefault();
        const respuesta = e.target.respuesta.value;
        responderReporteMutation.mutate({
            id: reporteSeleccionado.id,
            respuesta,
            idUsuarioReceptor: usuarioActual ? usuarioActual.id : 2
        });
    };

    return (
        <div className="container">
            <Head user={user} />
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

                                    {formError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{formError}</p>}
                                    {crearReporteMutation.isError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{crearReporteMutation.error.message}</p>}

                                    <div className="modal-botones">
                                        <button type="submit" className="btn-confirmar" disabled={crearReporteMutation.isPending}>
                                            {crearReporteMutation.isPending ? 'Enviando...' : 'Enviar'}
                                        </button>
                                        <button type="button" onClick={() => setMostrarModalCrear(false)} className="btn-cancelar" disabled={crearReporteMutation.isPending}>
                                            Cancelar
                                        </button>
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
                                                    <button type="submit" className="btn-confirmar" disabled={responderReporteMutation.isPending}>
                                                        {responderReporteMutation.isPending ? 'Enviando...' : 'Responder'}
                                                    </button>
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
                            {loadingReportes ? (
                                <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Cargando reportes...</td></tr>
                            ) : errorReportes ? (
                                <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "red" }}>Error al cargar reportes</td></tr>
                            ) : reportes.map((reporte) => (
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
                            {!loadingReportes && reportes.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay reportes.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Reportes;
