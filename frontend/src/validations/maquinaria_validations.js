/**
 * Validaciones Yup para el formulario de Maquinaria
 */
import * as Yup from 'yup';

// Schema para crear nueva maquinaria
export const maquinariaCreateSchema = Yup.object({
    codigo: Yup.string()
        .required('El código es requerido')
        .max(50, 'El código no puede exceder 50 caracteres')
        .matches(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),

    nombre: Yup.string()
        .required('El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),

    modelo: Yup.string()
        .max(100, 'El modelo no puede exceder 100 caracteres')
        .nullable(),

    anio: Yup.string()
        .matches(/^\d{4}$/, 'El año debe tener exactamente 4 dígitos')
        .test('year-valid', 'El año debe ser válido', (value) => {
            if (!value) return true; // Opcional
            const year = parseInt(value);
            return year >= 1900 && year <= new Date().getFullYear() + 1;
        })
        .nullable(),

    ubicacion: Yup.string()
        .max(200, 'La ubicación no puede exceder 200 caracteres')
        .nullable(),

    fecha_adquisicion: Yup.date()
        .max(new Date(), 'La fecha de adquisición no puede ser futura')
        .nullable()
        .typeError('Fecha inválida'),

    estado: Yup.number()
        .oneOf([0, 1, 2], 'El estado debe ser Activa (1), Inactiva (0) o En Reparación (2)')
        .required('El estado es requerido')
});

// Schema para actualizar maquinaria (todos los campos son opcionales)
export const maquinariaUpdateSchema = Yup.object({
    codigo: Yup.string()
        .max(50, 'El código no puede exceder 50 caracteres')
        .matches(/^[A-Z0-9-_]+$/, 'El código solo puede contener letras mayúsculas, números, guiones y guiones bajos')
        .nullable(),

    nombre: Yup.string()
        .max(100, 'El nombre no puede exceder 100 caracteres')
        .nullable(),

    modelo: Yup.string()
        .max(100, 'El modelo no puede exceder 100 caracteres')
        .nullable(),

    anio: Yup.string()
        .matches(/^\d{4}$/, 'El año debe tener exactamente 4 dígitos')
        .test('year-valid', 'El año debe ser válido', (value) => {
            if (!value) return true;
            const year = parseInt(value);
            return year >= 1900 && year <= new Date().getFullYear() + 1;
        })
        .nullable(),

    ubicacion: Yup.string()
        .max(200, 'La ubicación no puede exceder 200 caracteres')
        .nullable(),

    fecha_adquisicion: Yup.date()
        .max(new Date(), 'La fecha de adquisición no puede ser futura')
        .nullable()
        .typeError('Fecha inválida'),

    estado: Yup.number()
        .oneOf([0, 1, 2], 'El estado debe ser Activa (1), Inactiva (0) o En Reparación (2)')
        .nullable()
});
