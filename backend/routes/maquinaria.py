from flask import Blueprint, request, jsonify
from schemas.maquinaria_schema import MaquinariaSchema
from services.maquinaria_service import MaquinariaService
from marshmallow import ValidationError

maquinaria_bp = Blueprint("maquinaria", __name__)

@maquinaria_bp.route("/maquinaria", methods=["GET"])
def get_maquinaria():
    """
    Obtener lista de maquinaria
    ---
    tags:
      - Maquinaria
    responses:
      200:
        description: Lista de maquinaria
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nombre:
                type: string
              tipo:
                type: string
              anio:
                type: integer
              estado:
                type: string
      500:
        description: Error interno
    """
    try:
        maquinarias = MaquinariaService.get_all()
        schema = MaquinariaSchema(many=True)
        return jsonify(schema.dump(maquinarias)), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener maquinaria: {str(e)}"}), 500

@maquinaria_bp.route("/maquinaria", methods=["POST"])
def create_maquinaria():
    """
    Crear nueva maquinaria
    ---
    tags:
      - Maquinaria
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - nombre
            - tipo
          properties:
            nombre:
              type: string
            tipo:
              type: string
            anio:
              type: integer
            estado:
              type: string
    responses:
      201:
        description: Maquinaria creada
      400:
        description: Error de validación
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        schema = MaquinariaSchema()
        validated_data = schema.load(data)
        
        MaquinariaService.create_maquinaria(validated_data)
        return jsonify({"message": "Maquinaria creada exitosamente"}), 201
    except ValidationError as err:
         return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except Exception as e:
        return jsonify({"error": f"Error al crear maquinaria: {str(e)}"}), 500

@maquinaria_bp.route("/maquinaria/<int:id>", methods=["PUT"])
def update_maquinaria(id):
    """
    Actualizar maquinaria
    ---
    tags:
      - Maquinaria
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
             tipo:
               type: string
             anio:
               type: integer
             estado:
               type: string
    responses:
      200:
        description: Actualizada exitosamente
      404:
        description: No encontrada
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        schema = MaquinariaSchema()
        validated_data = schema.load(data, partial=True)
        
        MaquinariaService.update_maquinaria(id, validated_data)
        return jsonify({"message": "Maquinaria actualizada exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except ValidationError as err:
         return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except Exception as e:
        return jsonify({"error": f"Error al actualizar maquinaria: {str(e)}"}), 500

@maquinaria_bp.route("/maquinaria/<int:id>", methods=["DELETE"])
def delete_maquinaria(id):
    """
    Eliminar maquinaria
    ---
    tags:
      - Maquinaria
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
        MaquinariaService.delete_maquinaria(id)
        return jsonify({"message": "Maquinaria eliminada exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error al eliminar maquinaria: {str(e)}"}), 500
