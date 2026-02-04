from utils.database import db

class Area(db.Model):
    __tablename__ = 'area'

    idArea = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(45), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default="Activa")

    def __init__(self, nombre, estado="Activa"):
        self.nombre = nombre
        self.estado = estado

    @staticmethod
    def obtenerAreas():
        # Retorna solo las areas activas para el select de usuarios? 
        # O todas? Para consistencia con la UI de areas, devolvamos todas o filtremos según necesidad.
        # El metodo original devolvia un formato especifico para el frontend.
        area_map = Area.query.filter_by(estado="Activa").all()
        lista_areas = []
        for area in area_map:
            a = {area.nombre: area.idArea}
            lista_areas.append(a)
        # print(lista_areas)
        return lista_areas
    