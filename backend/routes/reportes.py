from flask import Blueprint, request, jsonify, send_from_directory, current_app
from utils.database import db
from models.reporte import Reporte
from models.usuario import Usuario
import os
import datetime
from werkzeug.utils import secure_filename

reportes_bp = Blueprint("reportes", __name__)

# Configurar carpeta de subida
def get_upload_folder():
    # Intentar guardar en frontend/public/assets/reportes para acceso directo
    # Asumiendo estructura: backend/ y frontend/ al mismo nivel
    # backend/routes/reportes.py -> backend/routes/../../frontend/public/assets/reportes
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_folder = os.path.join(base_dir, 'frontend', 'public', 'assets', 'reportes')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    return upload_folder

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@reportes_bp.route("/reportes", methods=["GET"])
def get_reportes():
    try:
        reportes = Reporte.query.all()
        result = []
        for r in reportes:
            emisor = Usuario.query.get(r.idUsuarioEmisor)
            receptor = Usuario.query.get(r.idUsuarioReceptor) if r.idUsuarioReceptor else None
            
            result.append({
                "id": r.id,
                "fechaCreacion": r.fechaCreacion.isoformat(),
                "asunto": r.asunto,
                "descripcion": r.descripcion,
                "nombreArchivo": r.nombreArchivo,
                "idUsuarioEmisor": r.idUsuarioEmisor,
                "nombreEmisor": emisor.nombre if emisor else "Desconocido",
                "idUsuarioReceptor": r.idUsuarioReceptor,
                "nombreReceptor": receptor.nombre if receptor else "Sin asignar",
                "respuesta": r.respuesta,
                "fechaRespuesta": r.fechaRespuesta.isoformat() if r.fechaRespuesta else None
            })
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener reportes: {str(e)}"}), 500

@reportes_bp.route("/reportes", methods=["POST"])
def create_reporte():
    try:
        # Check if the post request has the file part
        # file = request.files.get('archivo')
        # form fields are in request.form
        
        asunto = request.form.get('asunto')
        descripcion = request.form.get('descripcion')
        idUsuarioEmisor = request.form.get('idUsuarioEmisor')

        if not all([asunto, descripcion, idUsuarioEmisor]):
             return jsonify({"error": "Faltan datos requeridos (asunto, descripcion, emisor)"}), 400

        filename = None
        if 'archivo' in request.files:
            file = request.files['archivo']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Agregar timestamp para evitar duplicados
                filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
                file.save(os.path.join(get_upload_folder(), filename))

        new_reporte = Reporte(
            asunto=asunto,
            descripcion=descripcion,
            idUsuarioEmisor=int(idUsuarioEmisor),
            nombreArchivo=filename
        )
        
        db.session.add(new_reporte)
        db.session.commit()
        print("DEBUG: Reporte created successfully")
        
        return jsonify({"message": "Reporte creado exitosamente"}), 201
    except Exception as e:
        print(f"DEBUG: Error creating reporte: {str(e)}")
        return jsonify({"error": f"Error al crear reporte: {str(e)}"}), 500

@reportes_bp.route("/reportes/<int:id>/responder", methods=["PUT"])
def responder_reporte(id):
    try:
        reporte = Reporte.query.get(id)
        if not reporte:
            return jsonify({"error": "Reporte no encontrado"}), 404
        
        data = request.get_json()
        if not data or "respuesta" not in data or "idUsuarioReceptor" not in data:
            return jsonify({"error": "Faltan datos (respuesta, idUsuarioReceptor)"}), 400
        
        reporte.respuesta = data["respuesta"]
        reporte.idUsuarioReceptor = int(data["idUsuarioReceptor"])
        reporte.fechaRespuesta = datetime.datetime.now()
        
        db.session.commit()
        return jsonify({"message": "Respuesta guardada exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": f"Error al responder reporte: {str(e)}"}), 500
