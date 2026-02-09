import React, { useState } from 'react';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';

const ProximosMantenimientos = ({ mantenimientos }) => {
    const queryClient = useQueryClient();

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: null,
        estado: null,
        nombre: ''
    });

    const mutation = useMutation({
        mutationFn: async ({ id, estado }) => {
            const response = await fetch(`http://localhost:5000/api/mantenimientos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado })
            });

            if (!response.ok) {
                throw new Error('Error al actualizar estado');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['dashboard_data']);
            queryClient.invalidateQueries(['mantenimientos']);
            queryClient.invalidateQueries(['calendar_events']);
            setConfirmModal({ isOpen: false, id: null, estado: null, nombre: '' });
        }
    });

    const requestConfirm = (id, estado, nombre) => {
        setConfirmModal({
            isOpen: true,
            id,
            estado,
            nombre
        });
    };

    const handleConfirmAction = () => {
        if (confirmModal.id && confirmModal.estado) {
            mutation.mutate({ id: confirmModal.id, estado: confirmModal.estado });
        }
    };

    if (!mantenimientos || mantenimientos.length === 0) {
        return (
            <div className="upcoming-container">
                <h2 className="upcoming-title">Próximos 7 días</h2>
                <p className="upcoming-desc">No hay mantenimientos programados.</p>
            </div>
        );
    }

    const isToday = (dateString) => {
        if (!dateString) return false;
        // Ensure we parse the date as local time by appending time if missing, or splitting
        // new Date("2026-02-09") is UTC. new Date("2026-02-09T00:00") is local.
        const dateParts = dateString.split('T')[0].split('-');
        const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today to midnight for comparison if needed, 
        // but actually we just want to compare Y/M/D

        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };


    return (
        <div className="upcoming-container">
            <h2 className="upcoming-title">Próximos 7 días</h2>
            <div className="upcoming-list">
                {mantenimientos.map((mant) => {
                    const isTaskToday = isToday(mant.fecha_programada);
                    return (
                        <div key={mant.id} className="upcoming-item" style={{ borderColor: isTaskToday ? '#3b82f6' : 'transparent', borderWidth: isTaskToday ? '2px' : '0', borderStyle: isTaskToday ? 'solid' : 'none' }}>
                            <div className="upcoming-header">
                                <div>
                                    <h4 className="upcoming-machine">{mant.maquinaria_nombre}</h4>
                                    <p className="upcoming-desc">{mant.tipo} - {mant.descripcion}</p>
                                </div>
                                {isTaskToday ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => requestConfirm(mant.id, 'Completado', mant.maquinaria_nombre)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}
                                            title="Marcar como Completado"
                                        >
                                            <CheckCircle size={24} />
                                        </button>
                                        <button
                                            onClick={() => requestConfirm(mant.id, 'Vencido', mant.maquinaria_nombre)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                            title="Marcar como Vencido"
                                        >
                                            <XCircle size={24} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className={`priority-badge ${mant.prioridad === 'Alta' ? 'prio-alta' :
                                        mant.prioridad === 'Media' ? 'prio-media' :
                                            'prio-baja'
                                        }`}>
                                        {mant.prioridad}
                                    </span>
                                )}
                            </div>
                            <div className="upcoming-date">
                                <span style={{ marginRight: '5px' }}>📅</span>
                                {isTaskToday ? <span style={{ fontWeight: 'bold', color: '#2563eb' }}>HOY</span> : (() => {
                                    const dParts = mant.fecha_programada.split('T')[0].split('-');
                                    const dDate = new Date(dParts[0], dParts[1] - 1, dParts[2]);
                                    return format(dDate, 'dd MMMM', { locale: es });
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="modal-confirmacion-fondo" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
                    <div className="modal-confirmacion-contenido" onClick={e => e.stopPropagation()}>
                        <div className={confirmModal.estado === 'Completado' ? 'modal-confirmacion-icon-green' : 'modal-confirmacion-icon-red'}>
                            {confirmModal.estado === 'Completado' ? <CheckCircle size={48} /> : <XCircle size={48} />}
                        </div>
                        <h3>Confirmar Acción</h3>
                        <p>
                            ¿Estás seguro de marcar el mantenimiento de <strong>{confirmModal.nombre}</strong> como{' '}
                            <span style={{
                                fontWeight: 'bold',
                                color: confirmModal.estado === 'Completado' ? '#10b981' : '#ef4444'
                            }}>
                                {confirmModal.estado}
                            </span>?
                        </p>
                        <div className="modal-confirmacion-botones">
                            <button
                                className="btn-modal-gris"
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                            >
                                Cancelar
                            </button>
                            <button
                                className={confirmModal.estado === 'Completado' ? 'btn-modal-verde' : 'btn-modal-rojo'}
                                onClick={handleConfirmAction}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProximosMantenimientos;
