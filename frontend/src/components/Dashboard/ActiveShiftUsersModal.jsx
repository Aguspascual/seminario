import React from 'react';
import { X, User, Briefcase, MapPin } from 'lucide-react';

const ActiveShiftUsersModal = ({ isOpen, onClose, turnoData }) => {
    if (!isOpen || !turnoData) return null;

    const { turno, usuarios } = turnoData;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'fadeIn 0.2s ease-out'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', fontWeight: '600' }}>
                            Turno: {turno ? turno.nombre : 'Sin Turno'}
                        </h2>
                        {turno && (
                            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                                {turno.hora_inicio} - {turno.hora_fin} • {usuarios.length} activos
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {usuarios.length > 0 ? (
                        usuarios.map(user => (
                            <div key={user.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#f9fafb',
                                border: '1px solid #f3f4f6'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: '#dbeafe',
                                    color: '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '600',
                                    fontSize: '1rem'
                                }}>
                                    {user.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#374151', fontWeight: '500' }}>{user.nombre}</h4>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280' }}>
                                            <Briefcase size={12} /> {user.rol}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#6b7280' }}>
                                            <MapPin size={12} /> {user.area}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                            <p>No hay usuarios activos en este turno.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ActiveShiftUsersModal;
