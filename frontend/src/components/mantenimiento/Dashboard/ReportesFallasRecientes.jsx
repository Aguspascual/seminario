import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import format from 'date-fns/format';
import es from 'date-fns/locale/es';
import ConfirmationModal from '../Modals/ConfirmationModal';

const ReportesFallasRecientes = ({ reportes, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);

    const handleDeleteClick = (id) => {
        setSelectedReportId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedReportId) {
            onDelete(selectedReportId);
        }
    };

    if (!reportes || reportes.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm h-full">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Reportes de Fallas</h2>
                <p className="text-gray-500 text-sm">No hay reportes recientes.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm h-full font-sans">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Reportes de Fallas</h2>
            <div className="space-y-4">
                {reportes.map((reporte) => (
                    <div key={reporte.id} className="group flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors relative">
                        <div className="flex-shrink-0">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 mt-2"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="fault-report-machine text-sm font-medium">
                                {reporte.maquinaria_nombre}
                            </p>
                            <p className="fault-report-desc text-xs truncate">
                                {reporte.descripcion_falla}
                            </p>
                            <div className="fault-report-meta mt-1 flex items-center text-xs">
                                <span>{reporte.reportador_nombre}</span>
                                <span className="mx-1">•</span>
                                <span>{reporte.fecha_reporte ? format(new Date(reporte.fecha_reporte), 'dd/MM HH:mm', { locale: es }) : ''}</span>
                            </div>
                        </div>
                        <div>
                            <span className={`text-xs px-2 py-0.5 rounded ${reporte.estado_reporte === 'Pendiente' ? 'bg-gray-200 text-gray-800' :
                                reporte.estado_reporte === 'Asignado' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {reporte.estado_reporte}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(reporte.id);
                            }}
                            className="absolute right-2 top-8 opacity-0 group-hover:opacity-100 transition-opacity p-2 !bg-red-500 !text-white hover:!bg-red-600 rounded-full shadow-sm z-10 border-none"
                            style={{ backgroundColor: '#ef4444', color: 'white' }}
                            title="Eliminar reporte"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Reporte"
                message="¿Estás seguro de que deseas eliminar este reporte de falla? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDanger={true}
            />
        </div>
    );
};

export default ReportesFallasRecientes;
