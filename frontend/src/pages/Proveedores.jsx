import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import styles from '../assets/styles/Proveedores.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Proveedores = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [formError, setFormError] = useState("");
    
    const queryClient = useQueryClient();

    // 1. Fetching Proveedores
    const { data: proveedores = [], isLoading: loadingProveedores, isError: errorProveedores } = useQuery({
        queryKey: ['proveedores'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/proveedores");
            if (!response.ok) throw new Error("Error al cargar proveedores");
            return response.json();
        }
    });

    // 2. Fetching Tipos de Proveedor
    const { data: tiposProveedor = [] } = useQuery({
        queryKey: ['tiposProveedor'],
        queryFn: async () => {
            const response = await fetch("http://localhost:5000/tipos-proveedor");
            if (!response.ok) throw new Error("Error al cargar tipos");
            return response.json();
        }
    });

    // 3. Mutation para Crear
    const createMutation = useMutation({
        mutationFn: async (nuevoProveedor) => {
            const response = await fetch("http://localhost:5000/proveedores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoProveedor),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error al agregar el proveedor");
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['proveedores']);
            cerrarModal();
        },
        onError: (err) => {
            setFormError(err.message);
        }
    });

    const abrirModal = () => {
        setFormError("");
        setMostrarModal(true);
    };
    
    const cerrarModal = () => setMostrarModal(false);

    const manejarEnvio = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        createMutation.mutate({
            Nombre: formData.get("nombre"),
            Numero: parseInt(formData.get("numero")),
            Email: formData.get("email"),
            idTipo: parseInt(formData.get("tipo"))
        });
    };

    const proveedoresFiltrados = proveedores.filter(
        (proveedor) =>
            proveedor.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            proveedor.Email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <Head />
            <div className={styles.main}>
                <h6>Home &gt; Planta &gt; Gestion de Proveedores</h6>
                <div className={styles.tabla}>
                    <div className={styles.superior}>
                        <div className={styles.subtitulo}>
                            <h2>Gestion de Proveedores</h2>
                            <button className={styles.btn} onClick={abrirModal}>
                                <i className="fa-solid fa-user-plus"></i>
                            </button>
                        </div>
                        <input 
                            type="text" 
                            placeholder='Buscar Proveedor' 
                            className={styles.buscarUsuario}
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Modal */}
                    {mostrarModal && (
                        <div className={styles.modalFondo}>
                            <div className={styles.modalContenido}>
                                <h3>Agregar Proveedor</h3>
                                <form onSubmit={manejarEnvio}>
                                    <input 
                                        type="text" 
                                        name="nombre"
                                        placeholder="Nombre de la empresa" 
                                        required 
                                    />
                                    <input 
                                        type="number" 
                                        name="numero"
                                        placeholder="Número de proveedor" 
                                        required 
                                    />
                                    <input 
                                        type="email" 
                                        name="email"
                                        placeholder="Correo electrónico" 
                                        required 
                                    />
                                    <select name="tipo" required>
                                        <option value="" hidden>Seleccione un tipo</option>
                                        {tiposProveedor.map((tipo) => (
                                            <option key={tipo.idTipo} value={tipo.idTipo}>
                                                {tipo.nombreTipo}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {formError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{formError}</p>}
                                    {createMutation.isError && <p style={{ color: 'red', fontSize: '0.9rem' }}>{createMutation.error.message}</p>}

                                    <div className={styles.modalBotones}>
                                        <button type="submit" className={styles.btnConfirmar} disabled={createMutation.isPending}>
                                            {createMutation.isPending ? 'Guardando...' : 'Agregar'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={cerrarModal} 
                                            className={styles.btnCancelar}
                                            disabled={createMutation.isPending}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <table className={styles.tablaDatos}>
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th className={styles.tipo}>Tipo</th>
                                <th className={styles.numero}>Número</th>
                                <th className={styles.correo}>Correo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingProveedores ? (
                                <tr>
                                    <td colSpan="6" className={styles.loading}>
                                        Cargando proveedores...
                                    </td>
                                </tr>
                            ) : errorProveedores ? (
                                <tr>
                                    <td colSpan="6" className={styles.error}>
                                        Error al cargar datos
                                    </td>
                                </tr>
                            ) : proveedoresFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className={styles.empty}>
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            ) : (
                                proveedoresFiltrados.map((proveedor, index) => (
                                    <tr key={proveedor.idProveedor || index}>
                                        <td className={styles.empresa}>{proveedor.Nombre}</td>
                                        <td className={styles.celdaTipo}>
                                            <span className={styles.badgeTipo}>{proveedor.tipo_proveedor || "Sin tipo"}</span>
                                        </td>
                                        <td className={styles.numero}>{proveedor.Numero}</td>
                                        <td className={styles.correo}>{proveedor.Email}</td>
                                        <td>
                                            <span className={proveedor.Estado ? styles.badgeActivo : styles.badgeInactivo}>
                                                {proveedor.Estado ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className={styles.acciones}>
                                            <button className={styles.btnAction} title="Ver detalles">
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Proveedores;
