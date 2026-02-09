import React from 'react';
import styles from '../assets/styles/Table.module.css';

/**
 * Componente Tabla Reutilizable
 * 
 * @param {Array} columns - Configuración de columnas
 *   Ej: [
 *     { header: "Nombre", accessor: "nombre" }, // Acceso directo a propiedad
 *     { header: "Acciones", render: (item) => <button...> } // Render personalizado
 *   ]
 * @param {Array} data - Datos a mostrar
 */
const Table = ({ columns, data, isLoading, pagination, emptyMessage = "No hay datos disponibles" }) => {

    // if (isLoading) {
    //     return <div className={styles.emptyState}>Cargando datos...</div>;
    // }

    // if (!data || data.length === 0) {
    //     return <div className={styles.emptyState}>{emptyMessage}</div>;
    // }
    // Moved empty check inside to preserve headers

    return (
        <div className={styles.tableCard}> {/* New wrapper for the card look */}
            <div className={styles.tableScrollContainer}> {/* Wrapper for scrolling only the table */}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className={col.className || ''}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length}>
                                    <div className={styles.loadingContainer}>
                                        <div className={styles.spinner}></div>
                                        <span>Cargando datos...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (data && data.length > 0) ? (
                            data.map((item, rowIndex) => (
                                <tr key={item.id || rowIndex}>
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex} className={col.className || ''}>
                                            {col.render
                                                ? col.render(item)
                                                : item[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length}>
                                    <div className={styles.emptyState}>{emptyMessage}</div>
                                </td>
                            </tr>
                        )}
                        
                        {/* Empty Rows Padding (Only if not loading and data exists but less than minRows) */}
                        {!isLoading && data && pagination && pagination.minRows && data.length > 0 && data.length < pagination.minRows && (
                            Array.from({ length: pagination.minRows - data.length }).map((_, index) => (
                                <tr key={`empty-${index}`} className={styles.emptyRow}>
                                    <td colSpan={columns.length} style={{ height: '50px' }}>&nbsp;</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls - Outside Scroll Container */}
            {pagination && (
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>
                        Total: {pagination.totalItems} registros | Página {pagination.currentPage} de {pagination.totalPages}
                    </div>
                    <div className={styles.paginationControls}>
                        <button 
                            className={styles.paginationBtn} 
                            onClick={pagination.onPrev} 
                            disabled={pagination.currentPage === 1}
                            title="Anterior"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button 
                            className={styles.paginationBtn} 
                            onClick={pagination.onNext} 
                            disabled={pagination.currentPage === pagination.totalPages}
                            title="Siguiente"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;
