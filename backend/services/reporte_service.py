from models.reporte import Reporte
from models.usuario import Usuario
from utils.database import db
import os
import datetime
from werkzeug.utils import secure_filename

class ReporteService:
    
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

    @staticmethod
    def get_upload_folder():
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        upload_folder = os.path.join(base_dir, 'frontend', 'public', 'assets', 'reportes')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        return upload_folder

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in ReporteService.ALLOWED_EXTENSIONS

    @staticmethod
    def get_all_detailed():
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
        return result

    @staticmethod
    def create_reporte(form_data, file_obj):
        asunto = form_data.get('asunto')
        descripcion = form_data.get('descripcion')
        idUsuarioEmisor = form_data.get('idUsuarioEmisor')

        if not all([asunto, descripcion, idUsuarioEmisor]):
             raise ValueError("Faltan datos requeridos (asunto, descripcion, emisor)")

        filename = None
        if file_obj and file_obj.filename != '' and ReporteService.allowed_file(file_obj.filename):
            filename = secure_filename(file_obj.filename)
            filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
            file_obj.save(os.path.join(ReporteService.get_upload_folder(), filename))

        new_reporte = Reporte(
            asunto=asunto,
            descripcion=descripcion,
            idUsuarioEmisor=int(idUsuarioEmisor),
            nombreArchivo=filename
        )
        
        db.session.add(new_reporte)
        db.session.commit()
        return new_reporte

    @staticmethod
    def answer_reporte(id, data):
        reporte = Reporte.query.get(id)
        if not reporte:
            raise ValueError("Reporte no encontrado")
        
        if "respuesta" not in data or "idUsuarioReceptor" not in data:
            raise ValueError("Faltan datos (respuesta, idUsuarioReceptor)")
        
        reporte.respuesta = data["respuesta"]
        reporte.idUsuarioReceptor = int(data["idUsuarioReceptor"])
        reporte.fechaRespuesta = datetime.datetime.now()
        
        db.session.commit()
        return reporte
