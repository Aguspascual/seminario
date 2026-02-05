from models.auditoria import Auditoria
from utils.database import db
import os
import datetime
from werkzeug.utils import secure_filename

class AuditoriaService:
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in AuditoriaService.ALLOWED_EXTENSIONS

    @staticmethod
    def get_upload_folder():
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        # Cambiar 'reportes' a 'auditorias'
        upload_folder = os.path.join(base_dir, 'frontend', 'public', 'assets', 'auditorias')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
        return upload_folder

    @staticmethod
    def get_all():
        return Auditoria.query.all()

    @staticmethod
    def create_auditoria(form_data, file_obj):
        # Extraer datos del formulario
        fecha_str = form_data.get('fecha')
        hora_str = form_data.get('hora')
        estado = form_data.get('estado')
        lugar = form_data.get('lugar')

        if not all([fecha_str, hora_str, estado, lugar]):
             raise ValueError("Faltan datos requeridos")

        filename = None
        if file_obj and file_obj.filename != '' and AuditoriaService.allowed_file(file_obj.filename):
            filename = secure_filename(file_obj.filename)
            filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
            file_obj.save(os.path.join(AuditoriaService.get_upload_folder(), filename))
        
        # SQLAlchemy suele manejar strings ISO para columnas Date/Time.
        
        nueva = Auditoria(
            fecha=fecha_str,
            hora=hora_str,
            estado=estado,
            lugar=lugar,
            archivo_path=filename
        )
        
        db.session.add(nueva)
        db.session.commit()
        return nueva

    @staticmethod
    def delete_auditoria(id):
        auditoria = Auditoria.query.get(id)
        if not auditoria:
             raise ValueError("Auditoria no encontrada")
        
        # Opcional: Eliminar archivo del disco
        if auditoria.archivo_path:
             try:
                 file_path = os.path.join(AuditoriaService.get_upload_folder(), auditoria.archivo_path)
                 if os.path.exists(file_path):
                     os.remove(file_path)
             except Exception as e:
                 print(f"Error al eliminar archivo: {e}")

        db.session.delete(auditoria)
        db.session.commit()
        return True
