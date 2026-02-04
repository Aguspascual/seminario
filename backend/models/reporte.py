from utils.database import db
import datetime

class Reporte(db.Model):
    __tablename__ = 'reporte'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    fechaCreacion = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now)
    asunto = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    nombreArchivo = db.Column(db.String(255), nullable=True)
    
    # Claves foráneas
    idUsuarioEmisor = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=False)
    idUsuarioReceptor = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=True) # Puede ser nulo al principio? O se asigna al crear?
    # El usuario dijo: "Cuando el usuario Receptor responde... este debe llenar los datos del idUsuarioReceptor"
    # Entonces al crear es Null.

    respuesta = db.Column(db.Text, nullable=True)
    fechaRespuesta = db.Column(db.DateTime, nullable=True)

    def __init__(self, asunto, descripcion, idUsuarioEmisor, nombreArchivo=None):
        self.asunto = asunto
        self.descripcion = descripcion
        self.idUsuarioEmisor = idUsuarioEmisor
        self.nombreArchivo = nombreArchivo
        self.fechaCreacion = datetime.datetime.now()
