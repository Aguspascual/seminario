import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import '../assets/styles/Areas.css';
import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Areas = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [areaActual, setAreaActual] = useState({ id: null, nombre: '' });
    const [formError, setFormError] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [modalEliminar, setModalEliminar] = useState({ mostrar: false, id: null, nombre: '' });
    const itemsPerPage = 10;

    // Obtener usuario del localStorage para el Head
    const user = JSON.parse(localStorage.getItem('usuario'));

    const queryClient = useQueryClient();

    // 1. Fetching con useQuery
    const { data: areas = [], isLoading, isError, error } = useQuery({
        queryKey: ['areas'],
        queryFn: async () => {
            const response = await fetch('http://localhost:5000/areas');
            if (!response.ok) throw new Error('Error al cargar áreas');
            return response.json();
        }
    });

    // 2. Mutation para Crear/Actualizar
    const saveMutation = useMutation({
        mutationFn: async (area) => {
            const url = modoEdicion
                ? `http://localhost:5000/areas/${area.id}`
                : 'http://localhost:5000/areas';
            const method = modoEdicion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: area.nombre })
            });

            if (!response.ok) throw new Error('Error al guardar el área');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['areas']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 3. Mutation para Eliminar
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/areas/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar el área');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['areas']);
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    const abrirModal = (area = null) => {
        setFormError('');
        if (area) {
            setModoEdicion(true);
            setAreaActual({ id: area.id, nombre: area.nombre });
        } else {
            setModoEdicion(false);
            setAreaActual({ id: null, nombre: '' });
        }
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setAreaActual({ id: null, nombre: '' });
        setFormError('');
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        saveMutation.mutate(areaActual);
    };

    const eliminarArea = (area) => {
        setModalEliminar({ mostrar: true, id: area.id, nombre: area.nombre });
    };

    const confirmarEliminacion = () => {
        if (modalEliminar.id) {
            deleteMutation.mutate(modalEliminar.id);
            setModalEliminar({ mostrar: false, id: null, nombre: '' });
        }
    };

    const cancelarEliminacion = () => {
        setModalEliminar({ mostrar: false, id: null, nombre: '' });
    };

    // Filtrado y Paginación (Client-side por ahora)
    const areasFiltradas = areas.filter((area) =>
        area.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    const totalPages = Math.ceil(areasFiltradas.length / itemsPerPage);
    // Ajustar página actual si supera el total tras filtrar
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = areasFiltradas.slice(startIndex, startIndex + itemsPerPage);


    return (
        <div className="container">
            <Head user={user} />
            <div className="main">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/home">Home</Link> <span>&gt;</span>
                    <Link to="/home">Planta</Link> <span>&gt;</span>
                    <span className="current">Gestión de Áreas</span>
                </div>

                <div className="header-section">
                    <h2>Gestión de Áreas</h2>
                </div>

                <div className="controls-section">
                    <input
                        type="text"
                        placeholder='Buscar Áreas...'
                        className="search-input"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                    <button className="btn-add" onClick={() => abrirModal()}>
                        <i className="fa-solid fa-plus"></i> Agregar Área
                    </button>
                </div>

                {/* Modal */}
                {mostrarModal && (
                    <div className="modal-fondo">
                        <div className="modal-contenido">
                            <h3>{modoEdicion ? 'Editar Área' : 'Agregar Área'}</h3>
                            <form onSubmit={manejarEnvio}>
                                <input
                                    type="text"
                                    placeholder="Nombre del Área"
                                    required
                                    value={areaActual.nombre}
                                    onChange={(e) => setAreaActual({ ...areaActual, nombre: e.target.value })}
                                    disabled={saveMutation.isPending}
                                />
                                {formError && <p style={{ color: 'red' }}>{formError}</p>}
                                {saveMutation.isError && <p style={{ color: 'red' }}>{saveMutation.error.message}</p>}
                                <div className="modal-botones">
                                    <button type="button" onClick={cerrarModal} className="btn-cancelar" disabled={saveMutation.isPending}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-confirmar" disabled={saveMutation.isPending}>
                                        {saveMutation.isPending ? 'Guardando...' : (modoEdicion ? 'Guardar' : 'Agregar')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Eliminar */}
                {modalEliminar.mostrar && (
                    <div className="modal-fondo">
                        <div className="modal-contenido">
                            <h3>Eliminar Área</h3>
                            <p>Estas seguro de eliminar esta area <strong>{modalEliminar.nombre}</strong>?</p>
                            <div className="modal-botones">
                                <button onClick={cancelarEliminacion} className="btn-cancelar">
                                    Cancelar
                                </button>
                                <button onClick={confirmarEliminacion} className="btn-confirmar" style={{ backgroundColor: '#ef4444' }}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="table-container-areas">
                    <Table
                        isLoading={isLoading}
                        data={currentData}
                        columns={[
                            { header: "Nombre", accessor: "nombre", className: "column-name" },
                            {
                                header: "Acciones",
                                className: "column-actions",
                                render: (area) => (
                                    <>
                                        <button className="action-btn" onClick={() => abrirModal(area)} title="Editar">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="action-btn delete-btn" onClick={() => eliminarArea(area)} title="Eliminar">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </>
                                )
                            }
                        ]}
                    />
                </div>

                {/* Paginación - Solo si hay más de una página */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Anterior
                        </button>
                        <span className="pagination-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
            {/* Footer removido intencionalmente */}
        </div>
    );
};
export default Areas;
