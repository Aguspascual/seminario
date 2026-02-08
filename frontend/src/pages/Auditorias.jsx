import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import '../assets/styles/Auditorias.css';
import Head from '../components/Head';
import Table from '../components/Table';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Auditorias = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalFinalizar, setMostrarModalFinalizar] = useState(false);
    const [auditoriaAFinalizar, setAuditoriaAFinalizar] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [fechaFiltro, setFechaFiltro] = useState(""); // Nuevo estado para fecha
    const [formError, setFormError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const queryClient = useQueryClient();
    const user = JSON.parse(localStorage.getItem('usuario'));

    // 1. Fetching de Auditorias
    const { data: auditorias = [], isLoading, isError, error } = useQuery({
        queryKey: ['auditorias'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/auditorias");
            if (!response.ok) throw new Error("Error al cargar auditorias");
            return response.json();
        }
    });

    // 2. Mutation para Crear (SOLO datos basicos)
    const crearMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await fetch("http://localhost:5000/auditorias", {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al crear auditoria");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    // 3. Mutation para Finalizar (Subir archivo)
    const finalizarMutation = useMutation({
        mutationFn: async ({ id, formData }) => {
            const response = await fetch(`http://localhost:5000/auditorias/${id}/finalizar`, {
                method: "POST",
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al finalizar auditoria");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
            cerrarModalFinalizar();
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    // 4. Mutation para Eliminar
    const eliminarMutation = useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`http://localhost:5000/auditorias/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Error al eliminar auditoria");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['auditorias']);
        },
        onError: (err) => {
            alert(err.message);
        }
    });

    // Filtrado
    const auditoriasFiltradas = auditorias.filter((aud) => {
        const matchTexto = aud.lugar?.toLowerCase().includes(busqueda.toLowerCase()) ||
            aud.estado?.toLowerCase().includes(busqueda.toLowerCase());
        const matchFecha = fechaFiltro ? aud.fecha === fechaFiltro : true;
        return matchTexto && matchFecha;
    });

    const paginatedAuditorias = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return auditoriasFiltradas.slice(startIndex, startIndex + itemsPerPage);
    }, [auditoriasFiltradas, currentPage]);

    const totalPages = Math.ceil(auditoriasFiltradas.length / itemsPerPage);


    const abrirModal = () => {
        setFormError("");
        setMostrarModal(true);
    };
    const cerrarModal = () => setMostrarModal(false);

    const abrirModalFinalizar = (aud) => {
        setAuditoriaAFinalizar(aud);
        setMostrarModalFinalizar(true);
    }
    const cerrarModalFinalizar = () => {
        setAuditoriaAFinalizar(null);
        setMostrarModalFinalizar(false);
    }

    const manejarEnvio = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        crearMutation.mutate(formData);
    };

    const manejarFinalizar = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (auditoriaAFinalizar) {
            finalizarMutation.mutate({ id: auditoriaAFinalizar.id, formData });
        }
    };

    const manejarEliminar = (id) => {
        if (window.confirm("¿Seguro que deseas eliminar esta auditoría?")) {
            eliminarMutation.mutate(id);
        }
    };

    return (
        <div className="container">
            <Head user={user} />
            <div className="main">
                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <Link to="/home">Home</Link> <span>/</span>
                    <Link to="/home">Planta</Link> <span>/</span>
                    <span className="current">Gestión de Auditorias</span>
                </div>

                <div className="header-section">
                    <h2>Gestión de Auditorias</h2>
                </div>

                <div className="controls-section">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder='Buscar por lugar o estado...'
                            className="search-input"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                        <input
                            type="date"
                            className="search-input"
                            style={{ width: '150px' }}
                            value={fechaFiltro}
                            onChange={(e) => setFechaFiltro(e.target.value)}
                        />
                    </div>
                    <button className="btn-add" onClick={abrirModal}>
                        <i className="fa-solid fa-plus"></i> Nueva Auditoria
                    </button>
                </div>

                {/* Modal Creación */}
                {mostrarModal && (
                    <div className="modal-fondo">
                        <div className="modal-contenido">
                            <h3>Programar Auditoria</h3>
                            <form onSubmit={manejarEnvio}>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha</label>
                                    <input type="date" name="fecha" required />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora</label>
                                    <input type="time" name="hora" required />
                                </div>
                                <select name="lugar" required>
                                    <option value="" hidden>Seleccione un Lugar</option>
                                    <option value="Planta">Planta</option>
                                    <option value="Oficina">Oficina</option>
                                    <option value="Almacen">Almacén</option>
                                </select>

                                {formError && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '10px' }}>{formError}</p>}

                                <div className="modal-botones">
                                    <button type="button" onClick={cerrarModal} className="btn-cancelar">Cancelar</button>
                                    <button type="submit" className="btn-confirmar" disabled={crearMutation.isPending}>
                                        {crearMutation.isPending ? 'Programando...' : 'Programar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Finalizar */}
                {mostrarModalFinalizar && (
                    <div className="modal-fondo">
                        <div className="modal-contenido">
                            <h3>Finalizar Auditoria</h3>
                            <p style={{ marginBottom: '15px' }}>Sube el archivo para completar la auditoría.</p>
                            <form onSubmit={manejarFinalizar}>
                                <input type="file" name="archivo" accept='application/pdf' required />

                                <div className="modal-botones">
                                    <button type="button" onClick={cerrarModalFinalizar} className="btn-cancelar">Cancelar</button>
                                    <button type="submit" className="btn-confirmar" disabled={finalizarMutation.isPending}>
                                        {finalizarMutation.isPending ? 'Subiendo...' : 'Finalizar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <Table
                    isLoading={isLoading}
                    data={paginatedAuditorias}
                    columns={[
                        {
                            header: "Fecha y Hora",
                            render: (aud) => `${aud.fecha} - ${aud.hora}`
                        },
                        {
                            header: "Estado",
                            render: (aud) => (
                                <span style={{
                                    padding: '5px 10px',
                                    borderRadius: '15px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    backgroundColor:
                                        aud.estado === 'Programado' ? '#e0f2fe' :
                                            aud.estado === 'En Proceso' ? '#fef3c7' :
                                                '#dcfce7',
                                    color:
                                        aud.estado === 'Programado' ? '#0369a1' :
                                            aud.estado === 'En Proceso' ? '#b45309' :
                                                '#15803d'
                                }}>
                                    {aud.estado}
                                </span>
                            )
                        },
                        { header: "Área", accessor: "lugar" },
                        {
                            header: "Archivo",
                            render: (aud) => aud.archivo_path ? (
                                <a
                                    href={`/assets/auditorias/${aud.archivo_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="action-btn"
                                    title="Descargar PDF"
                                >
                                    <i className="fas fa-download"></i>
                                </a>
                            ) : <span style={{ color: '#ccc' }}>-</span>
                        },
                        {
                            header: "Acciones",
                            render: (aud) => (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    {aud.estado === 'En Proceso' && (
                                        <button
                                            className="action-btn"
                                            onClick={() => abrirModalFinalizar(aud)}
                                            title="Subir Archivo / Finalizar"
                                            style={{ color: '#0284c7' }}
                                        >
                                            <i className="fa-solid fa-upload"></i>
                                        </button>
                                    )}
                                    {aud.estado === 'Programado' && (
                                        <button
                                            className="action-btn"
                                            onClick={() => manejarEliminar(aud.id)}
                                            title="Eliminar"
                                            style={{ color: '#ef4444' }}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    pagination={{
                        currentPage: currentPage,
                        totalPages: totalPages,
                        totalItems: auditoriasFiltradas.length,
                        onNext: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
                        onPrev: () => setCurrentPage(p => Math.max(1, p - 1))
                    }}
                />
            </div>
        </div>
    );
};

export default Auditorias;