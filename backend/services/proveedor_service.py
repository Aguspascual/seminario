from models.proveedor import Proveedor
from models.tipo_proveedor import TipoProveedor
from utils.database import db

class ProveedorService:
    
    @staticmethod
    def get_all():
        return Proveedor.query.all()
    
    @staticmethod
    def create_proveedor(data):
        # Verificar email único
        if Proveedor.query.filter_by(Email=data["Email"]).first():
             raise ValueError("El email ya está registrado")
             
        nuevo = Proveedor(
            Nombre=data["Nombre"],
            Numero=data["Numero"],
            Email=data["Email"],
            idTipo=data["idTipo"]
        )
        db.session.add(nuevo)
        db.session.commit()
        return nuevo

    @staticmethod
    def get_tipos():
        return TipoProveedor.query.all()
