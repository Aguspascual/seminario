from flask import Blueprint, request, jsonify
from schemas.capacitacion_schema import CapacitacionSchema
from services.capacitacion_service import CapacitacionService
from marshmallow import ValidationError

capacitaciones_bp = Blueprint("capacitaciones", __name__)

@capacitaciones_bp.route("/capacitaciones", methods=["GET"])
def get_capacitaciones():
    """
    Obtener lista de capacitaciones
    ---
    tags:
      - Capacitaciones
    responses:
      200:
        description: Lista de capacitaciones
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nombre:
                type: string
              profesional:
                type: string
              fecha:
                type: string
              descripcion:
                type: string
              fecha_creacion:
                type: string
              fecha_actualizacion:
                type: string
      500:
        description: Error interno
    """
    try:
        capacitaciones = CapacitacionService.get_all()
        # Usar dump personalizado si se necesita, probando schema primero
        schema = CapacitacionSchema(many=True)
        return jsonify(schema.dump(capacitaciones)), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener capacitaciones: {str(e)}"}), 500

@capacitaciones_bp.route("/capacitaciones", methods=["POST"])
def create_capacitacion():
    """
    Crear nueva capacitacion
    ---
    tags:
      - Capacitaciones
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - nombre
            - profesional
            - fecha
            - descripcion
          properties:
            nombre:
              type: string
            profesional:
              type: string
            fecha:
              type: string
              format: date
            descripcion:
              type: string
    responses:
      201:
        description: Capacitacion creada
      400:
        description: Error validación
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        schema = CapacitacionSchema()
        validated_data = schema.load(data)
        
        CapacitacionService.create_capacitacion(validated_data)
        return jsonify({"message": "Capacitacion creada exitosamente"}), 201
    except ValidationError as err:
         return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except Exception as e:
        return jsonify({"error": f"Error al crear capacitacion: {str(e)}"}), 500

@capacitaciones_bp.route("/capacitaciones/<int:id>", methods=["DELETE"])
def delete_capacitacion(id):
    """
    Eliminar capacitacion
    ---
    tags:
      - Capacitaciones
    parameters:
        - name: id
          in: path
          type: integer
          required: true
    responses:
        200:
            description: Eliminada exitosamente
        404:
            description: No encontrada
        500:
            description: Error interno
    """
    try:
        CapacitacionService.delete_capacitacion(id)
        return jsonify({"message": "Capacitacion eliminada exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error al eliminar capacitacion: {str(e)}"}), 500
