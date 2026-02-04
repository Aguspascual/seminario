from utils.database import db


class Usuario(db.Model):
    __tablename__ = 'usuario'
    
    Legajo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Area_idArea = db.Column(db.Integer, db.ForeignKey("area.idArea"), nullable=False)
    nombre = db.Column(db.String(25), nullable=True)
    contrasena = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(45), nullable=False)
    Telefono = db.Column(db.String(20), nullable=False)
    Rol = db.Column(db.String(45), nullable=False, default=1)
    Estado = db.Column(db.Boolean, nullable=False, default=1)
    FechaCreacion = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    UltimaVez = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())

    def __init__(self, Area_idArea, nombre, contrasena, Email, Telefono, Rol):
        self.Area_idArea = Area_idArea
        self.nombre = nombre
        self.contrasena = contrasena
        self.Email = Email
        self.Telefono = Telefono
        self.Rol = Rol
        #Legajo se autoincrementa
    



    area = db.relationship("Area", backref="usuario")
    