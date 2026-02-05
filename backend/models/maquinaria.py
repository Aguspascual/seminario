from utils.database import db
from datetime import datetime

class Maquinaria(db.Model):
    __tablename__ = 'maquinaria'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    anio = db.Column(db.Integer, nullable=True)
    estado = db.Column(db.String(20), nullable=False, default="Activa")
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, nombre, tipo, anio=None, estado="Activa"):
        self.nombre = nombre
        self.tipo = tipo
        self.anio = anio
        self.estado = estado

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "tipo": self.tipo,
            "anio": self.anio,
            "estado": self.estado,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }

