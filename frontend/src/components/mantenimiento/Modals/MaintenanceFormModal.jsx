import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../../../assets/styles/modals/Maintenance/MaintenanceForm.module.css';

const MaintenanceFormModal = ({ onClose, initialData = null, onDelete }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        maquinaria_id: '',
        tipo: 'Preventivo',
        fecha_programada: '',
        hora_programada: '',
        responsable_id: '',
        prioridad: 'Media',
        tiempo_estimado: '',
        descripcion: '',
        estado: 'Pendiente'
    });
    const [error, setError] = useState('');

    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                maquinaria_id: initialData.maquinaria_id || '',
                fecha_programada: initialData.fecha_programada ? initialData.fecha_programada.split('T')[0] : '',
                hora_programada: initialData.hora_programada || '',
                responsable_id: initialData.responsable_id || '',
                descripcion: initialData.descripcion || ''
            });
        }
    }, [initialData]);

    // Fetch Maquinarias
    const { data: maquinarias = [] } = useQuery({
        queryKey: ['maquinarias'],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/maquinarias/', { // Added trailing slash
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) return [];
            const data = await response.json();
            return data.maquinarias || [];
        }
    });

    // Fetch Videos/Usuarios (Responsables)
    // Assuming we can use /usuarios endpoint and filter or backend returns list
    const { data: usuarios = [] } = useQuery({
        queryKey: ['usuarios_responsables'],
        queryFn: async () => {
            const response = await fetch('http://localhost:5000/usuarios');
            if (!response.ok) return [];
            const data = await response.json();
            return data.usuarios || [];
        }
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            const url = initialData
                ? `http://localhost:5000/api/mantenimientos/${initialData.id}`
                : 'http://localhost:5000/api/mantenimientos';

            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Error al guardar mantenimiento');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['mantenimientos']);
            queryClient.invalidateQueries(['calendar_events']);
            queryClient.invalidateQueries(['dashboard_data']);
            onClose();
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleDelete = () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = () => {
        onDelete(initialData.id);
        setShowConfirmDelete(false);
        onClose();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <div className={styles['modal-fondo']} onClick={onClose}>
                <div className={styles['modal-contenido']} onClick={e => e.stopPropagation()}>
                    <h3>{initialData ? 'Editar Mantenimiento' : 'Nueva Tarea de Mantenimiento'}</h3>
                    <div className={styles.separator}></div>

                    <form onSubmit={handleSubmit} style={{ marginTop: '5px', gap: '0px' }}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Maquinaria</label>
                            <select name="maquinaria_id" value={formData.maquinaria_id} onChange={handleChange} required>
                                <option value="">Seleccionar Maquinaria</option>
                                {maquinarias.map(m => (
                                    <option key={m.id_maquinaria} value={m.id_maquinaria}>{m.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tipo de Mantenimiento</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                                <option value="Predictivo">Predictivo</option>
                            </select>
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Fecha Programada</label>
                                <input
                                    type="date"
                                    name="fecha_programada"
                                    value={formData.fecha_programada}
                                    onChange={handleChange}
                                    min={(() => {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        // Format as YYYY-MM-DD using local time
                                        const year = tomorrow.getFullYear();
                                        const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                                        const day = String(tomorrow.getDate()).padStart(2, '0');
                                        return `${year}-${month}-${day}`;
                                    })()}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Hora</label>
                                <input
                                    type="time"
                                    name="hora_programada"
                                    value={formData.hora_programada}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Prioridad</label>
                            <select name="prioridad" value={formData.prioridad} onChange={handleChange} required>
                                <option value="Alta">Prioridad Alta</option>
                                <option value="Media">Prioridad Media</option>
                                <option value="Baja">Prioridad Baja</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Responsable</label>
                            <select name="responsable_id" value={formData.responsable_id} onChange={handleChange}>
                                <option value="">Asignar Responsable (Opcional)</option>
                                {usuarios.map(u => (
                                    <option key={u.id} value={u.legajo || u.id}>{u.nombre} {u.apellido}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tiempo Estimado (hs)</label>
                            <input
                                type="number"
                                name="tiempo_estimado"
                                placeholder="Ej: 2.5"
                                value={formData.tiempo_estimado}
                                onChange={handleChange}
                                step="0.5"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Descripción</label>
                            <textarea
                                name="descripcion"
                                placeholder="Descripción de la tarea..."
                                value={formData.descripcion}
                                style={{
                                    marginBottom: '0px'
                                }}
                                onChange={handleChange}
                                rows="3"
                                required
                            ></textarea>
                        </div>

                        {error && <p style={{ color: 'red', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</p>}

                        <div className={styles['modal-botones-derecha']} style={{ justifyContent: initialData ? 'space-between' : 'flex-end', margin: '20px 0 0 0' }}>
                            {initialData && (
                                <button type="button" className={styles['btn-rojo']} onClick={handleDelete} style={{ width: 'auto' }}>
                                    Eliminar
                                </button>
                            )}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" className={styles['btn-gris']} onClick={onClose}>Cancelar</button>
                                <button type="submit" className={styles['btn-confirmar']} disabled={mutation.isPending}>
                                    <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }}></i>
                                    {mutation.isPending ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Confirmación Eliminar */}
            {showConfirmDelete && (
                <div className={styles['modal-confirmacion-fondo']} onClick={() => setShowConfirmDelete(false)}>
                    <div className={styles['modal-confirmacion-contenido']} onClick={e => e.stopPropagation()}>
                        <div style={{ marginBottom: "15px", color: "#ef4444", fontSize: "3rem" }}>
                            <i className="fa-solid fa-circle-exclamation"></i>
                        </div>
                        <h3>¿Estás seguro?</h3>
                        <p>¿Deseas eliminar este mantenimiento? Esta acción no se puede deshacer.</p>
                        <div className={styles['modal-confirmacion-botones']}>
                            <button onClick={() => setShowConfirmDelete(false)} className={styles['btn-gris-modal']}>Cancelar</button>
                            <button onClick={confirmDelete} className={styles['btn-rojo-confirm']}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MaintenanceFormModal;
