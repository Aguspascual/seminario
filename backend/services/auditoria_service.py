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
        # Actualizar estados automáticamente y filtrar no eliminados
        auditorias = Auditoria.query.filter(Auditoria.fecha_baja == None).all()
        now = datetime.datetime.now()
        
        updated = False
        for aud in auditorias:
            if aud.estado == "Programado":
                # Combinar fecha y hora para comparar
                # aud.fecha es datetime.date, aud.hora es datetime.time
                try:
                    aud_dt = datetime.datetime.combine(aud.fecha, aud.hora)
                    if now >= aud_dt:
                        aud.estado = "En Proceso"
                        updated = True
                except Exception as e:
                    print(f"Error comparing dates for auditoria {aud.id}: {e}")
        
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
    def update_auditoria(id, form_data):
        auditoria = Auditoria.query.get(id)
        if not auditoria:
            raise ValueError("Auditoria no encontrada")
        
        if auditoria.fecha_baja:
             raise ValueError("La auditoria ha sido eliminada")

        # Solo permitir editar si no está terminada (aunque el frontend lo controla, backend también debería)
        if auditoria.estado == "Terminado":
             raise ValueError("No se puede editar una auditoría terminada")

        if 'fecha' in form_data:
            auditoria.fecha = form_data.get('fecha')
        if 'hora' in form_data:
            auditoria.hora = form_data.get('hora')
        if 'lugar' in form_data:
            auditoria.lugar = form_data.get('lugar')
        
        # Re-evaluar estado si se cambia fecha/hora? Por ahora simple update.
        
        db.session.commit()
        return auditoria

    @staticmethod
    def finalizar_auditoria(id, file_obj):
        auditoria = Auditoria.query.get(id)
        if not auditoria or auditoria.fecha_baja:
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
        if not auditoria or auditoria.fecha_baja:
             raise ValueError("Auditoria no encontrada")
        
        # Permitir eliminar (soft delete) incluso si está programada. 
        # El user dijo "boton de eliminar debe ser soft delete".
        
        auditoria.fecha_baja = datetime.datetime.now()
        db.session.commit()
        return True
