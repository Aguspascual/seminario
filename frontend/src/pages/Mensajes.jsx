import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../assets/styles/Mensajes.module.css'; // Creating new CSS file
import Head from '../components/Head';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Mensajes = () => {
    const [conversaciones, setConversaciones] = useState([]);
    const [chatActivo, setChatActivo] = useState(null); // Usuario seleccionado
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [usuariosBusqueda, setUsuariosBusqueda] = useState([]); // Resultados de búsqueda para nuevo chat
    const [mostrandoResultados, setMostrandoResultados] = useState(false);
    const messagesEndRef = useRef(null);
    const searchInputRef = useRef(null);
    const [userId, setUserId] = useState(null); // ID del usuario local

    // Leer usuario de localStorage para el Header
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('usuario')) || {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        // Obtener ID del usuario local del token o localStorage
        if (user) setUserId(user.id || user.Legajo); // Adaptar según modelo
        obtenerConversaciones();

        // Polling para mensajes nuevos cada 5 segundos
        const interval = setInterval(() => {
            obtenerConversaciones();
            if (chatActivo) {
                obtenerChat(chatActivo.id, false); // false = no scrollear agresivamente si ya estoy viendo
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [chatActivo, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const obtenerConversaciones = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mensajes/conversaciones`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversaciones(data);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const obtenerChat = async (contactoId, shouldScroll = true) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mensajes/${contactoId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMensajes(data);
                if (shouldScroll) setTimeout(scrollToBottom, 100);
                // Actualizar conversaciones para limpiar no leídos visualmente
                obtenerConversaciones();
            }
        } catch (error) {
            console.error("Error fetching chat:", error);
        }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();
        if (!nuevoMensaje.trim() || !chatActivo) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/mensajes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    idUsuarioReceptor: chatActivo.id,
                    mensaje: nuevoMensaje
                })
            });

            if (response.ok) {
                setNuevoMensaje("");
                obtenerChat(chatActivo.id);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const buscarUsuarios = async (termino) => {
        setBusqueda(termino);
        if (termino.length < 2) {
            setMostrandoResultados(false);
            return;
        }

        // Reusamos el endpoint de usuarios, filtramos en cliente por simplicidad o backend si soporta filtro
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, { // Endpoint existente
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // NOTA: El endpoint /usuarios actual podría no estar protegido o requerir token si se cambió. 
            // Si requiere token, hay que enviarlo. Si devuelve todos, filtramos.
            // Asumimos que devuelve todos.
            if (response.ok) {
                const data = await response.json(); // data structure: { usuarios: [], ... } based on previous view
                const lista = data.usuarios || data; // Handle pagination structure if present

                const filtrados = lista.filter(u =>
                    u.nombre.toLowerCase().includes(termino.toLowerCase()) &&
                    u.id !== userId // No mostrarse a sí mismo
                );
                setUsuariosBusqueda(filtrados);
                setMostrandoResultados(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const seleccionarChat = (usuario) => {
        setChatActivo(usuario);
        setMostrandoResultados(false);
        setBusqueda("");
        obtenerChat(usuario.id);
    };

    return (
        <div className={styles.container}>
            <Head user={user} />
            <div className={styles.main}>
                {/* Breadcrumbs */}
                <div className={styles.breadcrumbs}>
                    <Link to="/home">Home</Link> <span>/</span>
                    <span className={styles.current}>Mensajes</span>
                </div>

                <div className={styles.headerSection}>
                    <h2>Mensajes</h2>
                </div>

                <div className={styles.mensajeriaContainer}>
                    {/* Panel Izquierdo: Lista de Chats */}
                    <div className={styles.listaChats}>
                        <div className={styles.buscador}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Buscar usuario..."
                                value={busqueda}
                                onChange={(e) => buscarUsuarios(e.target.value)}
                            />
                            <button
                                className={styles.btnNuevo}
                                title="Nueva Conversación"
                                onClick={() => {
                                    setChatActivo(null); // Opcional: limpiar chat actual
                                    searchInputRef.current?.focus();
                                }}
                            >
                                <i className="fas fa-edit"></i>
                            </button>
                        </div>

                        {mostrandoResultados ? (
                            <ul className={styles.listaUsuarios}>
                                {usuariosBusqueda.map(u => (
                                    <li key={u.id} onClick={() => seleccionarChat(u)} className={styles.usuarioItem}>
                                        <div className={styles.avatar}>{u.nombre.charAt(0)}</div>
                                        <div className={styles.info}>
                                            <span className={styles.nombre}>{u.nombre}</span>
                                            <span className={styles.rol}>{u.rol}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className={styles.listaConversaciones}>
                                {conversaciones.map(c => (
                                    <li key={c.id} onClick={() => seleccionarChat(c)} className={`${styles.conversacionItem} ${chatActivo?.id === c.id ? styles.activo : ''}`}>
                                        <div className={styles.avatar}>{c.nombre.charAt(0)}</div>
                                        <div className={styles.info}>
                                            <div className={styles.topInfo}>
                                                <span className={styles.nombre}>{c.nombre}</span>
                                                <span className={styles.fecha}>{c.fechaUltimo ? new Date(c.fechaUltimo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                            <div className={styles.bottomInfo}>
                                                <span className={styles.preview}>{c.ultimoMensaje}</span>
                                                {c.noLeidos > 0 && <span className={styles.badge}>{c.noLeidos}</span>}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Panel Derecho: Chat */}
                    <div className={styles.areaChat}>
                        {chatActivo ? (
                            <>
                                <div className={styles.chatHeader}>
                                    <div className={styles.avatar}>{chatActivo.nombre.charAt(0)}</div>
                                    <h3>{chatActivo.nombre}</h3>
                                </div>
                                <div className={styles.mensajesBody}>
                                    {mensajes.map(m => (
                                        <div key={m.id} className={`${styles.mensaje} ${m.emisor === userId ? styles.mio : styles.otro}`}>
                                            <div className={styles.burbuja}>
                                                {m.mensaje}
                                                <span className={styles.hora}>{new Date(m.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form className={styles.chatFooter} onSubmit={enviarMensaje}>
                                    <input
                                        type="text"
                                        placeholder="Escribe un mensaje..."
                                        value={nuevoMensaje}
                                        onChange={(e) => setNuevoMensaje(e.target.value)}
                                    />
                                    <button type="submit"><i className="fas fa-paper-plane"></i></button>
                                </form>
                            </>
                        ) : (
                            <div className={styles.chatVacio}>
                                <i className="far fa-comments"></i>
                                <p>Selecciona una conversación o inicia una nueva</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Mensajes;
