from utils.database import db
from datetime import datetime

class Auditoria(db.Model):
    __tablename__ = 'auditoria'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time, nullable=False)
    estado = db.Column(db.String(50), nullable=False)
    lugar = db.Column(db.String(100), nullable=False)
    archivo_path = db.Column(db.String(255), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, fecha, hora, estado, lugar, archivo_path=None):
        self.fecha = fecha
        self.hora = hora
        self.estado = estado
        self.lugar = lugar
        self.archivo_path = archivo_path

    def to_dict(self):
        return {
            "id": self.id,
            "fecha": str(self.fecha),
            "hora": str(self.hora),
            "estado": self.estado,
            "lugar": self.lugar,
            "archivo_path": self.archivo_path,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }

