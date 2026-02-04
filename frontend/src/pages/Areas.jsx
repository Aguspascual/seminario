import React, { useState, useEffect } from 'react';
import styles from '../assets/styles/Areas.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';
const Areas = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [areas, setAreas] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [areaActual, setAreaActual] = useState({ id: null, nombre: '' });
    const [error, setError] = useState('');

    const obtenerAreas = async () => {
        try {
            const response = await fetch('http://localhost:5000/areas');
            if (response.ok) {
                const data = await response.json();
                setAreas(data);
            } else {
                setError('Error al cargar áreas');
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
            setError('Error de conexión');
        }
    };

    useEffect(() => {
        obtenerAreas();
    }, []);

    const abrirModal = (area = null) => {
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
        setError('');
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        const url = modoEdicion
            ? `http://localhost:5000/areas/${areaActual.id}`
            : 'http://localhost:5000/areas';
        const method = modoEdicion ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: areaActual.nombre })
            });

            if (response.ok) {
                cerrarModal();
                obtenerAreas();
            } else {
                setError('Error al guardar el área');
            }
        } catch (error) {
            console.error('Error saving area:', error);
            setError('Error de conexión');
        }
    };

    const eliminarArea = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta área?')) return;

        try {
            const response = await fetch(`http://localhost:5000/areas/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                obtenerAreas();
            } else {
                alert('Error al eliminar el área');
            }
        } catch (error) {
            console.error('Error deleting area:', error);
            alert('Error de conexión');
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
                                    />
                                    {error && <p style={{ color: 'red' }}>{error}</p>}
                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar}>{modoEdicion ? 'Guardar' : 'Agregar'}</button>
                                        <button type="button" onClick={cerrarModal} className={styles.btnCancelar}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <table className={styles.cabecera}>
                        <thead>
                            <tr>
                                <th className={styles.nombre}>Nombre</th>
                                {/* <th className={styles.estado}>Estado</th>  Eliminado por solicitud */}
                                {/* <th className={styles.FechaCreacion}>Fecha Creacion</th> */}
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
                                    <td colSpan="3" style={{ textAlign: 'center' }}>No hay áreas registradas</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {/* La tabla duplicada 'datos' se eliminó para usar una sola estructura correcta */}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Areas;