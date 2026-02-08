import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import KPICard from '../components/Dashboard/KPICard';
import styles from '../assets/styles/Home.module.css';
import { Activity, Wrench, Package, ClipboardList, AlertCircle, Plus, Users } from 'lucide-react';
import ReporteModal from '../components/mantenimiento/Modals/FaultFormModal';
import ActiveShiftUsersModal from '../components/Dashboard/ActiveShiftUsersModal';
import Head from '../components/Head';

const Home = () => {
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const { data: dashboardData, isLoading, error } = useDashboardMetrics(user);

  const getGreeting = () => {
    return 'Bienvenido';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error cargando el dashboard. Por favor intente nuevamente.</p>
      </div>
    );
  }

  // Safe defaults
  const data = dashboardData || {
    auditorias: { proxima: '-', ultima: null },
    maquinarias: { operativas: 0, en_reparacion: 0, total: 0 },
    insumos: { alertas_stock: 0 },
    mantenimientos: { pendientes: 0, vencidos: 0 },
    reportes: { pendientes: 0 }
  };

  return (
    <>
      <Head />
      <div className={styles.homeContainer}>
        <header className={styles.headerDashboard}>
          <div className={styles.welcomeBox}>
            <h1>
              {getGreeting()}, <span className={styles.userName}>{user?.nombre}</span>
            </h1>
            <p className={styles.dateText}>{formatDate()}</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnCrear} onClick={() => setShowReportModal(true)}>
              <Plus size={20} />
              <span>Nuevo Reporte</span>
            </button>
          </div>
        </header>

        <div className={styles.kpiGrid}>
          <KPICard
            title="Auditorías"
            icon={ClipboardList} // Lucide Icon component
            value={data.auditorias.proxima || 'Sin programar'}
            subtext={data.auditorias.ultima ? `Última: ${data.auditorias.ultima.fecha} (${data.auditorias.ultima.estado})` : 'Sin registros previos'}
            status="normal"
            colorClass="blue"
            linkTo="/auditorias"
          />

          <KPICard
            title="Maquinaria"
            icon={Activity}
            value={`${data.maquinarias.operativas} / ${data.maquinarias.total}`}
            subtext={`${data.maquinarias.en_reparacion} en reparación`}
            status={data.maquinarias.en_reparacion > 0 ? 'warning' : 'success'}
            colorClass="green"
            linkTo="/maquinarias"
          />

          <KPICard
            title="Mantenimiento"
            icon={Wrench}
            value={data.mantenimientos.pendientes}
            subtext={`${data.mantenimientos.vencidos} vencidos`}
            status={data.mantenimientos.vencidos > 0 ? 'danger' : 'normal'}
            colorClass="purple"
            linkTo="/mantenimiento"
          />

          <KPICard
            title="Logística"
            icon={Package}
            value={data.insumos.alertas_stock}
            subtext="Alertas de stock bajo"
            status={data.insumos.alertas_stock > 0 ? 'warning' : 'normal'}
            colorClass="yellow"
            linkTo="/insumos"
          />

          <KPICard
            title="Reportes"
            icon={AlertCircle}
            value={data.reportes.pendientes}
            subtext="Reportes sin responder"
            status={data.reportes.pendientes > 0 ? 'danger' : 'normal'}
            colorClass="red"
            linkTo="/reportes"
          />
          <KPICard
            title="Personal Activo"
            icon={Users}
            value={data.turno?.turno ? `${data.turno.usuarios?.length || 0} Activos` : 'Sin Turno'}
            subtext={data.turno?.turno ? `${data.turno.turno.nombre} (${data.turno.turno.hora_inicio} - ${data.turno.turno.hora_fin})` : 'No hay personal registrado'}
            status={data.turno?.turno ? 'success' : 'normal'}
            colorClass="blue"
            onClick={data.turno?.turno ? () => setShowShiftModal(true) : null}
          />
        </div>

        {showReportModal && (
          <ReporteModal
            onClose={() => setShowReportModal(false)}
          />
        )}

        {showShiftModal && (
          <ActiveShiftUsersModal
            isOpen={showShiftModal}
            onClose={() => setShowShiftModal(false)}
            turnoData={data.turno ? { turno: data.turno, usuarios: data.turno.usuarios || [] } : null}
          />
        )}
      </div>
    </>
  );
};

export default Home;
