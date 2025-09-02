from utils.database import db


class TipoProveedor(db.Model):
    __tablename__ = 'tipoproveedor'
    
    idTipo = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    nombreTipo = db.Column(db.String(100), nullable=False)
    
    def __init__(self, nombreTipo):
        self.nombreTipo = nombreTipo
    
    def to_dict(self):
        """Convierte el objeto a diccionario para serialización JSON"""
        return {
            "idTipo": self.idTipo,
            "nombreTipo": self.nombreTipo
        }
