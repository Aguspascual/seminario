import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../assets/styles/Maquinaria.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Maquinaria = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [formError, setFormError] = useState("");
    const queryClient = useQueryClient();

    // 1. Fetching de Maquinaria
    const { data: maquinarias = [], isLoading, isError, error } = useQuery({
        queryKey: ['maquinaria'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/maquinaria");
            if (!response.ok) throw new Error("Error al cargar maquinaria");
            return response.json();
        }
    });

    // 2. Mutation para Crear
    const crearMutation = useMutation({
        mutationFn: async (nuevaMaquinaria) => {
            const response = await fetch("http://localhost:5000/maquinaria", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaMaquinaria)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear maquinaria");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['maquinaria']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 3. Mutation para Eliminar
    const eliminarMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/maquinaria/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Error al eliminar maquinaria");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['maquinaria']);
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
            tipo: formData.get('tipo'),
            anio: parseInt(formData.get('anio')),
            estado: 'Activa' // Por defecto
        };
        crearMutation.mutate(data);
    };

    const manejarEliminar = (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta maquinaria?")) {
            eliminarMutation.mutate(id);
        }
    };

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestion de Maquinaria</h6>
                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestion de Maquinaria</h2>
                            <button className={styles.btn} onClick={abrirModal}>
                                <i className="fa-solid fa-circle-plus"></i>
                            </button>
                        </div>
                        <input type="text" placeholder='Buscar Maquinaria' className={styles.buscarMaquinaria} />
                    </div>
                    
                    {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>Agregar Maquinaria</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input type="text" name="nombre" placeholder="Nombre" required />
                                    <input type="text" name="tipo" placeholder="Tipo (ej. Perforadora)" required />
                                    <input type="number" name="anio" placeholder="Año" required />
                                    
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
                                <th className={styles.tipo}>Tipo</th>
                                <th className={styles.nombre}>Nombre</th>
                                <th className={styles.tipo}>Año</th>
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
                                ) : maquinarias.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '20px' }}>No hay maquinaria registrada.</td></tr>
                                ) : (
                                    maquinarias.map((maq) => (
                                        <tr key={maq.id} style={{ height: '40px', borderBottom: '1px solid #ddd' }}>
                                            <td className={styles.id}>{maq.id}</td>
                                            <td className={styles.tipo}>{maq.tipo}</td>
                                            <td className={styles.nombre}>{maq.nombre}</td>
                                            <td className={styles.tipo}>{maq.anio}</td>
                                            <td className={styles.accion}>
                                                <i 
                                                    className="fa-solid fa-trash" 
                                                    style={{ cursor: 'pointer', color: '#f44336' }}
                                                    onClick={() => manejarEliminar(maq.id)}
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

export default Maquinaria;