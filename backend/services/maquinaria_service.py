"""
Servicio de lógica de negocio para Maquinaria
"""
from models.maquinaria import Maquinaria
from utils.database import db
from sqlalchemy import or_

def get_all_maquinarias(estado=None):
    """
    Obtiene todas las maquinarias, opcionalmente filtradas por estado.
    
    Args:
        estado (int, optional): Filtrar por estado (0, 1, 2)
        
    Returns:
        list: Lista de objetos Maquinaria
    """
    try:
        query = Maquinaria.query
        
        if estado is not None:
            query = query.filter_by(estado=estado)
        
        maquinarias = query.order_by(Maquinaria.codigo).all()
        return maquinarias
    except Exception as e:
        raise Exception(f"Error al obtener maquinarias: {str(e)}")


def get_maquinarias_paginated(page=1, per_page=10, estado=None, q=None):
    """
    Obtiene maquinarias paginadas y filtradas.
    """
    try:
        query = Maquinaria.query
        
        if estado is not None:
            query = query.filter_by(estado=estado)
        
        if q:
            # Validar longitud mínima de búsqueda como solicitó el usuario
            if len(q) >= 3:
                search = f"%{q}%"
                query = query.filter(
                    (Maquinaria.codigo.ilike(search)) |
                    (Maquinaria.nombre.ilike(search)) |
                    (Maquinaria.ubicacion.ilike(search))
                )
            # Si es menor a 3, ignoramos el filtro (o podríamos retornar error si fuera estricto, 
            # pero mejor simplemente no filtrar para evitar estados vacíos confusos)
            
        return query.order_by(Maquinaria.id_maquinaria.desc()).paginate(page=page, per_page=per_page, error_out=False)
    except Exception as e:
        raise Exception(f"Error al obtener maquinarias paginadas: {str(e)}")


def get_maquinaria_by_id(id_maquinaria):
    """
    Obtiene una maquinaria por su ID.
    
    Args:
        id_maquinaria (int): ID de la maquinaria
        
    Returns:
        Maquinaria: Objeto Maquinaria o None si no existe
    """
    try:
        maquinaria = Maquinaria.query.get(id_maquinaria)
        return maquinaria
    except Exception as e:
        raise Exception(f"Error al obtener maquinaria: {str(e)}")


def search_maquinarias(query):
    """
    Busca maquinarias por código, nombre o ubicación.
    
    Args:
        query (str): Término de búsqueda
        
    Returns:
        list: Lista de objetos Maquinaria que coinciden con la búsqueda
    """
    try:
        search_term = f"%{query}%"
        
        maquinarias = Maquinaria.query.filter(
            or_(
                Maquinaria.codigo.ilike(search_term),
                Maquinaria.nombre.ilike(search_term),
                Maquinaria.ubicacion.ilike(search_term)
            )
        ).order_by(Maquinaria.codigo).all()
        
        return maquinarias
    except Exception as e:
        raise Exception(f"Error al buscar maquinarias: {str(e)}")


def create_maquinaria(data):
    """
    Crea una nueva maquinaria.
    
    Args:
        data (dict): Datos de la maquinaria
        
    Returns:
        Maquinaria: Objeto Maquinaria creado
        
    Raises:
        ValueError: Si el código ya existe
        Exception: Otros errores
    """
    try:
        # Verificar que el código no exista
        existing = Maquinaria.query.filter_by(codigo=data['codigo']).first()
        if existing:
            raise ValueError(f"Ya existe una maquinaria con el código '{data['codigo']}'")
        
        # Crear nueva maquinaria
        nueva_maquinaria = Maquinaria(
            codigo=data['codigo'],
            nombre=data['nombre'],
            modelo=data.get('modelo'),
            anio=data.get('anio'),
            ubicacion=data.get('ubicacion'),
            fecha_adquisicion=data.get('fecha_adquisicion'),
            estado=data.get('estado', 1)
        )
        
        db.session.add(nueva_maquinaria)
        db.session.commit()
        
        return nueva_maquinaria
    except ValueError as ve:
        db.session.rollback()
        raise ve
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Error al crear maquinaria: {str(e)}")


def update_maquinaria(id_maquinaria, data):
    """
    Actualiza una maquinaria existente.
    
    Args:
        id_maquinaria (int): ID de la maquinaria a actualizar
        data (dict): Datos a actualizar
        
    Returns:
        Maquinaria: Objeto Maquinaria actualizado
        
    Raises:
        ValueError: Si no existe la maquinaria o el código duplicado
        Exception: Otros errores
    """
    try:
        maquinaria = Maquinaria.query.get(id_maquinaria)
        
        if not maquinaria:
            raise ValueError(f"No existe maquinaria con ID {id_maquinaria}")
        
        # Si se intenta cambiar el código, verificar que no exista
        if 'codigo' in data and data['codigo'] != maquinaria.codigo:
            existing = Maquinaria.query.filter_by(codigo=data['codigo']).first()
            if existing:
                raise ValueError(f"Ya existe una maquinaria con el código '{data['codigo']}'")
        
        # Actualizar campos
        for field in ['codigo', 'nombre', 'modelo', 'anio', 'ubicacion', 'fecha_adquisicion', 'estado']:
            if field in data:
                setattr(maquinaria, field, data[field])
        
        db.session.commit()
        
        return maquinaria
    except ValueError as ve:
        db.session.rollback()
        raise ve
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Error al actualizar maquinaria: {str(e)}")


def delete_maquinaria(id_maquinaria, soft=True):
    """
    Elimina o da de baja una maquinaria.
    
    Args:
        id_maquinaria (int): ID de la maquinaria
        soft (bool): Si True, soft delete (estado=0), si False, hard delete
        
    Returns:
        bool: True si se eliminó correctamente
        
    Raises:
        ValueError: Si no existe la maquinaria
        Exception: Otros errores
    """
    try:
        maquinaria = Maquinaria.query.get(id_maquinaria)
        
        if not maquinaria:
            raise ValueError(f"No existe maquinaria con ID {id_maquinaria}")
        
        if soft:
            # Soft delete: cambiar estado a inactiva
            maquinaria.estado = 0
            db.session.commit()
        else:
            # Hard delete: eliminar de la base de datos
            db.session.delete(maquinaria)
            db.session.commit()
        
        return True
    except ValueError as ve:
        db.session.rollback()
        raise ve
    except Exception as e:
        db.session.rollback()
        raise Exception(f"Error al eliminar maquinaria: {str(e)}")
