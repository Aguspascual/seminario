from utils.database import db
from datetime import datetime

class Maquinaria(db.Model):
    __tablename__ = 'Maquinaria'
    
    # Clave primaria
    id_maquinaria = db.Column('idMaquinaria', db.Integer, primary_key=True, autoincrement=True)
    
    # Campos principales
    codigo = db.Column('Codigo', db.String(50), unique=True, nullable=False)
    nombre = db.Column('Nombre', db.String(100), nullable=False)
    modelo = db.Column('Modelo', db.String(100))
    anio = db.Column('Anio', db.String(4))  # Year(4) en MySQL se mapea a String(4)
    ubicacion = db.Column('Ubicacion', db.String(200))
    fecha_adquisicion = db.Column('FechaAdquisicion', db.Date)
    
    # Campos de sistema
    fecha_alta_sistema = db.Column('FechaAltaSistema', db.DateTime, default=datetime.now)
    estado = db.Column('Estado', db.SmallInteger, default=1)  # 0=Inactiva, 1=Activa, 2=En Reparación
    
    # Timestamps
    created_at = db.Column('CreatedAt', db.DateTime, default=datetime.now)
    updated_at = db.Column('UpdatedAt', db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relaciones (preparadas para futuras extensiones)
    # informes_mantenimiento = db.relationship('InformeMantenimiento', backref='maquinaria', lazy=True)
    # operaciones = db.relationship('OperacionSobreMaquina', backref='maquinaria', lazy=True)
    
    def __repr__(self):
        return f'<Maquinaria {self.codigo} - {self.nombre}>'
    
    def to_dict(self):
        """Convierte el objeto a diccionario para serialización JSON"""
        return {
            'id_maquinaria': self.id_maquinaria,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'modelo': self.modelo,
            'anio': self.anio,
            'ubicacion': self.ubicacion,
            'fecha_adquisicion': self.fecha_adquisicion.isoformat() if self.fecha_adquisicion else None,
            'fecha_alta_sistema': self.fecha_alta_sistema.isoformat() if self.fecha_alta_sistema else None,
            'estado': self.estado,
            'estado_descripcion': self.get_estado_descripcion(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_estado_descripcion(self):
        """Retorna descripción textual del estado"""
        estados = {
            0: 'Inactiva',
            1: 'Activa',
            2: 'En Reparación'
        }
        return estados.get(self.estado, 'Desconocido')
