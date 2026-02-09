/**
 * Concatena nombre y apellido en un solo string
 * 
 * @param {string} nombre 
 * @param {string} apellido 
 * @returns {string} Nombre completo
 */
export const concatenarNombre = (nombre, apellido) => {
    if (!nombre && !apellido) return '';
    if (!nombre) return apellido;
    if (!apellido) return nombre;
    return `${nombre.trim()} ${apellido.trim()}`;
};

/**
 * Separa un nombre completo en nombre y apellido.
 * Asume que el primer término es el nombre y el resto es el apellido.
 * 
 * @param {string} nombreCompleto 
 * @returns {Object} Objeto con propiedades nombre y apellido
 */
export const separarNombre = (nombreCompleto) => {
    if (!nombreCompleto) return { nombre: '', apellido: '' };
    
    const partes = nombreCompleto.trim().split(' ');
    
    if (partes.length === 0) return { nombre: '', apellido: '' };
    if (partes.length === 1) return { nombre: partes[0], apellido: '' };
    
    const nombre = partes[0];
    const apellido = partes.slice(1).join(' ');
    
    return { nombre, apellido };
};
