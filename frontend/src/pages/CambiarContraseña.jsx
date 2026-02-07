import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/CambiarContraseña.module.css';
import Head from '../components/Head';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CambiarContraseña = () => {
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Leer usuario de localStorage para el Header
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('usuario')) || {};
        } catch {
            return {};
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        if (nuevaContrasena !== confirmarContrasena) {
            setError("Las nuevas contraseñas no coinciden");
            return;
        }

        if (nuevaContrasena.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/cambiar_contrasena`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    contrasena_actual: contrasenaActual,
                    nueva_contrasena: nuevaContrasena
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMensaje("Contraseña actualizada exitosamente");
                setContrasenaActual("");
                setNuevaContrasena("");
                setConfirmarContrasena("");
            } else {
                setError(data.error || "Error al cambiar la contraseña");
            }

        } catch (err) {
            setError("Error de conexión al servidor");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <Link to="/home">Home</Link> <span>&gt;</span>
                    <Link to="/perfil">Mi Perfil</Link> <span>&gt;</span>
                    <span className={styles.current}>Cambiar Contraseña</span>
                </div>

                <div className={styles.headerSection}>
                    <h2>Cambiar Contraseña</h2>
                </div>

                <div className={styles.contentWrapper}>
                    <div className={styles.tarjeta}>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Contraseña Actual</label>
                                <input
                                    type="password"
                                    placeholder="Ingrese su contraseña actual"
                                    value={contrasenaActual}
                                    onChange={(e) => setContrasenaActual(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Ingrese su nueva contraseña"
                                    value={nuevaContrasena}
                                    onChange={(e) => setNuevaContrasena(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Confirme su nueva contraseña"
                                    value={confirmarContrasena}
                                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <div className={styles.mensajeError}>{error}</div>}
                            {mensaje && <div className={styles.mensajeExito}>{mensaje}</div>}

                            <div className={styles.buttonSection}>
                                <button type="submit" className={styles.boton} disabled={loading}>
                                    {loading ? "Guardando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CambiarContraseña;