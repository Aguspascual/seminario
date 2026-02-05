import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../assets/styles/Capacitaciones.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Capacitaciones = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [formError, setFormError] = useState("");
    const queryClient = useQueryClient();

    // 1. Fetching de Capacitaciones
    const { data: capacitaciones = [], isLoading, isError, error } = useQuery({
        queryKey: ['capacitaciones'],
        queryFn: async () => {
             const response = await fetch("http://localhost:5000/capacitaciones");
             if (!response.ok) throw new Error("Error al cargar capacitaciones");
             return response.json();
        }
    });

    // 2. Mutation para Crear
    const crearMutation = useMutation({
        mutationFn: async (nuevaCapacitacion) => {
            const response = await fetch("http://localhost:5000/capacitaciones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaCapacitacion)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear capacitacion");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['capacitaciones']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 3. Mutation para Eliminar
    const eliminarMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/capacitaciones/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Error al eliminar capacitacion");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['capacitaciones']);
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const abrirModal = () => {
        setFormError("");
        setMostrarModal(true);
    };
    const cerrarModal = () => setMostrarModal(false);

    const manejarEnvio = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            nombre: formData.get('nombre'),
            profesional: formData.get('profesional'),
            fecha: formData.get('fecha'),
            descripcion: formData.get('descripcion')
        };
        crearMutation.mutate(data);
    };

    const manejarEliminar = (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta capacitación?")) {
            eliminarMutation.mutate(id);
        }
    };

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestion de Capacitaciones</h6>
                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestion de Capacitaciones</h2>
                            <button className={styles.btn} onClick={abrirModal}>
                                <i className="fa-solid fa-circle-plus"></i>
                            </button>
                        </div>
                        <input type="text" placeholder='Buscar Capacitacion' className={styles.buscarUsuario} />
                    </div>

                    {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>Agregar Capacitacion</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input type="text" name="nombre" placeholder="Nombre" required />
                                    <input type="text" name="profesional" placeholder="Profesional" required />
                                    <input type="date" name="fecha" placeholder="Fecha" required />
                                    <input type="text" name="descripcion" placeholder="Descripcion" required />
                                    
                                    {formError && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '10px' }}>{formError}</p>}
                                    
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar} disabled={crearMutation.isPending}>
                                            {crearMutation.isPending ? 'Guardando...' : 'Agregar'}
                                        </button>
                                        <button type="button" onClick={cerrarModal} className={styles.btnCancelar}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <table className={styles.cabecera}>
                        <thead>
                            <tr>
                                <th className={styles.id}>ID</th>
                                <th className={styles.tipo}>Fecha</th>
                                <th className={styles.profesional}>Profesional</th>
                                <th className={styles.nombre}>Descripcion</th>
                                <th className={styles.accion}>Acciones</th>
                            </tr>
                        </thead>
                    </table>
                    <div className={styles.datos} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="5" style={{ padding: '20px' }}>Cargando...</td></tr>
                                ) : isError ? (
                                    <tr><td colSpan="5" style={{ padding: '20px', color: 'red' }}>Error: {error.message}</td></tr>
                                ) : capacitaciones.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '20px' }}>No hay capacitaciones registradas.</td></tr>
                                ) : (
                                    capacitaciones.map((cap) => (
                                        <tr key={cap.id} style={{ height: '40px', borderBottom: '1px solid #ddd' }}>
                                            <td className={styles.id}>{cap.id}</td>
                                            <td className={styles.tipo}>{cap.fecha}</td>
                                            <td className={styles.profesional}>{cap.profesional}</td>
                                            <td className={styles.nombre}>{cap.descripcion}</td>
                                            <td className={styles.accion}>
                                                <i 
                                                    className="fa-solid fa-trash" 
                                                    style={{ cursor: 'pointer', color: '#f44336' }}
                                                    onClick={() => manejarEliminar(cap.id)}
                                                    title="Eliminar"
                                                ></i>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Capacitaciones;