import React, { useState } from 'react';
import styles from '../assets/styles/CambiarContraseña.module.css';
import Head from '../components/Head';
import Footer from '../components/Footer';
import '@fortawesome/fontawesome-free/css/all.min.css';

const CambiarContraseña = () => {
    const [contrasenaActual, setContrasenaActual] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
            const response = await fetch("http://localhost:5000/usuarios/cambiar_contrasena", {
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
            <Head />
            <div className={styles.main}>
                <h6>Perfil &gt; Cambiar Contraseña </h6>
                <div className={styles.tarjeta}>
                    <div className={styles.dentro}>
                        <h2>Cambiar Contraseña</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.datos}>
                                <label>Contraseña Actual</label>
                                <input
                                    type="password"
                                    placeholder="Ingrese su contraseña actual"
                                    value={contrasenaActual}
                                    onChange={(e) => setContrasenaActual(e.target.value)}
                                    required
                                />
                                <label>Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Ingrese su nueva contraseña"
                                    value={nuevaContrasena}
                                    onChange={(e) => setNuevaContrasena(e.target.value)}
                                    required
                                />
                                <label>Confirmar Nueva Contraseña</label>
                                <input
                                    type="password"
                                    placeholder="Confirme su nueva contraseña"
                                    value={confirmarContrasena}
                                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                            {mensaje && <p style={{ color: 'green', marginTop: '10px' }}>{mensaje}</p>}
                            <button type="submit" className={styles.boton} disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CambiarContraseña;