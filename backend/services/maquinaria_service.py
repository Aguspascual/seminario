from models.maquinaria import Maquinaria
from utils.database import db

class MaquinariaService:
    @staticmethod
    def get_all():
        return Maquinaria.query.all()
    
    @staticmethod
    def get_by_id(id):
        return Maquinaria.query.get(id)

    @staticmethod
    def create_maquinaria(data):
        nueva = Maquinaria(
            nombre=data.get("nombre"),
            tipo=data.get("tipo"),
            anio=data.get("anio"),
            estado=data.get("estado", "Activa")
        )
        db.session.add(nueva)
        db.session.commit()
        return nueva

    @staticmethod
    def update_maquinaria(id, data):
        maquinaria = Maquinaria.query.get(id)
        if not maquinaria:
            raise ValueError("Maquinaria no encontrada")
        
        if "nombre" in data:
            maquinaria.nombre = data["nombre"]
        if "tipo" in data:
            maquinaria.tipo = data["tipo"]
        if "anio" in data:
            maquinaria.anio = data["anio"]
        if "estado" in data:
            maquinaria.estado = data["estado"]
            
        db.session.commit()
        return maquinaria

    @staticmethod
    def delete_maquinaria(id):
        maquinaria = Maquinaria.query.get(id)
        if not maquinaria:
            raise ValueError("Maquinaria no encontrada")
            
        # ¿Eliminación física o lógica? Usamos eliminación física estándar por ahora.
        # Si se requiere eliminación lógica: maquinaria.estado = "Inactiva"; db.session.commit()
        db.session.delete(maquinaria)
        db.session.commit()
        return True
