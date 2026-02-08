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
        # Actualizar estados automáticamente
        auditorias = Auditoria.query.all()
        now = datetime.datetime.now()
        
        updated = False
        for aud in auditorias:
            if aud.estado == "Programado":
                # Combinar fecha y hora para comparar
                # aud.fecha es datetime.date, aud.hora es datetime.time
                aud_dt = datetime.datetime.combine(aud.fecha, aud.hora)
                if now >= aud_dt:
                    aud.estado = "En Proceso"
                    updated = True
        
        if updated:
            db.session.commit()
            
        return auditorias

    @staticmethod
    def create_auditoria(form_data):
        # Extraer datos del formulario (Solo Fecha, Hora, Lugar)
        fecha_str = form_data.get('fecha')
        hora_str = form_data.get('hora')
        lugar = form_data.get('lugar')

        if not all([fecha_str, hora_str, lugar]):
             raise ValueError("Faltan datos requeridos (Fecha, Hora, Lugar)")
        
        # Estado inicial automático
        estado = "Programado"
        
        nueva = Auditoria(
            fecha=fecha_str,
            hora=hora_str,
            estado=estado,
            lugar=lugar,
            archivo_path=None # Sin archivo al principio
        )
        
        db.session.add(nueva)
        db.session.commit()
        return nueva

    @staticmethod
    def finalizar_auditoria(id, file_obj):
        auditoria = Auditoria.query.get(id)
        if not auditoria:
            raise ValueError("Auditoria no encontrada")
            
        if auditoria.estado != "En Proceso":
            raise ValueError("Solo se pueden finalizar auditorias En Proceso")
            
        if not file_obj or file_obj.filename == '':
            raise ValueError("Debe subir un archivo para finalizar")
            
        if not AuditoriaService.allowed_file(file_obj.filename):
            raise ValueError("Tipo de archivo no permitido")

        filename = secure_filename(file_obj.filename)
        filename = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
        file_obj.save(os.path.join(AuditoriaService.get_upload_folder(), filename))
        
        auditoria.archivo_path = filename
        auditoria.estado = "Terminado" # o Finalizado
        
        db.session.commit()
        return auditoria

    @staticmethod
    def delete_auditoria(id):
        auditoria = Auditoria.query.get(id)
        if not auditoria:
             raise ValueError("Auditoria no encontrada")
        
        if auditoria.estado != "Programado":
            raise ValueError("No se pueden eliminar auditorias en proceso o terminadas")
        
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
