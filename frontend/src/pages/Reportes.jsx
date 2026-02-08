import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../context/NotificationContext';
import Head from '../components/Head';
import Table from '../components/Table';
import FaultFormModal from '../components/mantenimiento/Modals/FaultFormModal';
import styles from '../assets/styles/modals/Reportes/Reportes.module.css';
import stylesDetalles from '../assets/styles/modals/Reportes/Reportes.detalles.module.css';
import stylesEditar from '../assets/styles/modals/Reportes/Reportes.editar.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';

const Reportes = ({ user }) => {
    const queryClient = useQueryClient();
    const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
    
    const { showNotification } = useNotification();
    
    // Details / Edit Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteReportId, setDeleteReportId] = useState(null);
    
    const [machineFilter, setMachineFilter] = useState('');

    // Fetch Maquinarias for Filter
    const { data: maquinarias = [] } = useQuery({
        queryKey: ['maquinarias'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/maquinarias/?limit=1000", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.maquinarias || [];
        }
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Fetch Reportes
    const { data: dataReportes, isLoading } = useQuery({
        queryKey: ['reportes', currentPage, itemsPerPage],
        queryFn: async () => {
             const token = localStorage.getItem('token');
             const response = await fetch(`http://localhost:5000/api/reportes?page=${currentPage}&limit=${itemsPerPage}`, {
                 headers: {
                     'Authorization': `Bearer ${token}`
                 }
             });
             if (!response.ok) {
                 throw new Error('Error al cargar reportes');
             }
             return response.json();
        },
        keepPreviousData: true
    });

    const reportes = dataReportes?.reportes || [];
    const totalPages = dataReportes?.total_pages || 1;
    const totalItems = dataReportes?.total_items || 0;

    // Filter Logic (Client side filter on current page ... wait, if filtering by machine, we should ideally do it on backend or fetch all?)
    // User asked for pagination like Usuarios. Usuarios filters on the CURRENT PAGE data (lines 213-223 of Usuarios.jsx).
    // So I will replicate that behavior: Filter the `reportes` array (which is just the current page).
    // Note: If machine filter implies global search, backend logic would be needed.
    // Given the task, I'll filter the current page's results similar to Usuarios.jsx logic.
    const filteredReportes = reportes.filter(r => {
        if (!machineFilter) return true;
        // Machine ID comparison
        return String(r.maquinaria_id) === String(machineFilter);
    });

    // Reset page when filter changes? No, filter is just visual on current page in this pattern.
    // If user changes filter, they see filtered results of CURRENT page.
    
    // Mutation: Delete Report
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar reporte');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reportes']);
            showNotification('success', 'Reporte eliminado correctamente');
            setIsDeleteModalOpen(false);
            setDeleteReportId(null);
        },
        onError: (err) => {
             showNotification('error', err.message);
             setIsDeleteModalOpen(false);
        }
    });

    // Mutation: Update Report
    const updateMutation = useMutation({
        mutationFn: async (updatedData) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar reporte');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reportes']);
            queryClient.invalidateQueries(['reporte_detalle', selectedReport?.id]); // Also refresh details
            showNotification('success', 'Reporte actualizado correctamente');
            setIsEditMode(false);
            // Update selectedReport with new data to reflect changes immediately in modal (though query invalidation should handle it)
            // Ideally we close modal or refresh its data. The invalidateQueries('reporte_detalle') above helps.
        },
        onError: (err) => {
            showNotification('error', err.message);
        }
    });

    // Handlers
    const handleOpenDetails = (reporte) => {
        setSelectedReport(reporte);
        setIsEditMode(false);
        setIsDetailsModalOpen(true);
    };

    const handleOpenEdit = (reporte) => {
        setSelectedReport(reporte);
        setIsEditMode(true);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setSelectedReport(null);
        setIsDetailsModalOpen(false);
        setIsEditMode(false);
    };

    const handleDeleteClick = (id) => {
        setDeleteReportId(id);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeleteReportId(null);
        setIsDeleteModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (deleteReportId) {
            deleteMutation.mutate(deleteReportId);
        }
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const updatedData = {
            id: selectedReport.id,
            descripcion_falla: formData.get("descripcion_falla"),
            criticidad: formData.get("criticidad"),
            puede_operar: formData.get("puede_operar"),
            estado_reporte: formData.get("estado_reporte"),
            // Keep existing fields that might not be in form if needed, or backend handles partial updates? 
            // Assuming backend expects full object or fields to update.
            // Based on structure, we usually send updated fields.
        };

        updateMutation.mutate(updatedData);
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        let color = '#374151';
        let bg = '#f3f4f6';

        if (status === 'Pendiente') {
            color = '#854d0e'; // Yellow-800
            bg = '#fef9c3';    // Yellow-100
        } else if (status === 'Asignado' || status === 'En Progreso') {
            color = '#1e40af'; // Blue-800
            bg = '#dbeafe';    // Blue-100
        } else if (status === 'Resuelto' || status === 'Finalizado') {
            color = '#166534'; // Green-800
            bg = '#dcfce7';    // Green-100
        }

        return (
            <span style={{
                backgroundColor: bg,
                color: color,
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "500"
            }}>
                {status}
            </span>
        );
    };

    // Helper for Criticality Badge
    const getCriticalityBadge = (criticidad) => {
        let color = '#374151';
        let bg = '#f3f4f6';

        if (criticidad === 'Alta') {
            color = '#991b1b'; // Red-800
            bg = '#fee2e2';    // Red-100
        } else if (criticidad === 'Media') {
            color = '#854d0e'; // Yellow-800
            bg = '#fef9c3';    // Yellow-100
        } else if (criticidad === 'Baja') {
            color = '#166534'; // Green-800
            bg = '#dcfce7';    // Green-100
        }

        return (
            <span style={{
                backgroundColor: bg,
                color: color,
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "500"
            }}>
                {criticidad}
            </span>
        );
    };

    // Helper for Operation Badge
    const getOperationBadge = (puedeOperar) => {
        let color = '#374151';
        let bg = '#f3f4f6';

        if (puedeOperar === 'No') {
            color = '#991b1b'; // Red-800
            bg = '#fee2e2';    // Red-100
        } else if (puedeOperar === 'Con restricciones') {
            color = '#854d0e'; // Yellow-800
            bg = '#fef9c3';    // Yellow-100
        } else if (puedeOperar === 'Si') {
            color = '#166534'; // Green-800
            bg = '#dcfce7';    // Green-100
        }

        return (
            <span style={{
                backgroundColor: bg,
                color: color,
                padding: "4px 8px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "500"
            }}>
                {puedeOperar || '-'}
            </span>
        );
    };

    // Columns Configuration
    const columns = [
        {
            header: "Fecha",
            accessor: "fecha_reporte",
            render: (reporte) => reporte.fecha_reporte ? format(new Date(reporte.fecha_reporte), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'
        },
        {
            header: "Maquinaria",
            accessor: "maquinaria_nombre"
        },
        {
            header: "Reportado Por",
            accessor: "reportador_nombre"
        },
        {
            header: "Criticidad",
            render: (reporte) => getCriticalityBadge(reporte.criticidad)
        },
        {
            header: "¿Puede Operar?",
            render: (reporte) => getOperationBadge(reporte.puede_operar)
        },
        {
            header: "Estado",
            render: (reporte) => getStatusBadge(reporte.estado_reporte)
        },
        {
            header: "Acciones",
            render: (reporte) => (
                <div className={styles['actions-cell']}>
                    <button className={styles['action-btn']} onClick={() => handleOpenDetails(reporte)} title="Ver detalles">
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button className={styles['action-btn']} onClick={() => handleOpenEdit(reporte)} title="Modificar">
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                        onClick={() => handleDeleteClick(reporte.id)}
                        className={styles['btn-delete-action']}
                        title="Eliminar Reporte"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    // Fetch Single Report Details (for Modal)
    const { data: fullReportDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['reporte_detalle', selectedReport?.id],
        queryFn: async () => {
            if (!selectedReport?.id) return null;
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/${selectedReport.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error fetching report details");
            const data = await response.json();
            return data.reporte;
        },
        enabled: !!selectedReport?.id
    });

    const reportToDisplay = fullReportDetails || selectedReport;

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <a href="/home">Home</a> <span>/</span>
                    <a href="/mantenimiento">Mantenimiento</a> <span>/</span>
                    <span className={styles.current}>Reportes</span>
                </div>

                {/* Header */}
                <div className={styles['header-section']}>
                    <h2>Gestión de Reportes</h2>
                </div>

                {/* Controls */}
                <div className={styles['controls-section']}>
                    <select
                        className={styles['search-input']}
                        value={machineFilter}
                        onChange={(e) => setMachineFilter(e.target.value)}
                    >
                        <option value="">Filtrar por Maquinaria (Todas)</option>
                        {maquinarias.map(m => (
                            <option key={m.id_maquinaria} value={m.id_maquinaria}>{m.nombre}</option>
                        ))}
                    </select>

                    <button
                        className={styles['btn-add']}
                        onClick={() => setIsFaultModalOpen(true)}
                    >
                        <i className="fa-solid fa-plus"></i>
                        Nuevo Reporte
                    </button>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredReportes}
                    isLoading={isLoading}
                    emptyMessage="No se encontraron reportes de fallas."
                    pagination={{
                        currentPage: currentPage,
                        totalPages: totalPages,
                        totalItems: totalItems,
                        minRows: 10,
                        onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
                        onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
                    }}
                />

                {/* Modals */}
                {isFaultModalOpen && (
                    <FaultFormModal onClose={() => setIsFaultModalOpen(false)} />
                )}

                {/* Modal Confirmación Eliminar */}
                {isDeleteModalOpen && (
                    <div className={styles['modal-confirmacion-fondo']} onClick={handleCloseDeleteModal}>
                        <div className={styles['modal-confirmacion-contenido']} onClick={(e) => e.stopPropagation()}>
                            <div style={{ marginBottom: "15px", color: "#ef4444", fontSize: "3rem" }}>
                                <i className="fa-solid fa-circle-exclamation"></i>
                            </div>
                            <h3>¿Estás seguro?</h3>
                            <p>¿Deseas eliminar este reporte? Esta acción no se puede deshacer.</p>
                            <div className={styles['modal-confirmacion-botones']}>
                                <button onClick={handleCloseDeleteModal} className={styles['btn-gris-modal']}>Cancelar</button>
                                <button onClick={handleConfirmDelete} className={styles['btn-rojo']}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Detalles / Edición (Estructura Maquinarias) */}
                {isDetailsModalOpen && selectedReport && (
                    <div className={isEditMode ? stylesEditar['modal-fondo'] : stylesDetalles['modal-fondo']} onClick={handleCloseDetailsModal}>
                        <div className={isEditMode ? stylesEditar['modal-contenido'] : stylesDetalles['modal-contenido']} onClick={(e) => e.stopPropagation()}>
                            <div style={{ marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, paddingBottom: '10px' }}>
                                    {isEditMode ? "Editar Reporte" : "Detalles del Reporte"}
                                </h3>
                                <div className={isEditMode ? stylesEditar.separator : stylesDetalles.separator}></div>
                            </div>
                            
                            {isLoadingDetails ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Cargando detalles...</div>
                            ) : (
                                isEditMode ? (
                                    <form onSubmit={handleEditSubmit} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
                                        <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                            <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Maquinaria</label>
                                            <input defaultValue={reportToDisplay.maquinaria_nombre} readOnly style={{ margin: "0px", backgroundColor: "#f3f4f6" }} />
                                        </div>
                                        <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                            <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Descripción Falla</label>
                                            <textarea
                                                name="descripcion_falla"
                                                defaultValue={reportToDisplay.descripcion_falla || ''}
                                                required
                                                maxLength={200}
                                                rows="3"
                                                style={{ margin: "0px", width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "6px", fontFamily: "inherit", resize: "none" }}
                                            />
                                        </div>
                                        <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                            <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Criticidad</label>
                                            <select name="criticidad" defaultValue={reportToDisplay.criticidad} style={{ margin: "0px" }}>
                                                <option value="Baja">Baja</option>
                                                <option value="Media">Media</option>
                                                <option value="Alta">Alta</option>
                                            </select>
                                        </div>
                                        <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                            <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>¿Puede Operar?</label>
                                            <select name="puede_operar" defaultValue={reportToDisplay.puede_operar} style={{ margin: "0px" }}>
                                                <option value="No">No</option>
                                                <option value="Si">Si</option>
                                                <option value="Con restricciones">Con restricciones</option>
                                            </select>
                                        </div>
                                        <div className={stylesEditar.formGroup} style={{ margin: "0px" }}>
                                            <label className={stylesEditar.formLabel} style={{ margin: "0px" }}>Estado</label>
                                            <select name="estado_reporte" defaultValue={reportToDisplay.estado_reporte} style={{ margin: "0px" }}>
                                                <option value="Pendiente">Pendiente</option>
                                                <option value="En Progreso">En Progreso</option>
                                                <option value="Resuelto">Resuelto</option>
                                                <option value="Finalizado">Finalizado</option>
                                            </select>
                                        </div>

                                        <div className={stylesEditar['modal-botones-derecha']}>
                                            <button type="button" onClick={() => setIsEditMode(false)} className={stylesEditar['btn-gris']}>Cancelar</button>
                                            <button type="submit" className={stylesEditar['btn-confirmar']} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <i className="fa-solid fa-floppy-disk"></i> Actualizar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className={stylesDetalles['detalles-usuario']}>
                                        <p><strong>Fecha Reporte:</strong> {reportToDisplay.fecha_reporte ? format(new Date(reportToDisplay.fecha_reporte), 'dd/MM/yyyy HH:mm', { locale: es }) : '-'}</p>
                                        <p><strong>Maquinaria:</strong> {reportToDisplay.maquinaria_nombre}</p>
                                        <p><strong>Reportado Por:</strong> {reportToDisplay.reportador_nombre}</p>
                                        <p><strong>Descripción:</strong> <br/><span style={{display: 'block', marginTop: '4px', wordBreak: 'break-word'}}>{reportToDisplay.descripcion_falla || <em>Cargando...</em>}</span></p>
                                        <p><strong>Ubicación Específica:</strong> {reportToDisplay.ubicacion_especifica || '-'}</p>
                                        <p><strong>Estado:</strong> {getStatusBadge(reportToDisplay.estado_reporte)}</p>
                                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                                            <p><strong>Criticidad:</strong>
                                                <span style={{ marginLeft: '5px', color: reportToDisplay.criticidad === 'Alta' ? '#ef4444' : '#374151' }}>
                                                    {reportToDisplay.criticidad}
                                                </span>
                                            </p>
                                            <p><strong>¿Puede Operar?:</strong> {reportToDisplay.puede_operar || '-'}</p>
                                        </div>
                                        
                                        <div className={stylesDetalles['modal-botones-derecha']} style={{ marginTop: '20px' }}>
                                            <button onClick={handleCloseDetailsModal} className={stylesDetalles['btn-gris']}>Cerrar</button>
                                            <button
                                                onClick={() => setIsEditMode(true)}
                                                className={stylesDetalles['btn-editar']}
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i> Editar
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reportes;
