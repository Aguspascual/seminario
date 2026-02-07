from utils.database import db
from datetime import datetime

class Insumo(db.Model):
    __tablename__ = 'insumos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(50), unique=True, nullable=True) # Optional code
    descripcion = db.Column(db.Text, nullable=True)
    unidad = db.Column(db.String(20), nullable=False) # e.g., 'unidad', 'litros', 'metros'
    stock_actual = db.Column(db.Float, default=0.0)
    stock_minimo = db.Column(db.Float, default=0.0)
    
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedor.idProveedor'), nullable=True)
    
    fecha_creacion = db.Column(db.DateTime, default=datetime.now)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'codigo': self.codigo,
            'descripcion': self.descripcion,
            'unidad': self.unidad,
            'stock_actual': self.stock_actual,
            'stock_minimo': self.stock_minimo,
            'proveedor_id': self.proveedor_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
