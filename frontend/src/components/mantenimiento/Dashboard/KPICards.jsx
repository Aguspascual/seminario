import React from 'react';
import { LayoutDashboard, Clock, Wrench, CheckCircle } from 'lucide-react';

const KPICards = ({ stats }) => {
    const cards = [
        {
            title: 'Vencidos',
            value: stats?.vencidos || 0,
            icon: Clock,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            borderColor: 'border-red-200'
        },
        {
            title: 'Pendientes',
            value: stats?.pendientes || 0,
            icon: LayoutDashboard,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-200'
        },
        {
            title: 'En Proceso',
            value: stats?.en_proceso || 0,
            icon: Wrench,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Completados (Mes)',
            value: stats?.completados_mes || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-200'
        }
    ];

    return (
        <div className="kpi-container">
            {cards.map((card, index) => (
                <div key={index} className={`kpi-card ${card.borderColor}`}>
                    <div className="kpi-content">
                        <h3>{card.title}</h3>
                        <p>{card.value}</p>
                    </div>
                    <div className={`kpi-icon-wrapper ${card.bgColor}`}>
                        <card.icon className={card.color} size={24} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPICards;
