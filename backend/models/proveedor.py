from utils.database import db


class Proveedor(db.Model):
    __tablename__ = 'proveedor'
    
    idProveedor = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    Nombre = db.Column(db.String(100), nullable=False)
    Estado = db.Column(db.Boolean, nullable=False, default=1)
    Numero = db.Column(db.String(20), nullable=False)
    Email = db.Column(db.String(100), nullable=False)
    idTipo = db.Column(db.Integer, db.ForeignKey("tipoproveedor.idTipo"), nullable=False)
    
    # Relación con TipoProveedor
    tipo_proveedor = db.relationship("TipoProveedor", backref="proveedores")
    
    def __init__(self, Nombre, Numero, Email, idTipo):
        self.Nombre = Nombre
        self.Numero = Numero
        self.Email = Email
        self.idTipo = idTipo
        self.Estado = 1  # Por defecto activo
    
    def to_dict(self):
        """Convierte el objeto a diccionario para serialización JSON"""
        return {
            "idProveedor": self.idProveedor,
            "Nombre": self.Nombre,
            "Estado": self.Estado,
            "Numero": self.Numero,
            "Email": self.Email,
            "idTipo": self.idTipo,
            "tipo_proveedor": self.tipo_proveedor.Nombre if self.tipo_proveedor else None
        }