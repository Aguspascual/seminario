from flask import Blueprint, request, jsonify
from utils.database import db
from models.usuario import Usuario
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
import datetime
import os

login_bp = Blueprint("login", __name__)

@login_bp.route("/login", methods=["POST"])
def loginpost():
    try:
        data = request.get_json()

        # Validar que los campos requeridos estén presentes
        if not data or "email" not in data or "contrasena" not in data:
            return jsonify(
                {"error": "Los campos 'email' y 'contrasena' son requeridos"}
            ), 400

        email = data["email"].strip().lower() # Normalizar email
        contrasena = data["contrasena"].strip() # Normalizar contraseña (quitar espacios extra)

        # Validar que los campos no estén vacíos
        if not email or not contrasena:
             return jsonify({"error": "Los campos no pueden estar vacíos"}), 400

        usuario = Usuario.query.filter_by(Email=email).first()
        
        if usuario:
            if check_password_hash(usuario.contrasena, contrasena):
                # Crear token con expiración desde .env (default 365 días)
                expiration_days = int(os.getenv("JWT_EXPIRATION_DAYS", 365))
                expires = datetime.timedelta(days=expiration_days)
                # Incluir información extra en la identidad o claims si es necesario
                identity = str(usuario.Legajo) # Usar ID o Legajo como identidad
                additional_claims = {
                    "rol": usuario.Rol, 
                    "nombre": usuario.nombre,
                    "email": usuario.Email
                }
                
                access_token = create_access_token(identity=identity, additional_claims=additional_claims, expires_delta=expires)
                
                return jsonify({
                    "message": "Login successful", 
                    "user": {
                        "id": usuario.Legajo,
                        "nombre": usuario.nombre,
                        "email": usuario.Email,
                        "rol": usuario.Rol
                    },
                    "access_token": access_token
                }), 200
            else:
                return jsonify({"error": "Email o contraseña inválidos"}), 401
        else:
            return jsonify({"error": "Email o contraseña inválidos"}), 401

    except Exception as e:
        print(e)
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500