/**
 * Validaciones Yup para el formulario de Usuarios
 */
import * as Yup from 'yup';

// Schema para crear nuevo usuario
export const usuarioCreateSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre es requerido')
        .max(50, 'El nombre no puede exceder 50 caracteres'),

    apellido: Yup.string()
        .required('El apellido es requerido')
        .max(50, 'El apellido no puede exceder 50 caracteres'),

    email: Yup.string()
        .email('Debe ser un correo electrónico válido')
        .required('El correo electrónico es requerido')
        .max(100, 'El correo no puede exceder 100 caracteres'),

    telefono: Yup.string()
        .required('El teléfono es requerido')
        .matches(/^[0-9+() -]+$/, 'El teléfono solo puede contener números y símbolos básicos (+, -, (), espacio)')
        .max(20, 'El teléfono no puede exceder 20 caracteres'),

    contrasena: Yup.string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),

    confirmarContraseña: Yup.string()
        .oneOf([Yup.ref('contrasena'), null], 'Las contraseñas deben coincidir')
        .required('La confirmación de contraseña es requerida'),

    rol: Yup.string()
        .required('El rol es requerido')
        .oneOf(['Administrador', 'Operario', 'Supervisor'], 'Rol inválido'),

    area_id: Yup.string()
        .required('El área es requerida'),

    turno_id: Yup.string()
        .nullable()
});

// Schema para editar usuario
export const usuarioUpdateSchema = Yup.object({
    nombre: Yup.string()
        .required('El nombre es requerido')
        .max(50, 'El nombre no puede exceder 50 caracteres'),

    apellido: Yup.string()
        .required('El apellido es requerido')
        .max(50, 'El apellido no puede exceder 50 caracteres'),

    email: Yup.string()
        .email('Debe ser un correo electrónico válido')
        .required('El correo electrónico es requerido')
        .max(100, 'El correo no puede exceder 100 caracteres'),

    telefono: Yup.string()
        .required('El teléfono es requerido')
        .matches(/^[0-9+() -]+$/, 'El teléfono solo puede contener números y símbolos básicos (+, -, (), espacio)')
        .max(20, 'El teléfono no puede exceder 20 caracteres'),

    rol: Yup.string()
        .required('El rol es requerido')
        .oneOf(['Administrador', 'Operario', 'Supervisor'], 'Rol inválido'),

    area_id: Yup.string() // Puede venir como número o string
        .required('El área es requerida'),

    turno_id: Yup.string()
        .nullable()
});
