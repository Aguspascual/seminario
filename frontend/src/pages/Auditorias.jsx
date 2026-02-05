import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../assets/styles/Auditorias.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Auditorias = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [formError, setFormError] = useState("");
    const queryClient = useQueryClient();

    // 1. Fetching de Auditorias
    const { data: auditorias = [], isLoading, isError, error } = useQuery({
        queryKey: ['auditorias'],
        queryFn: async () => {
             const response = await fetch("http://localhost:5000/auditorias");
             if (!response.ok) throw new Error("Error al cargar auditorias");
             return response.json();
        }
    });

    // 2. Mutation para Crear (con archivo)
    const crearMutation = useMutation({
        mutationFn: async (formData) => {
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
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 3. Mutation para Eliminar
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
        // Validar que se haya subido archivo (opcional según lógica, pero el input tiene required)
        crearMutation.mutate(formData);
    };

    const manejarEliminar = (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta auditoría?")) {
            eliminarMutation.mutate(id);
        }
    };

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestion de Auditorias</h6>
                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestion de Auditorias</h2>
                            <button className={styles.btn} onClick={abrirModal}>
                                <i className="fa-solid fa-circle-plus"></i>
                            </button>
                        </div>
                        <input type="text" placeholder='Buscar Auditoria' className={styles.buscarAuditoria} />
                    </div>

                    {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>Agregar Auditoria</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input type="date" name="fecha" required />
                                    <input type="time" name="hora" required />
                                    <select name="estado" required>
                                        <option value="" hidden>Seleccione un Estado</option>
                                        <option value="Terminado">Terminado</option>
                                        <option value="Proceso">En Proceso</option>
                                        <option value="Programado">Programado</option>
                                    </select>
                                    <select name="lugar" required>
                                        <option value="" hidden>Seleccione un Lugar</option>
                                        <option value="Planta">Planta</option>
                                        <option value="Oficina">Oficina</option>
                                        <option value="Almacen">Almacén</option>
                                    </select>
                                    <input type="file" name="archivo" accept='application/pdf' required />
                                    
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
                                <th className={styles.estado}>Estado</th>
                                <th className={styles.area}>Lugar</th>
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
                                ) : auditorias.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '20px' }}>No hay auditorias registradas.</td></tr>
                                ) : (
                                    auditorias.map((aud) => (
                                        <tr key={aud.id} style={{ height: '40px', borderBottom: '1px solid #ddd' }}>
                                            <td className={styles.id}>{aud.id}</td>
                                            <td className={styles.tipo}>{aud.fecha}</td>
                                            <td className={styles.estado}>{aud.estado}</td>
                                            <td className={styles.area}>{aud.lugar}</td>
                                            <td className={styles.accion}>
                                                {aud.archivo_path && (
                                                     <a 
                                                        href={`/assets/auditorias/${aud.archivo_path}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className={styles.download}
                                                        style={{ display: 'inline-flex', marginRight: '5px', textDecoration: 'none' }}
                                                     >
                                                        <i className="fas fa-download"></i>
                                                     </a>
                                                )}
                                                <i 
                                                    className="fa-solid fa-trash" 
                                                    style={{ cursor: 'pointer', color: '#f44336', marginLeft: '10px' }}
                                                    onClick={() => manejarEliminar(aud.id)}
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

export default Auditorias;