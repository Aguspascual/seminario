import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../assets/styles/Areas.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Areas = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [areaActual, setAreaActual] = useState({ id: null, nombre: '' });
    const [formError, setFormError] = useState('');
    
    const queryClient = useQueryClient();

    // 1. Fetching con useQuery
    const { data: areas = [], isLoading, isError, error } = useQuery({
        queryKey: ['areas'],
        queryFn: async () => {
             const response = await fetch('http://localhost:5000/areas');
             if (!response.ok) throw new Error('Error al cargar áreas');
             return response.json();
        }
    });

    // 2. Mutation para Crear/Actualizar
    const saveMutation = useMutation({
        mutationFn: async (area) => {
            const url = modoEdicion
                ? `http://localhost:5000/areas/${area.id}`
                : 'http://localhost:5000/areas';
            const method = modoEdicion ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: area.nombre })
            });

            if (!response.ok) throw new Error('Error al guardar el área');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['areas']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 3. Mutation para Eliminar
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/areas/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar el área');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['areas']);
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const abrirModal = (area = null) => {
        setFormError('');
        if (area) {
            setModoEdicion(true);
            setAreaActual({ id: area.id, nombre: area.nombre });
        } else {
            setModoEdicion(false);
            setAreaActual({ id: null, nombre: '' });
        }
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setAreaActual({ id: null, nombre: '' });
        setFormError('');
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        saveMutation.mutate(areaActual);
    };

    const eliminarArea = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta área?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestion de Areas</h6>
                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestion de Areas</h2>
                            <button className={styles.btn} onClick={() => abrirModal()}><i className="fa-solid fa-circle-plus"></i></button>
                        </div>
                        <input type="text" placeholder='Buscar Areas' className={styles.buscarArea} />
                    </div>
                    {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>{modoEdicion ? 'Editar Área' : 'Agregar Área'}</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        required
                                        value={areaActual.nombre}
                                        onChange={(e) => setAreaActual({ ...areaActual, nombre: e.target.value })}
                                        disabled={saveMutation.isPending}
                                    />
                                    {formError && <p style={{ color: 'red' }}>{formError}</p>}
                                    {saveMutation.isError && <p style={{ color: 'red' }}>{saveMutation.error.message}</p>}
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar} disabled={saveMutation.isPending}>
                                            {saveMutation.isPending ? 'Guardando...' : (modoEdicion ? 'Guardar' : 'Agregar')}
                                        </button>
                                        <button type="button" onClick={cerrarModal} className={styles.btnCancelar} disabled={saveMutation.isPending}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    
                    {isLoading ? (
                         <div style={{textAlign: 'center', padding: '2rem'}}>Cargando áreas...</div>
                    ) : isError ? (
                         <div style={{textAlign: 'center', padding: '2rem', color: 'red'}}>Error: {error.message}</div>
                    ) : (
                        <table className={styles.cabecera}>
                            <thead>
                                <tr>
                                    <th className={styles.nombre}>Nombre</th>
                                    <th className={styles.accion}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areas.map((area) => (
                                    <tr key={area.id}>
                                        <td>{area.nombre}</td>
                                        <td className={styles.accion}>
                                            <button className={styles.btnEditar} onClick={() => abrirModal(area)} title="Editar">
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button className={styles.btnEliminar} onClick={() => eliminarArea(area.id)} title="Eliminar">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {areas.length === 0 && (
                                    <tr>
                                        <td colSpan="2" style={{ textAlign: 'center' }}>No hay áreas registradas</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Areas;
