import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import KPICards from './KPICards';
import CalendarMantenimiento from './CalendarioMantenimiento';
import ProximosMantenimientos from './ProximosMantenimientos';

import MaintenanceFormModal from '../Modals/MaintenanceFormModal';
import FaultFormModal from '../Modals/FaultFormModal';
import MaintenanceDetailModal from '../Modals/MaintenanceDetailModal';
import { Plus, AlertTriangle } from 'lucide-react';

const DashboardMantenimiento = () => {
    const queryClient = useQueryClient();
    // const [dashboardData, setDashboardData] = useState(null); // Replaced by useQuery
    // const [calendarEvents, setCalendarEvents] = useState([]); // Replaced by useQuery
    // const [loading, setLoading] = useState(true); // Replaced by useQuery
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal States
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showFaultModal, setShowFaultModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);

    const { data: dashboardData, isLoading: loading, refetch: fetchDashboardData } = useQuery({
        queryKey: ['dashboard_data'],
        queryFn: async () => {
            const response = await fetch('http://localhost:5000/api/mantenimientos/dashboard');
            if (!response.ok) {
                throw new Error('Error fetching dashboard data');
            }
            return response.json();
        }
    });

    const fetchCalendarEvents = async (month, year) => {
        const response = await fetch(`http://localhost:5000/api/mantenimientos/calendario?mes=${month}&anio=${year}`);
        if (!response.ok) {
            throw new Error('Error fetching calendar events');
        }
        const data = await response.json();
        // Convert string dates to Date objects for React Big Calendar
        return data.eventos.map(e => {
            // Parse date manually to avoid UTC offset issues
            const parts = e.start.split('T')[0].split('-');
            const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return {
                ...e,
                start: localDate,
                end: localDate  // Calendar needs end date even for single day
            };
        });
    };

    const { data: calendarEvents = [] } = useQuery({
        queryKey: ['calendar_events', currentDate.getMonth() + 1, currentDate.getFullYear()],
        queryFn: () => fetchCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear()),
        keepPreviousData: true
    });

    const handleNavigate = (date) => {
        setCurrentDate(date);
        // fetchCalendarEvents(date.getMonth() + 1, date.getFullYear()); // redundant with useEffect dependency
    };

    const handleEventClick = (event) => {
        // Prepare data for view/edit
        const maintenanceData = {
            id: event.id,
            fecha_programada: event.start.toISOString(),
            ...event.extendedProps // estado, prioridad, maquinaria_nombre, etc
        };

        setSelectedDetailEvent(maintenanceData);
        setShowDetailModal(true);
    };

    const handleEditFromDetail = (maintenance) => {
        setShowDetailModal(false);
        setSelectedDetailEvent(null);
        setSelectedMaintenance(maintenance);
        setShowMaintenanceModal(true);
    };

    const handleCloseMaintenanceModal = () => {
        setShowMaintenanceModal(false);
        setSelectedMaintenance(null);
        fetchDashboardData();
        queryClient.invalidateQueries(['calendar_events']);
    };

    const handleCloseFaultModal = () => {
        setShowFaultModal(false);
        fetchDashboardData(); // Refresh fault list
    };

    const handleDeleteMaintenance = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/mantenimientos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchDashboardData();
                queryClient.invalidateQueries(['calendar_events']);
            } else {
                alert('Error al eliminar mantenimiento');
            }
        } catch (error) {
            console.error('Error deleting maintenance:', error);
            alert('Error al eliminar mantenimiento');
        }
    };



    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
    }

    return (
        <>
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <a href="/home">Home</a> <span>/</span>
                <span className="current">Mantenimiento</span>
            </div>

            <div className="header-section">
                <h2>Panel de Mantenimiento</h2>
            </div>

            <div className="controls-section">
                <button className="btn-report-fault" onClick={() => setShowFaultModal(true)}>
                    <AlertTriangle size={18} />
                    Reportar Falla
                </button>
                <button className="btn-add" onClick={() => setShowMaintenanceModal(true)}>
                    <Plus size={18} />
                    Nueva Tarea
                </button>
            </div>

            <KPICards stats={dashboardData} />

            <div className="dashboard-grid">
                <div className="calendar-container">
                    <CalendarMantenimiento
                        events={calendarEvents}
                        onEventClick={handleEventClick}
                        date={currentDate}
                        onNavigate={handleNavigate}
                    />
                </div>
                <div className="space-y-6">
                    <ProximosMantenimientos mantenimientos={dashboardData?.proximos_7_dias} />
                </div>
            </div>

            {showMaintenanceModal && (
                <MaintenanceFormModal
                    onClose={handleCloseMaintenanceModal}
                    initialData={selectedMaintenance}
                    onDelete={handleDeleteMaintenance} // Pass delete handler
                />
            )}

            {showFaultModal && (
                <FaultFormModal
                    onClose={handleCloseFaultModal}
                />
            )}

            {showDetailModal && (
                <MaintenanceDetailModal
                    onClose={() => setShowDetailModal(false)}
                    maintenance={selectedDetailEvent}
                    onEdit={handleEditFromDetail}
                />
            )}
        </>
    );
};

export default DashboardMantenimiento;
