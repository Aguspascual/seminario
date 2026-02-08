import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../../context/NotificationContext';
import styles from '../../../assets/styles/modals/Reportes/FaultFormModal.crear.module.css';

const FaultFormModal = ({ onClose }) => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const [formData, setFormData] = useState({
        maquinaria_id: '',
        descripcion_falla: '',
        criticidad: 'Media',
        ubicacion_especifica: '',
        puede_operar: 'No',
        reportado_por: ''
    });
    // const [error, setError] = useState(''); // Removed in favor of toast

    // Fetch Maquinarias
    const { data: maquinarias = [] } = useQuery({
        queryKey: ['maquinarias'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/maquinarias/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.maquinarias || [];
        }
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            const response = await fetch('http://localhost:5000/api/reportes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al reportar falla');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['recent_faults']);
            queryClient.invalidateQueries(['dashboard_data']);
            queryClient.invalidateQueries(['reportes']); // Also invalidate reportes list
            showNotification('success', 'Falla reportada correctamente');
            onClose();
        },
        onError: (err) => {
            showNotification('error', err.message);
        }
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('usuario'));
        if (user && user.id) {
            setFormData(prev => ({ ...prev, reportado_por: user.id }));
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={styles['modal-fondo']} onClick={onClose}>
            <div className={styles['modal-contenido']} onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, paddingBottom: '10px' }}>Reportar Falla</h3>
                    <div className={styles.separator}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ paddingRight: "30px", paddingBottom: "0px", gap: "6px" }}>
                    
                    <div className={styles.formGroup} style={{ margin: "0px" }}>
                        <label className={styles.formLabel} style={{ margin: "0px" }}>Maquinaria Afectada</label>
                        <select name="maquinaria_id" value={formData.maquinaria_id} onChange={handleChange} required style={{ margin: "0px" }}>
                            <option value="">Seleccionar...</option>
                            {maquinarias.map(m => (
                                <option key={m.id_maquinaria} value={m.id_maquinaria}>{m.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className={styles.formGroup} style={{ margin: "0px", flex: 1 }}>
                            <label className={styles.formLabel} style={{ margin: "0px" }}>Criticidad</label>
                            <select name="criticidad" value={formData.criticidad} onChange={handleChange} required style={{ margin: "0px" }}>
                                <option value="Alta">Alta</option>
                                <option value="Media">Media</option>
                                <option value="Baja">Baja</option>
                            </select>
                        </div>
                        <div className={styles.formGroup} style={{ margin: "0px", flex: 1 }}>
                            <label className={styles.formLabel} style={{ margin: "0px" }}>¿Puede Operar?</label>
                            <select name="puede_operar" value={formData.puede_operar} onChange={handleChange} required style={{ margin: "0px" }}>
                                <option value="No">No</option>
                                <option value="Si">Si</option>
                                <option value="Con restricciones">Con restricciones</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup} style={{ margin: "0px" }}>
                        <label className={styles.formLabel} style={{ margin: "0px" }}>Ubicación Específica</label>
                        <input
                            type="text"
                            name="ubicacion_especifica"
                            placeholder="Ej. Motor, Cabina..."
                            value={formData.ubicacion_especifica}
                            onChange={handleChange}
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ margin: "0px" }}>
                        <label className={styles.formLabel} style={{ margin: "0px" }}>Descripción</label>
                        <textarea
                            name="descripcion_falla"
                            placeholder="Describa el problema detalladamente..."
                            value={formData.descripcion_falla}
                            onChange={handleChange}
                            rows="3"
                            required
                            maxLength={200}
                            style={{ resize: 'none' }}
                        ></textarea>
                    </div>

                    {/* Error handled by toast now */}

                    <div className={styles['modal-botones-derecha']}>
                        <button type="button" className={styles['btn-gris']} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles['btn-confirmar']} disabled={mutation.isPending} style={{ gap: '8px' }}>
                            <i className="fa-solid fa-floppy-disk"></i>
                            {mutation.isPending ? 'Enviando...' : 'Reportar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FaultFormModal;
