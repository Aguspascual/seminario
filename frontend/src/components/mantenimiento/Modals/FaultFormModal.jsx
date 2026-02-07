import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const FaultFormModal = ({ onClose }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        maquinaria_id: '',
        descripcion_falla: '',
        criticidad: 'Media',
        ubicacion_especifica: '',
        puede_operar: 'No',
        reportado_por: 1 // TODO: Get from logged in user context
    });
    const [error, setError] = useState('');

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
            queryClient.invalidateQueries(['dashboard_data']); // Update KPIs
            onClose();
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here we should inject the real user ID if available
        // const user = JSON.parse(localStorage.getItem('usuario'));
        // if (user) formData.reportado_por = user.legajo;

        mutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-fondo" onClick={onClose}>
            <div className="modal-contenido" onClick={e => e.stopPropagation()}>
                <h3 style={{ color: '#dc2626' }}>Reportar Falla de Maquinaria</h3>

                <form onSubmit={handleSubmit}>
                    <select name="maquinaria_id" value={formData.maquinaria_id} onChange={handleChange} required>
                        <option value="">Seleccionar Maquinaria Afectada</option>
                        {maquinarias.map(m => (
                            <option key={m.id_maquinaria} value={m.id_maquinaria}>{m.nombre}</option>
                        ))}
                    </select>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select name="criticidad" value={formData.criticidad} onChange={handleChange} required style={{ flex: 1 }}>
                            <option value="Alta">Criticidad Alta</option>
                            <option value="Media">Criticidad Media</option>
                            <option value="Baja">Criticidad Baja</option>
                        </select>
                        <select name="puede_operar" value={formData.puede_operar} onChange={handleChange} required style={{ flex: 1 }}>
                            <option value="No">No puede operar</option>
                            <option value="Si">Si puede operar</option>
                            <option value="Con restricciones">Con restricciones</option>
                        </select>
                    </div>

                    <input
                        type="text"
                        name="ubicacion_especifica"
                        placeholder="Ubicación específica (ej. Motor, Cabina...)"
                        value={formData.ubicacion_especifica}
                        onChange={handleChange}
                    />

                    <textarea
                        name="descripcion_falla"
                        placeholder="Describa el problema detalladamente..."
                        value={formData.descripcion_falla}
                        onChange={handleChange}
                        rows="4"
                        required
                    ></textarea>

                    {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

                    <div className="modal-botones">
                        <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-confirmar" style={{ backgroundColor: '#dc2626' }} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Enviando...' : 'Reportar Falla'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FaultFormModal;
