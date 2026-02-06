from utils.database import db
import datetime

class Mensaje(db.Model):
    __tablename__ = 'mensaje'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    idUsuarioEmisor = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=False)
    idUsuarioReceptor = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    fechaHora = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    leido = db.Column(db.Boolean, nullable=False, default=False)

    def __init__(self, idUsuarioEmisor, idUsuarioReceptor, mensaje):
        self.idUsuarioEmisor = idUsuarioEmisor
        self.idUsuarioReceptor = idUsuarioReceptor
        self.mensaje = mensaje
        self.fechaHora = datetime.datetime.now()
        self.leido = False
