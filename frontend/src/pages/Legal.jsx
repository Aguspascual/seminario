import React, { useState, useEffect } from 'react';
// IMPORTANTE: Importamos el Navbar
import Head from '../components/Head';
// Importamos los nuevos estilos modernos
import styles from '../assets/styles/Legal.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Legal = ({ user }) => {
    const [docs, setDocs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [nuevoDoc, setNuevoDoc] = useState({
        titulo: '',
        entidad: '',
        vencimiento: '',
        archivo: null
    });

    const [filtro, setFiltro] = useState("");
    const apiUrl = import.meta.env.VITE_API_URL;

    // --- LOGICA (Igual que antes) ---
    const fetchDocs = async () => {
        try {
            const res = await fetch(`${apiUrl}/legal/lista`);
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (error) {
            console.error("Error conexión:", error);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('titulo', nuevoDoc.titulo);
        formData.append('entidad', nuevoDoc.entidad);
        formData.append('vencimiento', nuevoDoc.vencimiento);
        formData.append('archivo', nuevoDoc.archivo);

        try {
            const response = await fetch(`${apiUrl}/legal/crear`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setShowModal(false);
                setNuevoDoc({ titulo: '', entidad: '', vencimiento: '', archivo: null });
                fetchDocs();
            } else {
                alert("Error al guardar");
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => setNuevoDoc({ ...nuevoDoc, archivo: e.target.files[0] });
    const handleDownload = (url) => window.open(`${apiUrl}${url}`, '_blank');

    const getBadgeClass = (estado) => {
        if (!estado) return '';
        const st = estado.toLowerCase();
        if (st === 'vencido') return styles.badgeDanger;
        if (st === 'por vencer') return styles.badgeWarning;
        return styles.badgeOk;
    };

    const docsFiltrados = docs.filter(doc =>
        doc.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        (doc.entidad && doc.entidad.toLowerCase().includes(filtro.toLowerCase()))
    );

    const totalDocs = docs.length;
    const vencidos = docs.filter(d => d.estado === 'Vencido').length;
    const porVencer = docs.filter(d => d.estado === 'Por Vencer').length;

    return (
        <>
            {/* 1. NAVBAR IMPORTADO AQUÍ */}
            <Head user={user} />

            {/* 2. CONTENEDOR PRINCIPAL */}
            <div className={styles.legalContainer}>

                {/* Cabecera */}
                <div className={styles.headerSection}>
                    <div>
                        <h1 className={styles.title}>Documentación Legal</h1>
                        <p style={{ color: '#64748B', margin: '5px 0 0 0' }}>Gestión de permisos, habilitaciones y seguros.</p>
                    </div>
                    <button className={styles.btnTopSmall} onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> Nuevo Documento
                    </button>
                </div>

                {/* KPIs / Tarjetas */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.cardOk}`}>
                        <div>
                            <h3>Documentos Totales</h3>
                            <p className={styles.statNumber}>{totalDocs}</p>
                        </div>
                        <div style={{ background: '#D1FAE5', padding: '15px', borderRadius: '50%' }}>
                            <i className="fas fa-folder-open fa-lg" style={{ color: '#059669' }}></i>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.cardWarning}`}>
                        <div>
                            <h3>Próximos a Vencer</h3>
                            <p className={styles.statNumber}>{porVencer}</p>
                        </div>
                        <div style={{ background: '#FEF3C7', padding: '15px', borderRadius: '50%' }}>
                            <i className="fas fa-clock fa-lg" style={{ color: '#D97706' }}></i>
                        </div>
                    </div>

                    <div className={`${styles.statCard} ${styles.cardDanger}`}>
                        <div>
                            <h3>Vencidos / Críticos</h3>
                            <p className={styles.statNumber}>{vencidos}</p>
                        </div>
                        <div style={{ background: '#FEE2E2', padding: '15px', borderRadius: '50%' }}>
                            <i className="fas fa-exclamation-triangle fa-lg" style={{ color: '#DC2626' }}></i>
                        </div>
                    </div>
                </div>

                {/* Tabla Moderna */}
                <div className={styles.tableContainer}>
                    <div style={{ position: 'relative' }}>
                        <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '15px', color: '#94a3b8' }}></i>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o entidad..."
                            className={styles.searchBar}
                            style={{ paddingLeft: '40px' }}
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>

                    <table className={styles.docTable}>
                        <thead>
                            <tr>
                                <th>Documento</th>
                                <th>Entidad</th>
                                <th>Vencimiento</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docsFiltrados.map((doc) => (
                                <tr key={doc.id}>
                                    <td style={{ fontWeight: '600', color: '#1F3A52' }}>
                                        <i className="far fa-file-pdf" style={{ color: '#EF4444', marginRight: '10px' }}></i>
                                        {doc.titulo}
                                    </td>
                                    <td>{doc.entidad}</td>
                                    <td>{doc.vencimiento}</td>
                                    <td>
                                        <span className={`${styles.badge} ${getBadgeClass(doc.estado)}`}>
                                            {doc.estado}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                                        {/* INTENTA ENCONTRAR EL ARCHIVO CON CUALQUIER NOMBRE */}
                                        {(doc.archivoUrl || doc.archivo_url || doc.archivo) ? (
                                            <a
                                                /* Usa la variable que haya encontrado */
                                                href={`${apiUrl}${doc.archivoUrl || doc.archivo_url || doc.archivo}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.btnDownload}
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
                                                Descargar
                                            </a>
                                        ) : (
                                            /* Solo muestra esto si DE VERDAD la base de datos tiene ese campo vacío */
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin archivo</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {docsFiltrados.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No se encontraron documentos.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal (Popup) */}
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, whiteSpace: 'nowrap', color: '#1F3A52' }}>Subir Documento</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
                            </div>

                            <form onSubmit={handleSave}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Nombre del Documento</label>
                                    <input type="text" className={styles.inputField} required
                                        value={nuevoDoc.titulo} onChange={(e) => setNuevoDoc({ ...nuevoDoc, titulo: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Entidad Emisora</label>
                                    <input type="text" className={styles.inputField} required
                                        value={nuevoDoc.entidad} onChange={(e) => setNuevoDoc({ ...nuevoDoc, entidad: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Fecha de Vencimiento</label>
                                    <input type="date" className={styles.inputField} required
                                        value={nuevoDoc.vencimiento} onChange={(e) => setNuevoDoc({ ...nuevoDoc, vencimiento: e.target.value })}
                                    />
                                </div>
                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#475569' }}>Archivo PDF</label>
                                    <input type="file" accept="application/pdf" className={styles.inputField} required onChange={handleFileChange} />
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        className={styles.btnCancel}
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={styles.btnAdd}
                                    >
                                        {loading ? "Subiendo..." : (
                                            <>
                                                <i className="fa-solid fa-save" style={{ marginRight: '5px' }}></i> Guardar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default Legal;
