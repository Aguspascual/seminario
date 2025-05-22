from utils.db import db
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash

class Usuario (db.Model):
    id = db.Column(db.Integer, primary_key = True)
    nombre = db.Column(db.String(255))
    apellido = db.Column(db.String(255))
    usuario = db.Column(db.String(255))
    correo = db.Column(db.String(255))
    contrasena = db.Column(db.String(255))
    dni = db.Column(db.Integer)
    fotoPerfil = db.Column(db.String(255))
    tipoUsuario = db.Column(db.String(255))
    fechaCreacion = db.Column(db.DateTime)
    fechaUltimaVez = db.Column(db.DateTime)
    
    def __init__(self, nombre, apellido, usuario, correo, contrasena, dni, fotoPerfil, tipoUsuario):
        self.nombre = nombre 
        self.apellido = apellido 
        self.usuario = usuario 
        self.correo = correo 
        self.contrasena = generate_password_hash(contrasena)
        self.dni = dni 
        self.fotoPerfil = fotoPerfil 
        self.tipoUsuario = tipoUsuario 
        self.fechaUltimaVez = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.fechaCreacion = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    @classmethod
    def check_password(self, password_hashed, password):
        return check_password_hash(password_hashed, password)

    def verificar_usuario_y_contraseña(usuario, contrasena):
        usuario = Usuario.query.filter_by(usuario=usuario).first() 
        if usuario:
            if Usuario.check_password(usuario.contrasena, contrasena):
                usuario.fechaUltimaVez = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                db.session.commit()
                print("LA FOTO:",usuario.fotoPerfil)
                return {
                    'id': usuario.id,
                    'tipoUsuario': usuario.tipoUsuario,
                    'nombre': usuario.nombre,
                    'fotoPerfil': usuario.fotoPerfil #Asegurate de que fotoPerfil no sea None.

                }
            else:
                return "contraseña incorrecta"
        else:
            return "usuario no encontrado" 

    @staticmethod
    def modContrasena(idUsuario, contrasena, nuevaContrasena, nuevaContrasenaX2):
        usuario = Usuario.query.get(idUsuario)
        if usuario:
            if Usuario.check_password(usuario.contrasena, contrasena):
                if nuevaContrasena == nuevaContrasenaX2:
                    usuario.contrasena = generate_password_hash(nuevaContrasena)
                    usuario.fechaUltimaVez = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    db.session.commit()
                    return "contraseña modificada correctamente"
                else:
                    return "las nuevas contraseñas no coinciden"
            else:
                return "contraseña actual incorrecta"
        else:
            return "usuario no encontrado"

    @staticmethod
    def obtenerUsuarios():
        usuarios = Usuario.query.all()
        return usuarios

    @staticmethod
    def obtenerUsuarioPorId(id):
        usuario = Usuario.query.get(id)
        return usuario


        
