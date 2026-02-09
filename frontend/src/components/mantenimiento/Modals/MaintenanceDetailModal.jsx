import React from 'react';
import styles from '../../../assets/styles/modals/Maintenance/Maintenance.detalles.module.css';

const MaintenanceDetailModal = ({ onClose, maintenance, onEdit }) => {
    if (!maintenance) return null;

    return (
        <div className={styles['modal-fondo']} onClick={onClose}>
            <div className={styles['modal-contenido']} onClick={e => e.stopPropagation()}>
                <div className={styles['header-container']}>
                    <h3>Detalle de Mantenimiento</h3>
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
                <div className={styles.separator}></div>

                <div className={styles['detalle-grid']}>
                    <div>
                        <strong className={styles.label}>Maquinaria:</strong>
                        <span className={styles.value}>{maintenance.maquinaria_nombre || 'Desconocida'}</span>
                    </div>
                    <div>
                        <strong className={styles.label}>Tipo:</strong>
                        <span className={styles.value}>{maintenance.tipo}</span>
                    </div>
                    <div>
                        <strong className={styles.label}>Fecha:</strong>
                        <span className={styles.value}>{new Date(maintenance.fecha_programada).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <strong className={styles.label}>Hora:</strong>
                        <span className={styles.value}>{maintenance.hora_programada || 'N/A'}</span>
                    </div>
                    <div>
                        <strong className={styles.label}>Prioridad:</strong>
                        <span style={{
                            color: maintenance.prioridad === 'Alta' ? '#dc2626' :
                                maintenance.prioridad === 'Media' ? '#f59e0b' : '#10b981',
                            fontWeight: 'bold'
                        }}>
                            {maintenance.prioridad}
                        </span>
                    </div>
                    <div>
                        <strong className={styles.label}>Responsable:</strong>
                        <span className={styles.value}>{maintenance.responsable_nombre || 'Sin asignar'}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <strong className={styles.label}>Descripción:</strong>
                        <p className={styles['description-box']}>
                            {maintenance.descripcion}
                        </p>
                    </div>
                </div>

                <div className={styles['modal-botones-derecha']}>
                    <button type="button" className={styles['btn-gris']} onClick={onClose}>
                        Cerrar
                    </button>
                    <button
                        type="button"
                        className={styles['btn-editar']}
                        onClick={() => onEdit(maintenance)}
                    >
                        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px' }}></i>
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceDetailModal;
