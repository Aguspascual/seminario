import React from 'react';
import './NotificationToast.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const NotificationToast = ({ type, message, onClose }) => {
    let icon = '';
    let title = '';

    switch (type) {
        case 'success':
            icon = 'fa-check-circle';
            title = 'Éxito';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            title = 'Error';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            title = 'Advertencia';
            break;
        case 'info':
            icon = 'fa-info-circle';
            title = 'Información';
            break;
        default:
            icon = 'fa-info-circle';
            title = 'Notificación';
    }

    return (
        <div className={`notification-toast ${type}`}>
            <div className="icon">
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="content">
                <strong className="title">{title}</strong>
                <p className="message">{message}</p>
            </div>
            <button className="close-btn" onClick={onClose}>
                <i className="fas fa-times"></i>
            </button>
        </div>
    );
};

export default NotificationToast;
