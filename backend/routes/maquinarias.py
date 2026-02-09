"""
Rutas (Blueprint) para Maquinaria
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from models.maquinaria import Maquinaria  # Import at top level
from services.maquinaria_service import (
    get_maquinaria_by_id,
    search_maquinarias,
    create_maquinaria,
    update_maquinaria,
    delete_maquinaria,
    get_maquinarias_paginated
)
from schemas.maquinaria_schema import validate_maquinaria_create, validate_maquinaria_update

maquinarias_bp = Blueprint('maquinarias', __name__, url_prefix='/maquinarias')


@maquinarias_bp.route('/summary', methods=['GET'])
def get_dashboard_summary():
    """
    Obtener resumen de maquinarias para dashboard
    ---
    tags:
      - Maquinarias
    responses:
      200:
        description: Resumen de maquinarias
    """
    try:
        total = Maquinaria.query.count()
        operativas = Maquinaria.query.filter_by(estado=1).count()
        en_reparacion = Maquinaria.query.filter_by(estado=2).count()
        # Inactivas (0) = total - operativas - en_reparacion
        
        print(f"DEBUG MAQUINARIAS: Total={total}, Ops={operativas}, Rep={en_reparacion}")

        return jsonify({
            "total": total,
            "operativas": operativas,
            "en_reparacion": en_reparacion,
            "inactivas": total - operativas - en_reparacion
        }), 200
    except Exception as e:
        print(f"ERROR MAQUINARIAS SUMMARY: {str(e)}")
        return jsonify({'error': str(e)}), 500


@maquinarias_bp.route('/', methods=['GET'])
@jwt_required()
def get_maquinarias():
    """
    Obtener todas las maquinarias
    ---
    tags:
      - Maquinarias
    security:
      - Bearer: []
    parameters:
      - name: estado
        in: query
        type: integer
        required: false
        description: Filtrar por estado (0=Inactiva, 1=Activa, 2=En Reparación)
    responses:
      200:
        description: Lista de maquinarias obtenida correctamente
        schema:
          type: object
          properties:
            maquinarias:
              type: array
              items:
                type: object
      401:
        description: No autorizado - Token inválido o ausente
      500:
        description: Error interno del servidor
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('limit', 10, type=int)
        estado = request.args.get('estado', type=int)
        q = request.args.get('q', '')

        # Usar el servicio para obtener datos paginados
        pagination = get_maquinarias_paginated(page, per_page, estado, q)
        maquinarias = pagination.items

        return jsonify({
            'success': True,
            'maquinarias': [m.to_dict() for m in maquinarias],
            'total_pages': pagination.pages,
            'current_page': page,
            'total_items': pagination.total
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener maquinarias: {str(e)}'
        }), 500


@maquinarias_bp.route('/search', methods=['GET'])
@jwt_required()
def search():
    """
    Buscar maquinarias por código, nombre o ubicación
    ---
    tags:
      - Maquinarias
    security:
      - Bearer: []
    parameters:
      - name: q
        in: query
        type: string
        required: true
        description: Término de búsqueda
    responses:
      200:
        description: Resultados de búsqueda
      400:
        description: Parámetro de búsqueda faltante
      401:
        description: No autorizado
      500:
        description: Error interno del servidor
    """
    try:
        query = request.args.get('q')
        
        if not query:
            return jsonify({
                'success': False,
                'message': 'El parámetro de búsqueda "q" es requerido'
            }), 400
        
        maquinarias = search_maquinarias(query)
        
        return jsonify({
            'success': True,
            'maquinarias': [m.to_dict() for m in maquinarias],
            'total': len(maquinarias),
            'query': query
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error en la búsqueda: {str(e)}'
        }), 500


@maquinarias_bp.route('/<int:id_maquinaria>', methods=['GET'])
@jwt_required()
def get_maquinaria(id_maquinaria):
    """
    Obtener una maquinaria por ID
    ---
    tags:
      - Maquinarias
    security:
      - Bearer: []
    parameters:
      - name: id_maquinaria
        in: path
        type: integer
        required: true
        description: ID de la maquinaria
    responses:
      200:
        description: Maquinaria encontrada
      404:
        description: Maquinaria no encontrada
      401:
        description: No autorizado
      500:
        description: Error interno del servidor
    """
    try:
        maquinaria = get_maquinaria_by_id(id_maquinaria)
        
        if not maquinaria:
            return jsonify({
                'success': False,
                'message': f'No se encontró maquinaria con ID {id_maquinaria}'
            }), 404
        
        return jsonify({
            'success': True,
            'maquinaria': maquinaria.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener maquinaria: {str(e)}'
        }), 500


@maquinarias_bp.route('/', methods=['POST'])
@jwt_required()
def create():
    """
    Crear una nueva maquinaria
    ---
    tags:
      - Maquinarias
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - codigo
            - nombre
          properties:
            codigo:
              type: string
              description: Código único de la maquinaria
            nombre:
              type: string
              description: Nombre de la maquinaria
            modelo:
              type: string
              description: Modelo de la maquinaria
            anio:
              type: string
              description: Año de fabricación (4 dígitos)
            ubicacion:
              type: string
              description: Ubicación en planta
            fecha_adquisicion:
              type: string
              format: date
              description: Fecha de adquisición (YYYY-MM-DD)
            estado:
              type: integer
              description: Estado (0=Inactiva, 1=Activa, 2=En Reparación)
    responses:
      201:
        description: Maquinaria creada correctamente
      400:
        description: Datos inválidos
      401:
        description: No autorizado
      500:
        description: Error interno del servidor
    """
    try:
        data = request.get_json()
        
        # Validar datos
        is_valid, result = validate_maquinaria_create(data)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'message': 'Datos inválidos',
                'errors': result.get('errors', [])
            }), 400
        
        # Crear maquinaria
        nueva_maquinaria = create_maquinaria(result)
        
        return jsonify({
            'success': True,
            'message': 'Maquinaria creada exitosamente',
            'maquinaria': nueva_maquinaria.to_dict()
        }), 201
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al crear maquinaria: {str(e)}'
        }), 500


@maquinarias_bp.route('/<int:id_maquinaria>', methods=['PUT'])
@jwt_required()
def update(id_maquinaria):
    """
    Actualizar una maquinaria existente
    ---
    tags:
      - Maquinarias
    security:
      - Bearer: []
    parameters:
      - name: id_maquinaria
        in: path
        type: integer
        required: true
        description: ID de la maquinaria
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            codigo:
              type: string
            nombre:
              type: string
            modelo:
              type: string
            anio:
              type: string
            ubicacion:
              type: string
            fecha_adquisicion:
              type: string
              format: date
            estado:
              type: integer
    responses:
      200:
        description: Maquinaria actualizada correctamente
      400:
        description: Datos inválidos
      404:
        description: Maquinaria no encontrada
      401:
        description: No autorizado
      500:
        description: Error interno del servidor
    """
    try:
        data = request.get_json()
        
        # Validar datos
        is_valid, result = validate_maquinaria_update(data)
        
        if not is_valid:
            return jsonify({
                'success': False,
                'message': 'Datos inválidos',
                'errors': result.get('errors', [])
            }), 400
        
        # Actualizar maquinaria
        maquinaria_actualizada = update_maquinaria(id_maquinaria, result)
        
        return jsonify({
            'success': True,
            'message': 'Maquinaria actualizada exitosamente',
            'maquinaria': maquinaria_actualizada.to_dict()
        }), 200
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 404 if 'No existe' in str(ve) else 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al actualizar maquinaria: {str(e)}'
        }), 500


@maquinarias_bp.route('/<int:id_maquinaria>', methods=['DELETE'])
@jwt_required()
def delete(id_maquinaria):
    """
    Dar de baja una maquinaria (soft delete)
    ---
    tags:
      - Maquinarias
    security:
      - Bearer: []
    parameters:
      - name: id_maquinaria
        in: path
        type: integer
        required: true
        description: ID de la maquinaria
      - name: hard
        in: query
        type: boolean
        required: false
        description: Si true, elimina completamente (hard delete)
    responses:
      200:
        description: Maquinaria eliminada correctamente
      404:
        description: Maquinaria no encontrada
      401:
        description: No autorizado
      500:
        description: Error interno del servidor
    """
    try:
        hard_delete = request.args.get('hard', 'false').lower() == 'true'
        
        # Eliminar maquinaria
        delete_maquinaria(id_maquinaria, soft=not hard_delete)
        
        return jsonify({
            'success': True,
            'message': f'Maquinaria {"eliminada" if hard_delete else "dada de baja"} exitosamente'
        }), 200
        
    except ValueError as ve:
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al eliminar maquinaria: {str(e)}'
        }), 500
