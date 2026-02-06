from models.bitacora import Bitacora
from utils.database import db
from datetime import datetime

def registrar_accion(usuario_id, accion, detalle=""):
    """
    Función global para que todos los compañeros registren acciones.
    """
    try:
        nueva_entrada = Bitacora(
            Usuario_idUsuario=usuario_id,
            Accion=accion,
            Detalle=detalle
            # FechaHora se maneja con default en el modelo, o podemos pasarlo aquí si es estricto
        )
        db.session.add(nueva_entrada)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error al registrar en bitácora: {e}")
