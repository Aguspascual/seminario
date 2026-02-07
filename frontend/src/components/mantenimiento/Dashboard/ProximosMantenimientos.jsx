import React from 'react';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';

const ProximosMantenimientos = ({ mantenimientos }) => {
    if (!mantenimientos || mantenimientos.length === 0) {
        return (
            <div className="upcoming-container">
                <h2 className="upcoming-title">Próximos 7 días</h2>
                <p className="upcoming-desc">No hay mantenimientos programados.</p>
            </div>
        );
    }

    return (
        <div className="upcoming-container">
            <h2 className="upcoming-title">Próximos 7 días</h2>
            <div className="upcoming-list">
                {mantenimientos.map((mant) => (
                    <div key={mant.id} className="upcoming-item">
                        <div className="upcoming-header">
                            <div>
                                <h4 className="upcoming-machine">{mant.maquinaria_nombre}</h4>
                                <p className="upcoming-desc">{mant.tipo} - {mant.descripcion}</p>
                            </div>
                            <span className={`priority-badge ${mant.prioridad === 'Alta' ? 'prio-alta' :
                                mant.prioridad === 'Media' ? 'prio-media' :
                                    'prio-baja'
                                }`}>
                                {mant.prioridad}
                            </span>
                        </div>
                        <div className="upcoming-date">
                            <span style={{ marginRight: '5px' }}>📅</span>
                            {format(new Date(mant.fecha_programada), 'dd MMMM', { locale: es })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProximosMantenimientos;
