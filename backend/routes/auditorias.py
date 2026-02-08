from flask import Blueprint, request, jsonify
from schemas.auditoria_schema import AuditoriaSchema
from services.auditoria_service import AuditoriaService
from marshmallow import ValidationError

auditorias_bp = Blueprint("auditorias", __name__)

@auditorias_bp.route("/auditorias", methods=["GET"])
def get_auditorias():
    """
    Obtener lista de auditorias
    ---
    tags:
      - Auditorias
    responses:
      200:
        description: Lista de auditorias
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              fecha:
                type: string
              hora:
                type: string
              estado:
                type: string
              lugar:
                type: string
              archivo_path:
                type: string
      500:
        description: Error interno
    """
    try:
        auditorias = AuditoriaService.get_all()
        # Custom dump because fecha/hora handling might be tricky with standard schema if not configured
        # But let's try schema.dump first.
        schema = AuditoriaSchema(many=True)
        return jsonify(schema.dump(auditorias)), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener auditorias: {str(e)}"}), 500

@auditorias_bp.route("/auditorias", methods=["POST"])
def create_auditoria():
    """
    Crear nueva auditoria
    ---
    tags:
      - Auditorias
    consumes:
      - multipart/form-data
    parameters:
      - name: fecha
        in: formData
        type: string
        required: true
      - name: hora
        in: formData
        type: string
        required: true
      - name: lugar
        in: formData
        type: string
        required: true
    responses:
      201:
        description: Auditoria creada
      400:
        description: Error validación
      500:
        description: Error interno
    """
    try:
        # file_obj ya no se usa en la creación
        AuditoriaService.create_auditoria(request.form)
        return jsonify({"message": "Auditoria creada exitosamente (Programada)"}), 201
    except ValueError as e:
         return jsonify({"error": str(e)}), 400
    except Exception as e:
         return jsonify({"error": f"Error al crear auditoria: {str(e)}"}), 500

@auditorias_bp.route("/auditorias/<int:id>/finalizar", methods=["POST"])
def finalizar_auditoria(id):
    """
    Finalizar auditoria (subir archivo)
    ---
    tags:
      - Auditorias
    consumes:
      - multipart/form-data
    parameters:
      - name: archivo
        in: formData
        type: file
        required: true
    responses:
      200:
        description: Auditoria finalizada
      400:
        description: Error validación
      404:
        description: No encontrada
      500:
        description: Error interno
    """
    try:
        file_obj = None
        if 'archivo' in request.files:
            file_obj = request.files['archivo']
        
        AuditoriaService.finalizar_auditoria(id, file_obj)
        return jsonify({"message": "Auditoria finalizada exitosamente"}), 200
    except ValueError as e:
         return jsonify({"error": str(e)}), 400
    except Exception as e:
         return jsonify({"error": f"Error al finalizar auditoria: {str(e)}"}), 500

@auditorias_bp.route("/auditorias/<int:id>", methods=["DELETE"])
def delete_auditoria(id):
    """
    Eliminar auditoria
    ---
    tags:
        - Auditorias
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
        AuditoriaService.delete_auditoria(id)
        return jsonify({"message": "Auditoria eliminada exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error al eliminar auditoria: {str(e)}"}), 500
