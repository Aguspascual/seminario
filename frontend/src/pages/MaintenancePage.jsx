import React from 'react';
import DashboardMantenimiento from '../components/mantenimiento/Dashboard/DashboardMantenimiento';
import Head from '../components/Head';
import '../assets/styles/Maintenance.css';

const MaintenancePage = ({ user }) => {
    return (
        <div className="container">
            <Head user={user} />
            <div className="main">
                <DashboardMantenimiento />
            </div>
        </div>
    );
};

export default MaintenancePage;
