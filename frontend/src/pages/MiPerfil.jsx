import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import styles from "../assets/styles/MiPerfil.module.css";
import Head from "../components/Head";

import "@fortawesome/fontawesome-free/css/all.min.css";
import { perfilSchema } from "../validations/main";

const MiPerfil = () => {
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const queryClient = useQueryClient();

  // Configuración de React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(perfilSchema),
  });

  // Obtener token
  const getToken = () => localStorage.getItem("token");

  // React Query: Obtener perfil
  const {
    data: usuario,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["perfil"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/perfil`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener el perfil");
      }
      return response.json();
    },
    // Al obtener los datos, reseteamos el formulario con los valores actuales
    onSuccess: (data) => {
      reset(data);
    },
  });

  // React Query: Actualizar perfil
  const mutation = useMutation({
    mutationFn: async (datosActualizados) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/usuarios/${usuario.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(datosActualizados),
        }
      );
      if (!response.ok) {
        throw new Error("Error al actualizar el perfil");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["perfil"]);
      setMensaje({ texto: "Perfil actualizado correctamente", tipo: "exito" });
      setEditando(false);
      reset(data);
    },
    onError: (error) => {
      setMensaje({ texto: error.message, tipo: "error" });
    },
  });

  // Efecto para resetear el formulario cuando llegan los datos (por si onSuccess no basta)
  React.useEffect(() => {
    if (usuario) {
      reset(usuario);
    }
  }, [usuario, reset]);

  const onSubmit = (data) => {
    mutation.mutate({
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono
    });
  };

  const handleCancelar = () => {
    setEditando(false);
    reset(usuario);
    setMensaje({ texto: "", tipo: "" });
  };

  const getIniciales = (nombre) => {
    if (!nombre) return "?";
    return nombre
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Head />
        <div className={styles.main}>
          <div className={styles.loading}>Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <Head />
        <div className={styles.main}>
          <div className={styles.error}>Error al cargar el perfil. Por favor inicie sesión nuevamente.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head user={usuario} />
      <div className={styles.main}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          <span style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/home'}>Home</span> <span>/</span>
          <span className={styles.current}>Mi Perfil</span>
        </div>

        <div className={styles.headerSection}>
          <h2>Mi Perfil</h2>
        </div>

        <div className={styles.contentWrapper}>

          {/* Columna Izquierda: 30% */}
          <div className={styles.leftColumn}>
            <div className={styles.card}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {getIniciales(usuario?.nombre)}
                </div>
                <span className={styles.userName}>{usuario?.nombre}</span>
                <span className={styles.userRole}>{usuario?.rol}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: 70% */}
          <div className={styles.rightColumn}>
            <div className={styles.card}>
              {mensaje.texto && (
                <div
                  className={`${styles.mensaje} ${mensaje.tipo === "exito" ? styles.mensajeExito : styles.mensajeError
                    }`}
                >
                  {mensaje.texto}
                </div>
              )}

              <form
                className={styles.formSection}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="nombre">Nombre Completo</label>
                  <input
                    type="text"
                    id="nombre"
                    {...register("nombre")}
                    disabled={!editando}
                  />
                  {errors.nombre && (
                    <span style={{ color: "red", fontSize: "0.8rem" }}>
                      {errors.nombre.message}
                    </span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      {...register("email")}
                      disabled={!editando}
                    />
                    {errors.email && (
                      <span style={{ color: "red", fontSize: "0.8rem" }}>
                        {errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      {...register("telefono")}
                      disabled={!editando}
                    />
                    {errors.telefono && (
                      <span style={{ color: "red", fontSize: "0.8rem" }}>
                        {errors.telefono.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="rol">Rol</label>
                    <input
                      type="text"
                      id="rol"
                      value={usuario?.rol || ""}
                      disabled
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="area">Área</label>
                    <input
                      type="text"
                      id="area"
                      value={usuario?.area || ""}
                      disabled
                    />
                  </div>
                </div>

                <div className={styles.buttonSection}>
                  {!editando ? (
                    <button
                      type="button"
                      className={styles.btnEditar}
                      onClick={(e) => {
                        e.preventDefault();
                        setEditando(true);
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                      Editar Perfil
                    </button>
                  ) : (
                    <>
                      <button type="submit" className={styles.btnGuardar} disabled={mutation.isPending}>
                        {mutation.isPending ? "Guardando..." : "Guardar Cambios"}
                      </button>
                      <button
                        type="button"
                        className={styles.btnCancelar}
                        onClick={handleCancelar}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
