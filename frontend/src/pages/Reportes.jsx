import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Head from '../components/Head';
import Footer from '../components/Footer';
import Table from '../components/Table';
import FaultFormModal from '../components/mantenimiento/Modals/FaultFormModal';
import ConfirmationModal from '../components/mantenimiento/Modals/ConfirmationModal';
import styles from '../assets/styles/Reportes.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';

const Reportes = () => {
    const queryClient = useQueryClient();
    const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);
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

    // Fetch Reportes de Fallas
    const { data: reportes = [], isLoading } = useQuery({
        queryKey: ['reportes_fallas'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/api/reportes");
            if (!response.ok) throw new Error("Error fetching reports");
            const data = await response.json();
            return data.reportes || [];
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/reportes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Error deleting report");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['reportes_fallas']);
            setIsDeleteModalOpen(false);
        }
    });

    const handleDeleteClick = (id) => {
        setSelectedReportId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedReportId) {
            deleteMutation.mutate(selectedReportId);
        }
    };

    const filteredReportes = reportes.filter(reporte => {
        if (!machineFilter) return true;
        return reporte.maquinaria_id === parseInt(machineFilter);
    });

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
            header: "Descripción",
            accessor: "descripcion_falla",
            render: (reporte) => (
                <span title={reporte.descripcion_falla} style={{ display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {reporte.descripcion_falla}
                </span>
            )
        },
        {
            header: "Reportado Por",
            accessor: "reportador_nombre"
        },
        {
            header: "Estado",
            render: (reporte) => getStatusBadge(reporte.estado_reporte)
        },
        {
            header: "Acciones",
            render: (reporte) => (
                <div className={styles['actions-cell']}>
                    {/* Placeholder for View Details if needed
                    <button className={styles['action-btn']} title="Ver detalles">
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    */}
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

    return (
        <div className={styles.container}>
            <Head />
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
                />

                {/* Modals */}
                {isFaultModalOpen && (
                    <FaultFormModal onClose={() => setIsFaultModalOpen(false)} />
                )}

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Eliminar Reporte"
                    message="¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    isDanger={true}
                />
            </div>
        </div>
    );
};

export default Reportes;
