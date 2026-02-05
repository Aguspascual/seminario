"""
Schemas de validación para Maquinaria
"""
from datetime import datetime

def validate_maquinaria_create(data):
    """
    Valida los datos para crear una nueva maquinaria.
    
    Args:
        data (dict): Datos a validar
        
    Returns:
        tuple: (bool, dict/str) - (es_valido, datos_limpios/mensaje_error)
    """
    errors = []
    
    # Validar código (requerido)
    if not data.get('codigo'):
        errors.append('El código es requerido')
    elif len(data.get('codigo', '')) > 50:
        errors.append('El código no puede exceder 50 caracteres')
    
    # Validar nombre (requerido)
    if not data.get('nombre'):
        errors.append('El nombre es requerido')
    elif len(data.get('nombre', '')) > 100:
        errors.append('El nombre no puede exceder 100 caracteres')
    
    # Validar modelo (opcional)
    if data.get('modelo') and len(data['modelo']) > 100:
        errors.append('El modelo no puede exceder 100 caracteres')
    
    # Validar año (opcional, 4 dígitos)
    if data.get('anio'):
        anio = str(data['anio'])
        if not anio.isdigit() or len(anio) != 4:
            errors.append('El año debe tener exactamente 4 dígitos')
    
    # Validar ubicación (opcional pero recomendado)
    if data.get('ubicacion') and len(data['ubicacion']) > 200:
        errors.append('La ubicación no puede exceder 200 caracteres')
    
    # Validar estado (opcional, default=1)
    if data.get('estado') is not None:
        try:
            estado = int(data['estado'])
            if estado not in [0, 1, 2]:
                errors.append('El estado debe ser 0 (Inactiva), 1 (Activa) o 2 (En Reparación)')
        except (ValueError, TypeError):
            errors.append('El estado debe ser un número entero')
    
    # Validar fecha de adquisición (opcional)
    if data.get('fecha_adquisicion'):
        try:
            # Intenta parsear la fecha si es string
            if isinstance(data['fecha_adquisicion'], str):
                datetime.strptime(data['fecha_adquisicion'], '%Y-%m-%d')
        except ValueError:
            errors.append('La fecha de adquisición debe estar en formato YYYY-MM-DD')
    
    if errors:
        return False, {'errors': errors}
    
    # Datos limpios
    clean_data = {
        'codigo': data['codigo'].strip(),
        'nombre': data['nombre'].strip(),
        'modelo': data.get('modelo', '').strip() if data.get('modelo') else None,
        'anio': str(data['anio']) if data.get('anio') else None,
        'ubicacion': data.get('ubicacion', '').strip() if data.get('ubicacion') else None,
        'fecha_adquisicion': data.get('fecha_adquisicion'),
        'estado': int(data.get('estado', 1))
    }
    
    return True, clean_data


def validate_maquinaria_update(data):
    """
    Valida los datos para actualizar una maquinaria existente.
    Todos los campos son opcionales.
    
    Args:
        data (dict): Datos a validar
        
    Returns:
        tuple: (bool, dict/str) - (es_valido, datos_limpios/mensaje_error)
    """
    errors = []
    clean_data = {}
    
    # Validar código (opcional, no debería cambiar)
    if 'codigo' in data:
        if not data['codigo']:
            errors.append('El código no puede estar vacío')
        elif len(data['codigo']) > 50:
            errors.append('El código no puede exceder 50 caracteres')
        else:
            clean_data['codigo'] = data['codigo'].strip()
    
    # Validar nombre (opcional)
    if 'nombre' in data:
        if not data['nombre']:
            errors.append('El nombre no puede estar vacío')
        elif len(data['nombre']) > 100:
            errors.append('El nombre no puede exceder 100 caracteres')
        else:
            clean_data['nombre'] = data['nombre'].strip()
    
    # Validar modelo (opcional)
    if 'modelo' in data:
        if data['modelo'] and len(data['modelo']) > 100:
            errors.append('El modelo no puede exceder 100 caracteres')
        else:
            clean_data['modelo'] = data['modelo'].strip() if data['modelo'] else None
    
    # Validar año (opcional)
    if 'anio' in data:
        if data['anio']:
            anio = str(data['anio'])
            if not anio.isdigit() or len(anio) != 4:
                errors.append('El año debe tener exactamente 4 dígitos')
            else:
                clean_data['anio'] = anio
        else:
            clean_data['anio'] = None
    
    # Validar ubicación (opcional)
    if 'ubicacion' in data:
        if data['ubicacion'] and len(data['ubicacion']) > 200:
            errors.append('La ubicación no puede exceder 200 caracteres')
        else:
            clean_data['ubicacion'] = data['ubicacion'].strip() if data['ubicacion'] else None
    
    # Validar estado (opcional)
    if 'estado' in data:
        try:
            estado = int(data['estado'])
            if estado not in [0, 1, 2]:
                errors.append('El estado debe ser 0 (Inactiva), 1 (Activa) o 2 (En Reparación)')
            else:
                clean_data['estado'] = estado
        except (ValueError, TypeError):
            errors.append('El estado debe ser un número entero')
    
    # Validar fecha de adquisición (opcional)
    if 'fecha_adquisicion' in data:
        if data['fecha_adquisicion']:
            try:
                if isinstance(data['fecha_adquisicion'], str):
                    datetime.strptime(data['fecha_adquisicion'], '%Y-%m-%d')
                clean_data['fecha_adquisicion'] = data['fecha_adquisicion']
            except ValueError:
                errors.append('La fecha de adquisición debe estar en formato YYYY-MM-DD')
        else:
            clean_data['fecha_adquisicion'] = None
    
    if errors:
        return False, {'errors': errors}
    
    return True, clean_data
