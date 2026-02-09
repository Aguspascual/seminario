import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import styles from '../assets/styles/modals/Areas/Areas.module.css';
import stylesCrear from '../assets/styles/modals/Areas/Areas.crear.module.css';
import stylesEditar from '../assets/styles/modals/Areas/Areas.editar.module.css';
import stylesDetalle from '../assets/styles/modals/Areas/Areas.detalles.module.css';

import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNotification } from "../context/NotificationContext";

// Schemas
const areaSchema = yup.object().shape({
    nombre: yup.string().required("El nombre del área es requerido"),
});

const Areas = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    
    const [modalMode, setModalMode] = useState('crear'); // 'crear', 'editar'
    const [areaSeleccionada, setAreaSeleccionada] = useState(null);
    const [areaAEliminar, setAreaAEliminar] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const user = JSON.parse(localStorage.getItem('usuario'));
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(areaSchema),
        defaultValues: {
            nombre: ''
        }
    });

    // Queries
    const { data: areas = [], isLoading } = useQuery({
        queryKey: ['areas'],
        queryFn: async () => {
            const res = await fetch("http://localhost:5000/areas");
            if (!res.ok) throw new Error("Error al cargar áreas");
            return res.json();
        }
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: async (data) => {
             const url = modalMode === 'editar' && areaSeleccionada
                ? `http://localhost:5000/areas/${areaSeleccionada.id}`
                : "http://localhost:5000/areas";
            const method = modalMode === 'editar' && areaSeleccionada ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Error al guardar área");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['areas']);
            cerrarModal();
            showNotification("success", `Área ${modalMode === 'editar' ? 'editada' : 'creada'} correctamente`);
        },
        onError: (err) => showNotification("error", err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`http://localhost:5000/areas/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar área");
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['areas']);
            cerrarModalEliminar();
            showNotification("success", "Área eliminada correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    // Handlers
    const abrirModalCrear = () => {
        setModalMode('crear');
        setAreaSeleccionada(null);
        reset({ nombre: '' });
        setMostrarModal(true);
    };

    const abrirModalEditar = (area) => {
        setModalMode('editar');
        setAreaSeleccionada(area);
        reset({ nombre: area.nombre });
        setMostrarModal(true);
    };

    const abrirModalDetalle = (area) => {
        setAreaSeleccionada(area);
        setMostrarModalDetalle(true);
    };

    const abrirModalEliminar = (area) => {
        setAreaAEliminar(area);
        setMostrarModalEliminar(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setMostrarModalDetalle(false);
        setAreaSeleccionada(null);
        reset();
    };

    const cerrarModalEliminar = () => {
        setAreaAEliminar(null);
        setMostrarModalEliminar(false);
    };

    const confirmarEliminar = () => {
        if (areaAEliminar) {
            deleteMutation.mutate(areaAEliminar.id);
        }
    };

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

     // Filtering & Pagination
    const filteredAreas = useMemo(() => {
        return areas.filter(a =>
            a.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [areas, busqueda]);

    const totalItems = filteredAreas.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAreas.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAreas, currentPage, itemsPerPage]);

    // Columns
    const columns = [
        { header: 'Nombre', accessor: 'nombre', style: { fontWeight: 'bold' } },
        {
            header: "Acciones",
            render: (area) => (
                <div className={styles['actions-cell']}>
                    <button className={styles['action-btn']} onClick={() => abrirModalDetalle(area)} title="Ver Detalles">
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button 
                        className={styles['action-btn']} 
                        onClick={() => abrirModalEditar(area)} 
                        title="Editar"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                        className={styles['btn-delete-action']} 
                        onClick={() => abrirModalEliminar(area)} 
                        title="Eliminar"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    // Styles selection based on mode
    const currentStyles = modalMode === 'crear' ? stylesCrear : stylesEditar;

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <Link to="/home">Home</Link> <span>/</span>
                    <Link to="/home">Planta</Link> <span>/</span>
                    <span className={styles.current}>Gestión de Áreas</span>
                </div>

                {/* Header */}
                <div className={styles['header-section']}>
                    <h2>Gestión de Áreas</h2>
                </div>

                {/* Controls */}
                <div className={styles['controls-section']}>
                    <input
                        type="text"
                        placeholder="Buscar área..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                        className={styles['search-input']}
                    />
                    <button className={styles['btn-add']} onClick={abrirModalCrear}>
                        <i className="fa-solid fa-plus"></i> Nueva Área
                    </button>
                </div>

                {/* Table */}
                <Table
                    isLoading={isLoading}
                    data={paginatedData}
                    columns={columns}
                    pagination={{
                        currentPage: currentPage,
                        totalPages: totalPages,
                        totalItems: totalItems,
                        minRows: itemsPerPage,
                        onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
                        onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
                    }}
                    emptyMessage="No se encontraron áreas."
                />

                {/* MODAL (Crear / Editar) */}
                {mostrarModal && (
                    <div className={currentStyles['modal-fondo']}>
                        <div className={currentStyles['modal-contenido']}>
                            <h3>{modalMode === 'crear' ? 'Nueva Área' : 'Editar Área'}</h3>
                            <div style={{ width: '100%' }} className={currentStyles.separator}></div>
                            
                            <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '10px', gap: '10px' }}>
                                <div className={currentStyles.formGroup}>
                                    <label className={currentStyles.formLabel}>Nombre del Área</label>
                                    <input 
                                        {...register("nombre")} 
                                        placeholder="Ej: Producción" 
                                        className={errors.nombre ? 'input-error' : ''}
                                    />
                                    {errors.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.nombre.message}</p>}
                                </div>

                                <div className={currentStyles['modal-botones-derecha']}>
                                    <button type="button" onClick={cerrarModal} className={currentStyles['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={currentStyles['btn-confirmar']} disabled={mutation.isPending}>
                                        <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                                        {mutation.isPending ? 'Guardando...' : (modalMode === 'editar' ? 'Guardar Cambios' : 'Guardar')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DETALLES */}
                {mostrarModalDetalle && areaSeleccionada && (
                    <div className={stylesDetalle['modal-fondo']} onClick={cerrarModal}>
                        <div className={stylesDetalle['modal-contenido']} onClick={e => e.stopPropagation()}>
                            <h3>Detalles del Área</h3>
                            <div className={stylesDetalle.separator}></div>
                            
                            <div className={stylesDetalle['detalles-usuario']}>
                                <p><strong>Nombre:</strong> {areaSeleccionada.nombre}</p>
                            </div>

                            <div className={stylesDetalle['modal-botones-derecha']}>
                                <button type="button" onClick={cerrarModal} className={stylesDetalle['btn-gris']}>Cerrar</button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setMostrarModalDetalle(false);
                                        abrirModalEditar(areaSeleccionada);
                                    }} 
                                    className={stylesDetalle['btn-editar']}
                                >
                                    <i className="fa-solid fa-pen"></i> Editar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL CONFIRMACIÓN ELIMINAR */}
                {mostrarModalEliminar && (
                    <div className={styles['modal-confirmacion-fondo']} onClick={cerrarModalEliminar}>
                        <div className={styles['modal-confirmacion-contenido']} onClick={(e) => e.stopPropagation()}>
                            <div style={{ marginBottom: "15px", color: "#ef4444", fontSize: "3rem" }}>
                                <i className="fa-solid fa-circle-exclamation"></i>
                            </div>
                            <h3>¿Estás seguro?</h3>
                            <p>¿Deseas eliminar el área <strong>{areaAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</p>
                            <div className={styles['modal-confirmacion-botones']}>
                                <button onClick={cerrarModalEliminar} className={styles['btn-gris-modal']}>Cancelar</button>
                                <button onClick={confirmarEliminar} className={styles['btn-rojo']}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Areas;
