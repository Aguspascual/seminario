import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import styles from '../assets/styles/modals/Grupos/Grupos.module.css';
import stylesCrear from '../assets/styles/modals/Grupos/Grupos.crear.module.css';
import stylesEditar from '../assets/styles/modals/Grupos/Grupos.editar.module.css';
import stylesDetalle from '../assets/styles/modals/Grupos/Grupos.detalles.module.css';

import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNotification } from "../context/NotificationContext";

// Schemas
const grupoSchema = yup.object().shape({
    nombre: yup.string().required("El nombre del grupo es requerido"),
    turnos: yup.array().of(
        yup.object().shape({
            nombre: yup.string().required("Requerido"),
            hora_inicio: yup.string().required("Requerido"),
            hora_fin: yup.string().required("Requerido"),
        })
    ).min(1, "Debe tener al menos un turno")
});

const Grupos = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    
    const [modalMode, setModalMode] = useState('crear'); // 'crear', 'editar'
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [grupoAEliminar, setGrupoAEliminar] = useState(null);

    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    const user = JSON.parse(localStorage.getItem('usuario'));
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // Form
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(grupoSchema),
        defaultValues: {
            nombre: '',
            turnos: [{ nombre: '', hora_inicio: '', hora_fin: '' }]
        }
    });

    const { fields, append } = useFieldArray({
        control,
        name: "turnos"
    });

    // Queries
    const { data: grupos = [], isLoading } = useQuery({
        queryKey: ['grupos'],
        queryFn: async () => {
            const res = await fetch("http://127.0.0.1:5000/api/grupos");
            if (!res.ok) throw new Error("Error al cargar grupos");
            return res.json();
        }
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: async (data) => {
             const url = modalMode === 'editar' && grupoSeleccionado
                ? `http://127.0.0.1:5000/api/grupos/${grupoSeleccionado.id}`
                : "http://127.0.0.1:5000/api/grupos";
            const method = modalMode === 'editar' && grupoSeleccionado ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Error al guardar grupo");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['grupos']);
            cerrarModal();
            showNotification("success", `Grupo ${modalMode === 'editar' ? 'editado' : 'creado'} correctamente`);
        },
        onError: (err) => showNotification("error", err.message)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`http://127.0.0.1:5000/api/grupos/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar grupo");
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['grupos']);
            cerrarModalEliminar();
            showNotification("success", "Grupo eliminado correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    // Handlers
    const abrirModalCrear = () => {
        setModalMode('crear');
        setGrupoSeleccionado(null);
        reset({ nombre: '', turnos: [{ nombre: '', hora_inicio: '', hora_fin: '' }] });
        setMostrarModal(true);
    };

    const abrirModalEditar = (grupo) => {
        setModalMode('editar');
        setGrupoSeleccionado(grupo);
        // Ensure turnos has at least one item or map existing
        const turnosData = grupo.turnos && grupo.turnos.length > 0 
            ? grupo.turnos 
            : [{ nombre: '', hora_inicio: '', hora_fin: '' }];
            
        reset({ 
            nombre: grupo.nombre, 
            turnos: turnosData
        });
        setMostrarModal(true);
    };

    const abrirModalDetalle = (grupo) => {
        setGrupoSeleccionado(grupo);
        setMostrarModalDetalle(true);
    };

    const abrirModalEliminar = (grupo) => {
        setGrupoAEliminar(grupo);
        setMostrarModalEliminar(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setMostrarModalDetalle(false);
        setGrupoSeleccionado(null);
        reset();
    };

    const cerrarModalEliminar = () => {
        setGrupoAEliminar(null);
        setMostrarModalEliminar(false);
    };

    const confirmarEliminar = () => {
        if (grupoAEliminar) {
            deleteMutation.mutate(grupoAEliminar.id);
        }
    };

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

     // Filtering & Pagination
    const filteredGrupos = useMemo(() => {
        return grupos.filter(g =>
            g.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [grupos, busqueda]);

    const totalItems = filteredGrupos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredGrupos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredGrupos, currentPage, itemsPerPage]);

    // Columns
    const columns = [
        { header: 'Grupo', accessor: 'nombre', style: { fontWeight: 'bold', textAlign: 'center' } },
        {
            header: 'Turnos',
            render: (g) => (
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {g.turnos.map((t, idx) => (
                        <span key={idx} style={{ 
                            backgroundColor: '#e2e8f0', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            color: '#475569',
                            whiteSpace: 'nowrap'
                        }}>
                            {t.nombre} ({t.hora_inicio} - {t.hora_fin})
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: "Acciones",
            render: (g) => (
                <div className={styles['actions-cell']}>
                    <button className={styles['action-btn']} onClick={() => abrirModalDetalle(g)} title="Ver Detalles">
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button 
                        className={styles['action-btn']} 
                        onClick={() => abrirModalEditar(g)} 
                        title="Editar"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                        className={styles['btn-delete-action']} 
                        onClick={() => abrirModalEliminar(g)} 
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
                    <span className={styles.current}>Gestion de Grupos y Turnos</span>
                </div>

                {/* Header */}
                <div className={styles['header-section']}>
                    <h2>Gestión de Grupos y Turnos</h2>
                </div>

                {/* Controls */}
                <div className={styles['controls-section']}>
                    <input
                        type="text"
                        placeholder="Buscar grupo..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                        className={styles['search-input']}
                    />
                    <button className={styles['btn-add']} onClick={abrirModalCrear}>
                        <i className="fa-solid fa-plus"></i> Nuevo Grupo
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
                    emptyMessage="No se encontraron grupos."
                />

                {/* MODAL (Crear / Editar) */}
                {mostrarModal && (
                    <div className={currentStyles['modal-fondo']}>
                        <div className={currentStyles['modal-contenido']}>
                            <h3>{modalMode === 'crear' ? 'Nuevo Grupo' : 'Editar Grupo'}</h3>
                            <div style={{ width: '100%' }} className={currentStyles.separator}></div>
                            
                            <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '10px', gap: '10px' }}>
                                <div className={currentStyles.formGroup}>
                                    <label className={currentStyles.formLabel}>Nombre del Grupo</label>
                                    <input 
                                        {...register("nombre")} 
                                        placeholder="Ej: Grupo A" 
                                        className={errors.nombre ? 'input-error' : ''}
                                    />
                                    {errors.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.nombre.message}</p>}
                                </div>

                                <div className={currentStyles.formGroup}>
                                    <label className={currentStyles.formLabel}>Turnos Asociados</label>
                                    
                                    {fields.map((field, index) => (
                                        <div key={field.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <input
                                                    {...register(`turnos.${index}.nombre`)}
                                                    placeholder="Nombre (Ej: Mañana)"
                                                />
                                                {errors.turnos?.[index]?.nombre && <p style={{ color: 'red', fontSize: '0.7rem' }}>Requerido</p>}
                                            </div>
                                            <div style={{ width: '130px' }}>
                                                <input
                                                    type="time"
                                                    {...register(`turnos.${index}.hora_inicio`)}
                                                />
                                                 {errors.turnos?.[index]?.hora_inicio && <p style={{ color: 'red', fontSize: '0.7rem' }}>Requerido</p>}
                                            </div>
                                            <span style={{ alignSelf: 'center' }}>a</span>
                                            <div style={{ width: '130px' }}>
                                                <input
                                                    type="time"
                                                    {...register(`turnos.${index}.hora_fin`)}
                                                />
                                                 {errors.turnos?.[index]?.hora_fin && <p style={{ color: 'red', fontSize: '0.7rem' }}>Requerido</p>}
                                            </div>
                                            
                                        </div>
                                    ))}

                                    {modalMode === 'editar' && (
                                        <button 
                                            type="button" 
                                            onClick={() => append({ nombre: '', hora_inicio: '', hora_fin: '' })}
                                            style={{
                                                background: '#f1f5f9',
                                                border: '1px dashed #94a3b8',
                                                color: '#475569',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                marginTop: '5px',
                                                width: '100%'
                                            }}
                                        >
                                            <i className="fa-solid fa-plus"></i> Agregar Turno
                                        </button>
                                    )}
                                     {errors.turnos && typeof errors.turnos.message === 'string' && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.turnos.message}</p>}
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
                {mostrarModalDetalle && grupoSeleccionado && (
                    <div className={stylesDetalle['modal-fondo']} onClick={cerrarModal}>
                        <div className={stylesDetalle['modal-contenido']} onClick={e => e.stopPropagation()}>
                            <h3>Detalles del Grupo</h3>
                            <div className={stylesDetalle.separator}></div>
                            
                            <div className={stylesDetalle['detalles-usuario']}>
                                <p><strong>Nombre:</strong> {grupoSeleccionado.nombre}</p>
                                <p><strong>Turnos:</strong></p>
                                <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                                    {grupoSeleccionado.turnos.map((t, i) => (
                                        <li key={i} style={{ 
                                            backgroundColor: '#f8fafc', 
                                            padding: '8px', 
                                            marginBottom: '5px', 
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <strong>{t.nombre}</strong>: {t.hora_inicio} - {t.hora_fin}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={stylesDetalle['modal-botones-derecha']}>
                                <button type="button" onClick={cerrarModal} className={stylesDetalle['btn-gris']}>Cerrar</button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setMostrarModalDetalle(false);
                                        abrirModalEditar(grupoSeleccionado);
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
                            <p>¿Deseas dar de baja al grupo <strong>{grupoAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.</p>
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

export default Grupos;
