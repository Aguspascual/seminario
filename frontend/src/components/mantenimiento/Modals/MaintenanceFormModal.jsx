import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
        if (window.confirm('¿Estás seguro de eliminar este mantenimiento?')) {
            onDelete(initialData.id);
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-fondo" onClick={onClose}>
            <div className="modal-contenido" onClick={e => e.stopPropagation()}>
                <h3>{initialData ? 'Editar Mantenimiento' : 'Nueva Tarea de Mantenimiento'}</h3>

                <form onSubmit={handleSubmit}>
                    <select name="maquinaria_id" value={formData.maquinaria_id} onChange={handleChange} required>
                        <option value="">Seleccionar Maquinaria</option>
                        {maquinarias.map(m => (
                            <option key={m.id_maquinaria} value={m.id_maquinaria}>{m.nombre}</option>
                        ))}
                    </select>

                    <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                        <option value="Preventivo">Preventivo</option>
                        <option value="Correctivo">Correctivo</option>
                        <option value="Predictivo">Predictivo</option>
                    </select>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            name="fecha_programada"
                            value={formData.fecha_programada}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="time"
                            name="hora_programada"
                            value={formData.hora_programada}
                            onChange={handleChange}
                        />
                    </div>

                    <select name="prioridad" value={formData.prioridad} onChange={handleChange} required>
                        <option value="Alta">Prioridad Alta</option>
                        <option value="Media">Prioridad Media</option>
                        <option value="Baja">Prioridad Baja</option>
                    </select>

                    <select name="estado" value={formData.estado} onChange={handleChange} required>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completado</option>
                        <option value="Vencido">Vencido</option>
                    </select>

                    <select name="responsable_id" value={formData.responsable_id} onChange={handleChange}>
                        <option value="">Asignar Responsable (Opcional)</option>
                        {usuarios.map(u => (
                            <option key={u.id} value={u.legajo || u.id}>{u.nombre} {u.apellido}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="tiempo_estimado"
                        placeholder="Tiempo Estimado (horas)"
                        value={formData.tiempo_estimado}
                        onChange={handleChange}
                        step="0.5"
                    />

                    <textarea
                        name="descripcion"
                        placeholder="Descripción de la tarea..."
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        required
                    ></textarea>

                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                    <div className="modal-botones" style={{ justifyContent: 'space-between' }}>
                        {initialData && (
                            <button type="button" className="btn-cancelar" style={{ backgroundColor: '#dc2626' }} onClick={handleDelete}>
                                Eliminar
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn-confirmar" disabled={mutation.isPending}>
                                {mutation.isPending ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaintenanceFormModal;
