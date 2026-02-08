import React from 'react';

const MaintenanceDetailModal = ({ onClose, maintenance, onEdit }) => {
    if (!maintenance) return null;

    return (
        <div className="modal-fondo" onClick={onClose}>
            <div className="modal-contenido" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Detalle de Mantenimiento</h3>
                    <span
                        style={{
                            backgroundColor: maintenance.estado === 'Completado' ? '#10b981' :
                                maintenance.estado === 'Vencido' ? '#dc2626' :
                                    maintenance.estado === 'En Proceso' ? '#f59e0b' : '#6b7280',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                        }}
                    >
                        {maintenance.estado}
                    </span>
                </div>

                <div className="detalle-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Maquinaria:</strong>
                        <span>{maintenance.maquinaria_nombre || 'Desconocida'}</span>
                    </div>
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Tipo:</strong>
                        <span>{maintenance.tipo}</span>
                    </div>
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Fecha:</strong>
                        <span>{new Date(maintenance.fecha_programada).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Hora:</strong>
                        <span>{maintenance.hora_programada || 'N/A'}</span>
                    </div>
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Prioridad:</strong>
                        <span style={{
                            color: maintenance.prioridad === 'Alta' ? '#dc2626' :
                                maintenance.prioridad === 'Media' ? '#f59e0b' : '#10b981',
                            fontWeight: 'bold'
                        }}>
                            {maintenance.prioridad}
                        </span>
                    </div>
                    <div>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Responsable:</strong>
                        <span>{maintenance.responsable_nombre || 'Sin asignar'}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>Descripción:</strong>
                        <p style={{ margin: '5px 0', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '5px' }}>
                            {maintenance.descripcion}
                        </p>
                    </div>
                </div>

                <div className="modal-botones" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="button" className="btn-cancelar" onClick={onClose}>
                        Cerrar
                    </button>
                    <button
                        type="button"
                        className="btn-confirmar"
                        onClick={() => onEdit(maintenance)}
                        style={{ backgroundColor: '#2563eb' }}
                    >
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceDetailModal;
