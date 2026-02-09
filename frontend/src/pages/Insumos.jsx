import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import styles from '../assets/styles/modals/Insumos/Insumos.module.css';
import stylesCrear from '../assets/styles/modals/Insumos/Insumos.crear.module.css';
import stylesMovimiento from '../assets/styles/modals/Insumos/Insumos.movimiento.module.css';
import stylesDetalle from '../assets/styles/modals/Insumos/Insumos.detalles.module.css';

import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNotification } from "../context/NotificationContext";

// Schemas
const createSchema = yup.object().shape({
    nombre: yup.string().required("El nombre es requerido"),
    codigo: yup.string().nullable(),
    unidad: yup.string().required("La unidad es requerida"),
    stock_minimo: yup.number().typeError("Debe ser un número").min(0, "Mínimo 0").required("Requerido"),
    stock_actual: yup.number().typeError("Debe ser un número").min(0, "Mínimo 0").required("Requerido"),
    proveedor_id: yup.string().nullable().label("Proveedor") // Can be empty if not selected? Assuming optional based on original code, or check validation.
});

const movimientoSchema = yup.object().shape({
    cantidad: yup.number().typeError("Debe ser un número").positive("Debe ser mayor a 0").required("La cantidad es requerida"),
    motivo: yup.string().required("El motivo es requerido")
});

const Insumos = () => {
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
    const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);

    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [tipoMovimiento, setTipoMovimiento] = useState(''); // 'ENTRADA' or 'SALIDA'

    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Adjust to match if needed, user didn't specify for this one but consistent is good.

    const user = JSON.parse(localStorage.getItem('usuario'));
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    // Forms
    const {
        register: registerCrear,
        handleSubmit: handleSubmitCrear,
        reset: resetCrear,
        formState: { errors: errorsCrear }
    } = useForm({
        resolver: yupResolver(createSchema)
    });

    const {
        register: registerMovimiento,
        handleSubmit: handleSubmitMovimiento,
        reset: resetMovimiento,
        formState: { errors: errorsMovimiento }
    } = useForm({
        resolver: yupResolver(movimientoSchema)
    });

    // Queries
    const { data: insumos = [], isLoading: loadingInsumos } = useQuery({
        queryKey: ['insumos'],
        queryFn: async () => {
             const res = await fetch("http://127.0.0.1:5000/api/insumos");
            if (!res.ok) throw new Error("Error al cargar insumos");
            return res.json();
        }
    });

    const { data: proveedores = [] } = useQuery({
        queryKey: ['proveedores'],
        queryFn: async () => {
            const res = await fetch("http://127.0.0.1:5000/proveedores");
            if (!res.ok) throw new Error("Error al cargar proveedores");
            return res.json();
        }
    });

    const { data: movimientos = [], isLoading: loadingMovimientos } = useQuery({
        queryKey: ['movimientos', insumoSeleccionado?.id],
        queryFn: async () => {
            if (!insumoSeleccionado?.id) return [];
            const res = await fetch(`http://127.0.0.1:5000/api/insumos/${insumoSeleccionado.id}/movimientos`);
            if (!res.ok) throw new Error("Error al cargar movimientos");
            return res.json();
        },
        enabled: !!insumoSeleccionado?.id && mostrarModalDetalle
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch("http://127.0.0.1:5000/api/insumos", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Error al crear insumo");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['insumos']);
            setMostrarModalCrear(false);
            resetCrear();
            showNotification("success", "Insumo creado correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    const movimientoMutation = useMutation({
        mutationFn: async (data) => {
            const res = await fetch("http://127.0.0.1:5000/api/insumos/movimiento", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                 const err = await res.json();
                 throw new Error(err.error || "Error al registrar movimiento");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['insumos']);
            setMostrarModalMovimiento(false);
            resetMovimiento();
            setInsumoSeleccionado(null);
            showNotification("success", "Movimiento registrado correctamente");
        },
        onError: (err) => showNotification("error", err.message)
    });

    // Filtering & Pagination
    const filteredInsumos = useMemo(() => {
        return insumos.filter(i =>
            i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (i.codigo && i.codigo.toLowerCase().includes(busqueda.toLowerCase()))
        );
    }, [insumos, busqueda]);

    const totalItems = filteredInsumos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredInsumos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredInsumos, currentPage, itemsPerPage]);

    // Handlers
    const handleCrear = (data) => {
        createMutation.mutate(data);
    };

    const handleMovimientoGuardar = (data) => {
        if (insumoSeleccionado) {
            movimientoMutation.mutate({
                insumo_id: insumoSeleccionado.id,
                tipo: tipoMovimiento,
                cantidad: data.cantidad,
                motivo: data.motivo
            });
        }
    };

    const abrirModalMovimiento = (insumo, tipo) => {
        setInsumoSeleccionado(insumo);
        setTipoMovimiento(tipo);
        resetMovimiento();
        setMostrarModalMovimiento(true);
    };

    const abrirModalDetalle = (insumo) => {
        setInsumoSeleccionado(insumo);
        setMostrarModalDetalle(true);
    };

    // Columns
    const columns = [
        { header: 'Código', accessor: 'codigo', render: (i) => <strong>{i.codigo || '-'}</strong> },
        { header: 'Nombre', accessor: 'nombre' },
        { header: 'Unidad', accessor: 'unidad' },
        {
            header: 'Stock Actual',
            render: (i) => (
                <span style={{
                    color: i.stock_actual <= i.stock_minimo ? '#dc2626' : '#166534',
                    fontWeight: 'bold',
                    backgroundColor: i.stock_actual <= i.stock_minimo ? '#fee2e2' : '#dcfce7',
                    padding: '4px 8px',
                    borderRadius: '4px'
                }}>
                    {i.stock_actual}
                </span>
            )
        },
        {
            header: <div style={{ textAlign: 'center' }}>Acciones</div>,
            render: (i) => (
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                    <button
                        className={styles['action-btn']}
                        onClick={() => abrirModalDetalle(i)}
                        title="Ver Detalle e Historial"
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button
                        className={styles['action-btn']}
                        onClick={() => abrirModalMovimiento(i, 'SALIDA')}
                        title="Registrar Salida"
                        style={{ color: '#b45309', backgroundColor: '#fef3c7', border: '1px solid #b45309' }}
                    >
                        <i className="fa-solid fa-minus"></i>
                    </button>
                    <button
                        className={styles['action-btn']} 
                        onClick={() => abrirModalMovimiento(i, 'ENTRADA')}
                        title="Registrar Entrada"
                        style={{ color: '#166534', backgroundColor: '#dcfce7', border: '1px solid #166534' }}
                    >
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <Link to="/home">Home</Link> <span>/</span>
                    <span className={styles.current}>Gestion de Insumos</span>
                </div>

                {/* Header */}
                <div className={styles['header-section']}>
                    <h2>Gestión de Insumos</h2>
                </div>

                {/* Controls */}
                <div className={styles['controls-section']}>
                    <input
                        type="text"
                        placeholder="Buscar insumo..."
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                        className={styles['search-input']}
                    />
                    <button className={styles['btn-add']} onClick={() => { setMostrarModalCrear(true); resetCrear(); }}>
                        <i className="fa-solid fa-plus"></i> Nuevo Insumo
                    </button>
                </div>

                {/* Table */}
                <Table
                    isLoading={loadingInsumos}
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
                    emptyMessage="No se encontraron insumos."
                />

                {/* MODAL CREAR */}
                {mostrarModalCrear && (
                    <div className={stylesCrear['modal-fondo']}>
                        <div className={stylesCrear['modal-contenido']}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px' }}>Nuevo Insumo</h3>
                                <div className={stylesCrear.separator}></div>
                            </div>
                            <form onSubmit={handleSubmitCrear(handleCrear)} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Nombre</label>
                                    <input {...registerCrear("nombre")} placeholder="Ej: Tornillos, Aceite..." />
                                    {errorsCrear.nombre && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.nombre.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Código <small>(Opcional)</small></label>
                                    <input {...registerCrear("codigo")} placeholder="Ej: INS-001" />
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Unidad</label>
                                    <input {...registerCrear("unidad")} placeholder="Ej: Litros, Unidades, Metros" />
                                    {errorsCrear.unidad && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.unidad.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Stock Mínimo</label>
                                    <input type="number" {...registerCrear("stock_minimo")} placeholder="0" />
                                    {errorsCrear.stock_minimo && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.stock_minimo.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Stock Actual</label>
                                    <input type="number" {...registerCrear("stock_actual")} placeholder="0" />
                                    {errorsCrear.stock_actual && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsCrear.stock_actual.message}</p>}
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Proveedor</label>
                                    <select {...registerCrear("proveedor_id")}>
                                        <option value="">-- Seleccionar Proveedor --</option>
                                        {proveedores.map(p => (
                                            <option key={p.id} value={p.id}>{p.Nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={stylesCrear['modal-botones-derecha']}>
                                    <button type="button" onClick={() => setMostrarModalCrear(false)} className={stylesCrear['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesCrear['btn-confirmar']} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL MOVIMIENTO */}
                {mostrarModalMovimiento && (
                    <div className={stylesMovimiento['modal-fondo']}>
                        <div className={stylesMovimiento['modal-contenido']}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px', color: tipoMovimiento === 'ENTRADA' ? '#166534' : '#b45309' }}>
                                    Registrar {tipoMovimiento}
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                                    Insumo: <strong>{insumoSeleccionado?.nombre}</strong>
                                </div>
                                <div className={stylesMovimiento.separator}></div>
                            </div>
                            <form onSubmit={handleSubmitMovimiento(handleMovimientoGuardar)} style={{ paddingBottom: "0px", gap: "10px" }}>
                                <div className={stylesMovimiento.formGroup}>
                                    <label className={stylesMovimiento.formLabel}>Cantidad</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...registerMovimiento("cantidad")}
                                        placeholder="0.00"
                                    />
                                    {errorsMovimiento.cantidad && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsMovimiento.cantidad.message}</p>}
                                </div>
                                <div className={stylesMovimiento.formGroup}>
                                    <label className={stylesMovimiento.formLabel}>Motivo</label>
                                    <textarea
                                        {...registerMovimiento("motivo")}
                                        placeholder="Ej. Compra mensual, Reparación, Ajuste de inventario..."
                                    />
                                    {errorsMovimiento.motivo && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errorsMovimiento.motivo.message}</p>}
                                </div>
                                <div className={stylesMovimiento['modal-botones-derecha']}>
                                    <button type="button" onClick={() => setMostrarModalMovimiento(false)} className={stylesMovimiento['btn-gris']}>Cancelar</button>
                                    <button
                                        type="submit"
                                        className={`${stylesMovimiento['btn-base']} ${tipoMovimiento === 'ENTRADA' ? stylesMovimiento['btn-entrada'] : stylesMovimiento['btn-salida']}`}
                                        disabled={movimientoMutation.isPending}
                                    >
                                        {movimientoMutation.isPending ? 'Registrando...' : 'Confirmar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DETALLE E HISTORIAL */}
                {mostrarModalDetalle && insumoSeleccionado && (
                    <div className={stylesDetalle['modal-fondo']} onClick={() => setMostrarModalDetalle(false)}>
                        <div className={stylesDetalle['modal-contenido']} onClick={e => e.stopPropagation()}>
                            <div className={stylesDetalle.header}>
                                <h2>{insumoSeleccionado.nombre}</h2>
                                <button className={stylesDetalle.closeButton} onClick={() => setMostrarModalDetalle(false)}>
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            </div>

                            <div className={stylesDetalle.gridInfo}>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Código</span>
                                    <span className={stylesDetalle.value}>{insumoSeleccionado.codigo || '-'}</span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Proveedor</span>
                                    <span className={stylesDetalle.value}>
                                        {proveedores.find(p => p.id === insumoSeleccionado.proveedor_id)?.Nombre || 'N/A'}
                                    </span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Unidad</span>
                                    <span className={stylesDetalle.value}>{insumoSeleccionado.unidad}</span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Stock Actual</span>
                                    <span className={stylesDetalle.value} style={{
                                        color: insumoSeleccionado.stock_actual <= insumoSeleccionado.stock_minimo ? '#dc2626' : '#166534',
                                        fontWeight: 'bold'
                                    }}>
                                        {insumoSeleccionado.stock_actual}
                                    </span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Stock Mínimo</span>
                                    <span className={stylesDetalle.value}>{insumoSeleccionado.stock_minimo}</span>
                                </div>
                            </div>

                            <h3 className={stylesDetalle.sectionTitle}>
                                <i className="fa-solid fa-clock-rotate-left"></i> Historial de Movimientos
                            </h3>

                            <div className={stylesDetalle.historyContainer}>
                                <table className={stylesDetalle.historyTable}>
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Usuario</th>
                                            <th>Tipo</th>
                                            <th>Cantidad</th>
                                            <th>Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingMovimientos ? (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Cargando...</td></tr>
                                        ) : movimientos.length === 0 ? (
                                            <tr><td colSpan="5" className={stylesDetalle.emptyState}>No hay movimientos registrados</td></tr>
                                        ) : (
                                            movimientos.map((mov) => (
                                                <tr key={mov.id}>
                                                    <td>{new Date(mov.fecha).toLocaleDateString()} {new Date(mov.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td style={{ fontWeight: '500' }}>{mov.usuario_nombre}</td>
                                                    <td>
                                                        <span className={`${stylesDetalle.badge} ${mov.tipo === 'ENTRADA' ? stylesDetalle.badgeEntrada : stylesDetalle.badgeSalida}`}>
                                                            {mov.tipo}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 'bold' }}>{mov.cantidad}</td>
                                                    <td>{mov.motivo}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Insumos;
