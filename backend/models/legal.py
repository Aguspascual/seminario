from utils.database import db

class Legal(db.Model):
    __tablename__ = 'legal'

    idLegal = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Titulo = db.Column(db.String(100), nullable=False)        # Ej: "Seguro Ambiental"
    Descripcion = db.Column(db.String(255), nullable=True)
    FechaVencimiento = db.Column(db.Date, nullable=False)     # Clave para el semáforo
    FechaCarga = db.Column(db.DateTime, default=db.func.current_timestamp())
    ArchivoUrl = db.Column(db.String(500), nullable=True)     # Link al PDF en Supabase
    Estado = db.Column(db.String(20), default='Vigente')      # 1 'Vigente', 2 'Por Vencer', 0 'Vencido'

    def __init__(self, Titulo, Descripcion, FechaVencimiento, ArchivoUrl):
        self.Titulo = Titulo
        self.Descripcion = Descripcion
        self.FechaVencimiento = FechaVencimiento
        self.ArchivoUrl = ArchivoUrl
        self.Estado = 'Vigente' # Por defecto nace vigente
