from utils.database import db

class Grupo(db.Model):
    __tablename__ = 'grupo'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'turnos': [t.to_dict() for t in self.turnos]
        }

class Turno(db.Model):
    __tablename__ = 'turno'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    grupo_id = db.Column(db.Integer, db.ForeignKey('grupo.id'), nullable=False)
    nombre = db.Column(db.String(50), nullable=False) # Mañana, Tarde, Noche
    hora_inicio = db.Column(db.String(5), nullable=False) # HH:MM
    hora_fin = db.Column(db.String(5), nullable=False) # HH:MM

    grupo = db.relationship('Grupo', backref=db.backref('turnos', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            'id': self.id,
            'grupo_id': self.grupo_id,
            'nombre': self.nombre,
            'hora_inicio': self.hora_inicio,
            'hora_fin': self.hora_fin
        }
