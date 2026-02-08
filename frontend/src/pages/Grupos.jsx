import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Head from '../components/Head';
import Table from '../components/Table';
import styles from '../assets/styles/Grupos.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Grupos = () => {
    const user = JSON.parse(localStorage.getItem('usuario'));
    const queryClient = useQueryClient();
    const [mostrarModal, setMostrarModal] = useState(false);
    const [grupoEditar, setGrupoEditar] = useState(null);

    // Form state
    const [nombre, setNombre] = useState('');
    const [turnos, setTurnos] = useState([{ nombre: '', hora_inicio: '', hora_fin: '' }]);

    const { data: grupos = [], isLoading } = useQuery({
        queryKey: ['grupos'],
        queryFn: async () => {
            const res = await fetch("http://127.0.0.1:5000/api/grupos");
            if (!res.ok) throw new Error("Error al cargar grupos");
            return res.json();
        }
    });

    const mutation = useMutation({
        mutationFn: async (grupo) => {
            const url = grupo.id
                ? `http://127.0.0.1:5000/api/grupos/${grupo.id}`
                : "http://127.0.0.1:5000/api/grupos";
            const method = grupo.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(grupo)
            });
            if (!res.ok) throw new Error("Error al guardar grupo");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['grupos']);
            cerrarModal();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            if (!window.confirm("¿Seguro que desea eliminar este grupo?")) return;
            const res = await fetch(`http://127.0.0.1:5000/api/grupos/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Error al eliminar grupo");
        },
        onSuccess: () => queryClient.invalidateQueries(['grupos'])
    });

    const abrirModal = (grupo = null) => {
        if (grupo) {
            setGrupoEditar(grupo);
            setNombre(grupo.nombre);
            setTurnos(grupo.turnos.length > 0 ? grupo.turnos : [{ nombre: '', hora_inicio: '', hora_fin: '' }]);
        } else {
            setGrupoEditar(null);
            setNombre('');
            setTurnos([{ nombre: '', hora_inicio: '', hora_fin: '' }]);
        }
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setGrupoEditar(null);
        setNombre('');
        setTurnos([{ nombre: '', hora_inicio: '', hora_fin: '' }]);
    };

    const handleAddTurno = () => {
        setTurnos([...turnos, { nombre: '', hora_inicio: '', hora_fin: '' }]);
    };

    const handleRemoveTurno = (index) => {
        const newTurnos = [...turnos];
        newTurnos.splice(index, 1);
        setTurnos(newTurnos);
    };

    const handleTurnoChange = (index, field, value) => {
        const newTurnos = [...turnos];
        newTurnos[index][field] = value;
        setTurnos(newTurnos);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validTurnos = turnos.filter(t => t.nombre && t.hora_inicio && t.hora_fin);
        mutation.mutate({
            id: grupoEditar?.id,
            nombre,
            turnos: validTurnos
        });
    };

    return (
        <div className={styles.container}>
            <div style={{ flex: 1 }}>
                <Head user={user} />

                <div className={styles.main}>
                    <div className={styles.breadcrumbs}>
                        <Link to="/home">Home</Link>
                        <span>&gt;</span>
                        <Link to="/home">Planta</Link>
                        <span>&gt;</span>
                        <span className={styles.currentPath}>Grupos y Turnos</span>
                    </div>

                    <div className={styles.headerSection}>
                        <h2>Gestión de Grupos y Turnos</h2>
                    </div>

                    <div className={styles.controlsSection}>
                        <button onClick={() => abrirModal()} className={styles.btnNew}>
                            <i className="fa-solid fa-plus"></i> Nuevo Grupo
                        </button>
                    </div>

                    <div className={styles.tableContainer}>
                        <Table
                            data={grupos}
                            isLoading={isLoading}
                            columns={[
                                { header: 'Grupo', accessor: 'nombre', style: { fontWeight: 'bold' }, className: styles.centerColumn },
                                {
                                    header: 'Turnos',
                                    className: styles.centerColumn,
                                    render: (g) => (
                                        <div className={styles.turnosContainer} style={{ justifyContent: 'center' }}>
                                            {g.turnos.map((t, idx) => (
                                                <span key={idx} className={styles.turnoChip}>
                                                    {t.nombre} ({t.hora_inicio} - {t.hora_fin})
                                                </span>
                                            ))}
                                        </div>
                                    )
                                },
                                {
                                    header: 'Acciones',
                                    className: styles.centerColumn,
                                    render: (g) => (
                                        <div className={styles.actionsContainer} style={{ justifyContent: 'center' }}>
                                            <button onClick={() => abrirModal(g)} className={`${styles.btnAction} ${styles.btnEdit}`}>
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button onClick={() => deleteMutation.mutate(g.id)} className={`${styles.btnAction} ${styles.btnDelete}`}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </div>

                    {/* MODAL */}
                    {mostrarModal && (
                        <div className={styles.modalOverlay} onClick={cerrarModal}>
                            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h3>{grupoEditar ? 'Editar Grupo' : 'Nuevo Grupo'}</h3>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Nombre del Grupo</label>
                                        <input
                                            value={nombre}
                                            onChange={e => setNombre(e.target.value)}
                                            placeholder="Ej: Grupo A"
                                            required
                                            className={styles.inputField}
                                        />
                                    </div>

                                    <div className={styles.separator}></div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Turnos Asociados</label>
                                        {turnos.map((turno, index) => (
                                            <div key={index} className={styles.turnoRow}>
                                                <input
                                                    value={turno.nombre}
                                                    onChange={e => handleTurnoChange(index, 'nombre', e.target.value)}
                                                    placeholder="Nombre (Ej: Mañana)"
                                                    className={styles.turnoInput}
                                                    required
                                                />
                                                <input
                                                    type="time"
                                                    value={turno.hora_inicio}
                                                    onChange={e => handleTurnoChange(index, 'hora_inicio', e.target.value)}
                                                    className={styles.timeInput}
                                                    required
                                                />
                                                <span className={styles.separatorText}>a</span>
                                                <input
                                                    type="time"
                                                    value={turno.hora_fin}
                                                    onChange={e => handleTurnoChange(index, 'hora_fin', e.target.value)}
                                                    className={styles.timeInput}
                                                    required
                                                />
                                                {turnos.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveTurno(index)} className={styles.btnRemoveTurno}>
                                                        <i className="fa-solid fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleAddTurno} className={styles.btnAddTurno}>
                                            <i className="fa-solid fa-plus"></i> Agregar Turno
                                        </button>
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button type="button" onClick={cerrarModal} className={styles.btnCancel}>Cancelar</button>
                                        <button type="submit" className={styles.btnSave}>Guardar</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Grupos;
