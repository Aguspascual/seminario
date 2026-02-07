import React from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Acción',
    message = '¿Estás seguro de continuar?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDanger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-fondo" onClick={onClose}>
            <div className="modal-contenido" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <h3 style={{ color: isDanger ? '#dc2626' : '#1F3A52' }}>{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="modal-botones">
                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={onClose}
                        style={{ backgroundColor: '#6b7280' }} // Gray for cancel
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className="btn-confirmar"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{ backgroundColor: isDanger ? '#dc2626' : '#166534' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
