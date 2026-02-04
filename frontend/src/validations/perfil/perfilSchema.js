import * as yup from "yup";

export const perfilSchema = yup.object().shape({
  nombre: yup
    .string()
    .required("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  email: yup
    .string()
    .required("El email es requerido")
    .email("Ingrese un email válido"),
  telefono: yup
    .string()
    .required("El teléfono es requerido")
    .matches(/^[0-9]+$/, "El teléfono solo debe contener números")
    .min(7, "El teléfono debe tener al menos 7 dígitos"),
});
