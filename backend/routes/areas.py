from flask import Blueprint, request, jsonify
from schemas.area_schema import AreaSchema
from services.area_service import AreaService
from marshmallow import ValidationError

areas_bp = Blueprint("areas", __name__)

@areas_bp.route("/areas", methods=["GET"])
def get_areas():
    """
    Obtener lista de áreas activas
    ---
    tags:
      - Areas
    responses:
      200:
        description: Lista de áreas
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nombre:
                type: string
              estado:
                type: string
      500:
        description: Error interno
    """
    try:
        areas = AreaService.get_all_active()
        schema = AreaSchema(many=True)
        return jsonify(schema.dump(areas)), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener areas: {str(e)}"}), 500

@areas_bp.route("/areas", methods=["POST"])
def create_area():
    """
    Crear una nueva área
    ---
    tags:
      - Areas
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - nombre
          properties:
            nombre:
              type: string
              example: Informática
    responses:
      201:
        description: Área creada exitosamente
      400:
        description: Nombre requerido
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        schema = AreaSchema()
        # Solo valida el nombre
        validated_data = schema.load(data, partial=("id", "estado"))
        
        AreaService.create_area(validated_data)
        
        return jsonify({"message": "Area creada exitosamente"}), 201
    except ValidationError as err:
         return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except Exception as e:
        return jsonify({"error": f"Error al crear area: {str(e)}"}), 500

@areas_bp.route("/areas/<int:id>", methods=["PUT"])
def update_area(id):
    """
    Actualizar un área
    ---
    tags:
      - Areas
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            nombre:
              type: string
              example: "Informática Avanzada"
    responses:
      200:
        description: Área actualizada
      404:
        description: Área no encontrada
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        # Validamos datos
        schema = AreaSchema()
        # Permitir parcial para update
        validated_data = schema.load(data, partial=True)
        
        AreaService.update_area(id, validated_data)
        return jsonify({"message": "Area actualizada exitosamente"}), 200
        
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except ValidationError as err:
         return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except Exception as e:
        return jsonify({"error": f"Error al actualizar area: {str(e)}"}), 500

@areas_bp.route("/areas/<int:id>", methods=["DELETE"])
def delete_area(id):
    """
    Eliminar un área (Soft Delete)
    ---
    tags:
      - Areas
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Área eliminada
      404:
        description: Área no encontrada
      500:
        description: Error interno
    """
    try:
        AreaService.delete_area(id)
        return jsonify({"message": "Area eliminada exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error al eliminar area: {str(e)}"}), 500
