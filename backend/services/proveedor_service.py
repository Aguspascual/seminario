from models.proveedor import Proveedor
from models.tipo_proveedor import TipoProveedor
from utils.database import db

class ProveedorService:
    
    @staticmethod
    def get_all():
        return Proveedor.query.filter_by(Estado=True).all()
    
    @staticmethod
    def delete_proveedor(id):
        proveedor = Proveedor.query.get(id)
        if not proveedor:
            raise ValueError("Proveedor no encontrado")
        
        proveedor.Estado = False
        db.session.commit()
        return proveedor

    @staticmethod
    def update_proveedor(id, data):
        proveedor = Proveedor.query.get(id)
        if not proveedor:
            raise ValueError("Proveedor no encontrado")
        
        # Opcional: Validar email único si cambia
        if data.get("Email") and data.get("Email") != proveedor.Email:
            if Proveedor.query.filter_by(Email=data["Email"]).first():
                raise ValueError("El email ya está registrado")

        proveedor.Nombre = data.get("Nombre", proveedor.Nombre)
        proveedor.Numero = data.get("Numero", proveedor.Numero)
        proveedor.Email = data.get("Email", proveedor.Email)
        proveedor.idTipo = data.get("idTipo", proveedor.idTipo)
        
        db.session.commit()
        return proveedor

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
