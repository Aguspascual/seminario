from flask import Blueprint, request, jsonify
from utils.database import db
from models.usuario import Usuario
from werkzeug.security import check_password_hash

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
                return jsonify({"message": "Login successful", "user": usuario.nombre}), 200
            else:
                return jsonify({"error": "Email o contraseña inválidos"}), 401
        else:
            return jsonify({"error": "Email o contraseña inválidos"}), 401

    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500