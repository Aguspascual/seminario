from models.usuario import Usuario
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
import datetime
import os

class AuthService:
    
    @staticmethod
    def login(data):
        """
        Autentica al usuario y genera un JWT.
        Retorna (dict_usuario, token) o lanza ValueError.
        """
        email = data["email"].strip().lower()
        contrasena = data["contrasena"].strip()
        
        usuario = Usuario.query.filter_by(Email=email).first()
        
        if not usuario or not check_password_hash(usuario.contrasena, contrasena):
            raise ValueError("Email o contraseña inválidos")
            
        # Crear token
        expiration_days = int(os.getenv("JWT_EXPIRATION_DAYS", 365))
        expires = datetime.timedelta(days=expiration_days)
        
        identity = str(usuario.Legajo)
        additional_claims = {
            "rol": usuario.Rol, 
            "nombre": usuario.nombre,
            "email": usuario.Email
        }
        
        access_token = create_access_token(identity=identity, additional_claims=additional_claims, expires_delta=expires)
        
        user_data = {
            "id": usuario.Legajo,
            "nombre": usuario.nombre,
            "email": usuario.Email,
            "rol": usuario.Rol
        }
        
        return user_data, access_token
