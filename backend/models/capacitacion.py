from utils.database import db
from datetime import datetime

class Capacitacion(db.Model):
    __tablename__ = 'capacitacion'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    profesional = db.Column(db.String(100), nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, nombre, profesional, fecha, descripcion):
        self.nombre = nombre
        self.profesional = profesional
        self.fecha = fecha
        self.descripcion = descripcion

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "profesional": self.profesional,
            "fecha": str(self.fecha),
            "descripcion": self.descripcion,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }

