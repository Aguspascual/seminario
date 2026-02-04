from models.area import Area
from utils.database import db

class AreaService:
    
    @staticmethod
    def get_all_active():
        return Area.query.filter_by(estado="Activa").all()
    
    @staticmethod
    def create_area(data):
        new_area = Area(nombre=data["nombre"])
        db.session.add(new_area)
        db.session.commit()
        return new_area
        
    @staticmethod
    def update_area(id, data):
        area = Area.query.get(id)
        if not area:
             raise ValueError("Area no encontrada")
             
        if "nombre" in data:
            area.nombre = data["nombre"]
            
        db.session.commit()
        return area
        
    @staticmethod
    def delete_area(id):
        area = Area.query.get(id)
        if not area:
            raise ValueError("Area no encontrada")
            
        area.estado = "Eliminada"
        db.session.commit()
