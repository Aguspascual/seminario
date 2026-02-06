from utils.database import db

class Bitacora(db.Model):
    __tablename__ = 'bitacora'

    idBitacora = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Usuario_idUsuario = db.Column(db.Integer, db.ForeignKey("usuario.Legajo"), nullable=False) # Se vincula con el Legajo 
    Accion = db.Column(db.String(100), nullable=False)  # Ej: "Crear", "Eliminar"
    Detalle = db.Column(db.String(255), nullable=True)  # detalle de la acción
    FechaHora = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

    def __init__(self, Usuario_idUsuario, Accion, Detalle):
        self.Usuario_idUsuario = Usuario_idUsuario
        self.Accion = Accion
        self.Detalle = Detalle
        # La fecha se pone sola gracias al default

    # Relación para acceder a los datos del usuario desde la bitácora
    usuario_rel = db.relationship("Usuario", backref=db.backref("bitacoras", lazy=True))
