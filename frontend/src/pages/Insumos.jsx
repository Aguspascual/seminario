import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';
import styles from '../assets/styles/Areas.module.css'; // Reusing Areas styles for consistency
import stylesCrear from '../assets/styles/Insumos.crear.modal.module.css';
import stylesMovimiento from '../assets/styles/Insumos.movimiento.modal.module.css';
import stylesDetalle from '../assets/styles/Insumos.detalle.modal.module.css';

const Insumos = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
    const [insumoSeleccionado, setInsumoSeleccionado] = useState(null);
    const [insumoVerDetalle, setInsumoVerDetalle] = useState(null); // State for details modal
    const [tipoMovimiento, setTipoMovimiento] = useState(''); // 'ENTRADA' or 'SALIDA'

    // States for forms
    const [busqueda, setBusqueda] = useState("");
    const [formError, setFormError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const user = JSON.parse(localStorage.getItem('usuario'));
    const queryClient = useQueryClient();

    // --- QUERIES ---
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
        queryKey: ['movimientos', insumoVerDetalle?.id],
        queryFn: async () => {
            if (!insumoVerDetalle?.id) return [];
            const res = await fetch(`http://127.0.0.1:5000/api/insumos/${insumoVerDetalle.id}/movimientos`);
            if (!res.ok) throw new Error("Error al cargar movimientos");
            return res.json();
        },
        enabled: !!insumoVerDetalle?.id
    });

    // --- MUTATIONS ---
    const createMutation = useMutation({
        mutationFn: async (nuevoInsumo) => {
            const res = await fetch("http://127.0.0.1:5000/api/insumos", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(nuevoInsumo)
            });
            if (!res.ok) throw new Error("Error al crear insumo");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['insumos']);
            cerrarModal();
        }
    });

    const movimientoMutation = useMutation({
        mutationFn: async (movimiento) => {
            const res = await fetch("http://127.0.0.1:5000/api/insumos/movimiento", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(movimiento)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Error al registrar movimiento");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['insumos']);
            cerrarModalMovimiento();
        },
        onError: (err) => alert(err.message)
    });

    // --- HANDLERS ---
    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);

    const abrirModalMovimiento = (insumo, tipo) => {
        setInsumoSeleccionado(insumo);
        setTipoMovimiento(tipo);
        setMostrarModalMovimiento(true);
    };

    const cerrarModalMovimiento = () => {
        setInsumoSeleccionado(null);
        setTipoMovimiento('');
        setMostrarModalMovimiento(false);
    };

    const abrirModalDetalle = (insumo) => {
        setInsumoVerDetalle(insumo);
    };

    const cerrarModalDetalle = () => {
        setInsumoVerDetalle(null);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        createMutation.mutate({
            nombre: formData.get('nombre'),
            codigo: formData.get('codigo'),
            unidad: formData.get('unidad'),
            stock_minimo: parseInt(formData.get('stock_minimo')),
            stock_actual: parseFloat(formData.get('stock_actual')) || 0,
            proveedor_id: formData.get('proveedor_id')
        });
    };

    const handleMovimiento = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        movimientoMutation.mutate({
            insumo_id: insumoSeleccionado.id,
            tipo: tipoMovimiento,
            cantidad: parseFloat(formData.get('cantidad')),
            motivo: formData.get('motivo')
        });
    };

    // --- FILTER & PAGINATION ---
    const filteredInsumos = insumos.filter(i =>
        i.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (i.codigo && i.codigo.toLowerCase().includes(busqueda.toLowerCase()))
    );

    // Using Table component which handles pagination if we pass paginated data, 
    // but here we do client-side pagination to match other components
    const totalPages = Math.ceil(filteredInsumos.length / itemsPerPage);
    const currentData = filteredInsumos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            <div style={{ flex: 1 }}>
                <Head user={user} />

                <div style={{ padding: '20px', marginTop: '20px' }}>
                    {/* Breadcrumbs */}
                    <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
                        <Link to="/home" style={{ textDecoration: 'none', color: '#666' }}>Home</Link>
                        <span style={{ margin: '0 8px' }}>&gt;</span>
                        <Link to="/home" style={{ textDecoration: 'none', color: '#666' }}>Planta</Link>
                        <span style={{ margin: '0 8px' }}>&gt;</span>
                        <span style={{ color: '#2E4F6E', fontWeight: 'bold' }}>Insumos</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: '#1f2937' }}>Gestión de Insumos</h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <input
                            type="text"
                            placeholder="Buscar insumo..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', width: '300px' }}
                        />
                        <button
                            onClick={abrirModal}
                            style={{ backgroundColor: '#2E4F6E', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <i className="fa-solid fa-plus"></i> Nuevo Insumo
                        </button>
                    </div>

                    <Table
                        data={currentData}
                        isLoading={loadingInsumos}
                        columns={[
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
                                header: <div style={{ textAlign: 'center' }}>Movimientos</div>,
                                render: (i) => (
                                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => abrirModalDetalle(i)}
                                            title="Ver Detalle e Historial"
                                            style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            <i className="fa-solid fa-eye"></i>
                                        </button>
                                        <button
                                            onClick={() => abrirModalMovimiento(i, 'ENTRADA')}
                                            title="Registrar Entrada"
                                            style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                        <button
                                            onClick={() => abrirModalMovimiento(i, 'SALIDA')}
                                            title="Registrar Salida"
                                            style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer' }}
                                        >
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                    />

                    {/* Pagination - Reuse logic if needed or use Table's built-in if compatible */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</button>
                        </div>
                    )}
                </div>





                {/* MODAL CREAR */}
                {mostrarModal && (
                    <div className={stylesCrear['modal-fondo']} onClick={cerrarModal}>
                        <div className={stylesCrear['modal-contenido']} onClick={e => e.stopPropagation()}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px' }}>Nuevo Insumo</h3>
                                <div className={stylesCrear.separator}></div>
                            </div>
                            <form onSubmit={handleCreate} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Nombre</label>
                                    <input name="nombre" placeholder="Ej: Tornillos, Aceite..." required />
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Código <small>(Opcional)</small></label>
                                    <input name="codigo" placeholder="Ej: INS-001" />
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Unidad</label>
                                    <input name="unidad" placeholder="Ej: Litros, Unidades, Metros" required />
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Stock Mínimo</label>
                                    <input name="stock_minimo" type="number" placeholder="0" defaultValue={0} min="0" />
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Stock Actual</label>
                                    <input name="stock_actual" type="number" placeholder="0" defaultValue={0} min="0" />
                                </div>
                                <div className={stylesCrear.formGroup}>
                                    <label className={stylesCrear.formLabel}>Proveedor</label>
                                    <select name="proveedor_id">
                                        <option value="">-- Seleccionar Proveedor --</option>
                                        {proveedores.map(p => (
                                            <option key={p.id} value={p.id}>{p.Nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={stylesCrear['modal-botones-derecha']}>
                                    <button type="button" onClick={cerrarModal} className={stylesCrear['btn-gris']}>Cancelar</button>
                                    <button type="submit" className={stylesCrear['btn-confirmar']}>Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL MOVIMIENTO */}
                {mostrarModalMovimiento && (
                    <div className={stylesMovimiento['modal-fondo']} onClick={cerrarModalMovimiento}>
                        <div className={stylesMovimiento['modal-contenido']} onClick={e => e.stopPropagation()}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px', color: tipoMovimiento === 'ENTRADA' ? '#166534' : '#b45309' }}>
                                    Registrar {tipoMovimiento}
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>
                                    Insumo: <strong>{insumoSeleccionado?.nombre}</strong>
                                </div>
                                <div className={stylesMovimiento.separator}></div>
                            </div>
                            <form onSubmit={handleMovimiento} style={{ paddingRight: "30px", paddingBottom: "0px" }}>
                                <div className={stylesMovimiento.formGroup}>
                                    <label className={stylesMovimiento.formLabel}>Cantidad</label>
                                    <input
                                        name="cantidad"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        required
                                        autoFocus
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={stylesMovimiento.formGroup}>
                                    <label className={stylesMovimiento.formLabel}>Motivo</label>
                                    <textarea
                                        name="motivo"
                                        placeholder="Ej. Compra mensual, Reparación, Ajuste de inventario..."
                                        required
                                    />
                                </div>
                                <div className={stylesMovimiento['modal-botones-derecha']}>
                                    <button type="button" onClick={cerrarModalMovimiento} className={stylesMovimiento['btn-gris']}>Cancelar</button>
                                    <button
                                        type="submit"
                                        className={`${stylesMovimiento['btn-base']} ${tipoMovimiento === 'ENTRADA' ? stylesMovimiento['btn-entrada'] : stylesMovimiento['btn-salida']}`}
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL DETALLE E HISTORIAL */}
                {insumoVerDetalle && (
                    <div className={stylesDetalle['modal-fondo']} onClick={cerrarModalDetalle}>
                        <div className={stylesDetalle['modal-contenido']} onClick={e => e.stopPropagation()}>
                            <div className={stylesDetalle.header}>
                                <h2>{insumoVerDetalle.nombre}</h2>
                                <button className={stylesDetalle.closeButton} onClick={cerrarModalDetalle}>
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            </div>

                            <div className={stylesDetalle.gridInfo}>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Código</span>
                                    <span className={stylesDetalle.value}>{insumoVerDetalle.codigo || '-'}</span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Proveedor</span>
                                    <span className={stylesDetalle.value}>
                                        {proveedores.find(p => p.id === insumoVerDetalle.proveedor_id)?.Nombre || 'N/A'}
                                    </span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Unidad</span>
                                    <span className={stylesDetalle.value}>{insumoVerDetalle.unidad}</span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Stock Actual</span>
                                    <span className={stylesDetalle.value} style={{
                                        color: insumoVerDetalle.stock_actual <= insumoVerDetalle.stock_minimo ? '#dc2626' : '#166534',
                                        fontWeight: 'bold'
                                    }}>
                                        {insumoVerDetalle.stock_actual}
                                    </span>
                                </div>
                                <div className={stylesDetalle.infoItem}>
                                    <span className={stylesDetalle.label}>Stock Mínimo</span>
                                    <span className={stylesDetalle.value}>{insumoVerDetalle.stock_minimo}</span>
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
