from flask import Blueprint, request, jsonify
from services.reporte_service import ReporteService

reportes_bp = Blueprint("reportes", __name__)

@reportes_bp.route("/reportes/summary", methods=["GET"])
def get_reporte_summary():
    """
    Obtener resumen de reportes para dashboard
    ---
    tags:
      - Reportes
    responses:
      200:
        description: Resumen de reportes
    """
    try:
        from models.reporte import Reporte
        # Asumimos que "pendiente" es cuando no tiene respuesta
        # O podría haber un estado. Revisemos el modelo...
        # Si no hay campo estado, usamos respuesta is None
        pendientes = Reporte.query.filter(Reporte.respuesta == None).count()
        
        return jsonify({
            "pendientes": pendientes
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error summary: {str(e)}"}), 500

@reportes_bp.route("/reportes", methods=["GET"])
def get_reportes():
    """
    Obtener lista de reportes
    ---
    tags:
      - Reportes
    responses:
      200:
        description: Lista de reportes
      500:
        description: Error interno
    """
    try:
        reportes = ReporteService.get_all_detailed()
        return jsonify(reportes), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener reportes: {str(e)}"}), 500

@reportes_bp.route("/reportes", methods=["POST"])
def create_reporte():
    """
    Crear un nuevo reporte (con archivo adjunto)
    ---
    tags:
      - Reportes
    consumes:
      - multipart/form-data
    parameters:
      - name: asunto
        in: formData
        type: string
        required: true
      - name: descripcion
        in: formData
        type: string
        required: true
      - name: idUsuarioEmisor
        in: formData
        type: integer
        required: true
      - name: archivo
        in: formData
        type: file
    responses:
      201:
        description: Reporte creado
      400:
        description: Datos faltantes
      500:
        description: Error interno
    """
    try:
        file_obj = None
        if 'archivo' in request.files:
            file_obj = request.files['archivo']
            
        ReporteService.create_reporte(request.form, file_obj)
        
        return jsonify({"message": "Reporte creado exitosamente"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error al crear reporte: {str(e)}"}), 500

@reportes_bp.route("/reportes/<int:id>/responder", methods=["PUT"])
def responder_reporte(id):
    """
    Responder a un reporte
    ---
    tags:
      - Reportes
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
          required:
            - respuesta
            - idUsuarioReceptor
          properties:
            respuesta:
              type: string
            idUsuarioReceptor:
              type: integer
    responses:
      200:
        description: Respuesta guardada
      404:
        description: Reporte no encontrado
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        ReporteService.answer_reporte(id, data)
        return jsonify({"message": "Respuesta guardada exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error al responder reporte: {str(e)}"}), 500
