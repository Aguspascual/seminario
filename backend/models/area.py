from utils.database import db

class Area(db.Model):
    __tablename__ = 'area'

    idArea = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(45), nullable=False)

    def obtenerAreas():
        area_map = Area.query.all()
        lista_areas = []
        for area in area_map:
            a = {area.nombre: area.idArea}
            lista_areas.append(a)
        print(lista_areas)
        return lista_areas
    