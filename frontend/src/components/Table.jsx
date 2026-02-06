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
const Table = ({ columns, data, isLoading, emptyMessage = "No hay datos disponibles" }) => {

    if (isLoading) {
        return <div className={styles.emptyState}>Cargando datos...</div>;
    }

    if (!data || data.length === 0) {
        return <div className={styles.emptyState}>{emptyMessage}</div>;
    }

    return (
        <div className={styles.tableContainer}>
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
                    {data.map((item, rowIndex) => (
                        <tr key={item.id || rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className={col.className || ''}>
                                    {col.render
                                        ? col.render(item)
                                        : item[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
