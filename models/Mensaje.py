from utils.db import db
from datetime import datetime

class Mensaje(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    descripcion = db.Column(db.String(500))
    fecha = db.Column(db.DateTime)
    idEmisor = db.Column(db.Integer)
    idReceptor = db.Column(db.Integer)


    def __init__(self, idEmisor, idReceptor, descripcion):
        self.idEmisor = idEmisor
        self.idReceptor = idReceptor
        self.descripcion = descripcion
        self.fecha = datetime.now().strftime("%Y-%m-%d %H:%M:%S")