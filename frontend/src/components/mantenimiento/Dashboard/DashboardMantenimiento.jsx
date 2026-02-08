import React, { useState, useEffect } from 'react';
import KPICards from './KPICards';
import CalendarMantenimiento from './CalendarioMantenimiento';
import ProximosMantenimientos from './ProximosMantenimientos';

import MaintenanceFormModal from '../Modals/MaintenanceFormModal';
import FaultFormModal from '../Modals/FaultFormModal';
import MaintenanceDetailModal from '../Modals/MaintenanceDetailModal';
import { Plus, AlertTriangle } from 'lucide-react';

const DashboardMantenimiento = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

        // Modal States
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [showFaultModal, setShowFaultModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [selectedDetailEvent, setSelectedDetailEvent] = useState(null);

    useEffect(() => {
        fetchDashboardData();
        fetchCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear());
    }, [currentDate]); // Refetch on date change to ensure sync

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/mantenimientos/dashboard');
            if (response.ok) {
                const data = await response.json();
                setDashboardData(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCalendarEvents = async (month, year) => {
        try {
            const response = await fetch(`http://localhost:5000/api/mantenimientos/calendario?mes=${month}&anio=${year}`);
            if (response.ok) {
                const data = await response.json();
                // Convert string dates to Date objects for React Big Calendar
                const events = data.eventos.map(e => ({
                    ...e,
                    start: new Date(e.start), // Ensure proper date parsing
                    end: new Date(e.start)  // Calendar needs end date even for single day
                }));
                setCalendarEvents(events);
            }
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
    };

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
        fetchCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear());
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
                fetchCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear());
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
