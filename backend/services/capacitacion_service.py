from models.capacitacion import Capacitacion
from utils.database import db

class CapacitacionService:
    @staticmethod
    def get_all():
        return Capacitacion.query.all()
    
    @staticmethod
    def create_capacitacion(data):
        nueva = Capacitacion(
            nombre=data.get("nombre"),
            profesional=data.get("profesional"),
            fecha=data.get("fecha"),
            descripcion=data.get("descripcion")
        )
        db.session.add(nueva)
        db.session.commit()
        return nueva

    @staticmethod
    def delete_capacitacion(id):
        capacitacion = Capacitacion.query.get(id)
        if not capacitacion:
            raise ValueError("Capacitacion no encontrada")
        
        db.session.delete(capacitacion)
        db.session.commit()
        return True
