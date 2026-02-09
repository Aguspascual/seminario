from flask import Blueprint, request, jsonify
import secrets
import string
from utils.database import db
from utils.extensions import mail 
from flask_mail import Message
from models.usuario import Usuario
from werkzeug.security import generate_password_hash

bp_recuperar = Blueprint('recuperar_password', __name__)

@bp_recuperar.route('/recuperar-password', methods=['POST'])
def recuperar():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Falta el email'}), 400

        # 2. Buscar usuario
        # IMPORTANTE: El modelo tiene 'Email' con mayuscula
        user_obj = Usuario.query.filter_by(Email=email).first()

        if not user_obj:
            # Si no existe, devolvemos error (o mentimos por seguridad, tú decides)
            return jsonify({'error': 'Email no encontrado'}), 404

        # 3. Generar contraseña temporal FIJA
        pass_temporal = "KE&MQR98"

        # 4. Guardar en base de datos (Encriptada)
        # El modelo usa 'contrasena', no 'password'
        user_obj.contrasena = generate_password_hash(pass_temporal)
        db.session.commit()

        # 5. Enviar correo real
        msg = Message("Nueva Contraseña - Ecopolo",
                      recipients=[email])
        msg.body = f"""Hola,
        
Tu contraseña ha sido restablecida exitosamente.
Tu nueva contraseña temporal es: {pass_temporal}

Por favor, inicia sesión y cámbiala lo antes posible desde tu perfil.

Saludos,
El equipo de Ecopolo
"""
        
        # HTML Design
        msg.html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; }}
                .header {{ background-color: #2E4F6E; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ padding: 30px; background-color: white; }}
                .password-box {{ background-color: #e8f5e9; border: 1px solid #c8e6c9; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 2px; color: #2E7D32; border-radius: 5px; }}
                .footer {{ margin-top: 20px; font-size: 12px; color: #777; text-align: center; }}
                .btn {{ display: inline-block; background-color: #2E4F6E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Ecopolo</h1>
                    <p>Recuperación de Contraseña</p>
                </div>
                <div class="content">
                    <p>Hola,</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña. Tu cuenta ha sido actualizada con una contraseña temporal segura.</p>
                    
                    <div class="password-box">
                        {pass_temporal}
                    </div>
                    
                    <p>Por motivos de seguridad, te recomendamos iniciar sesión y cambiar esta contraseña inmediatamente desde tu perfil.</p>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/login" class="btn" style="color: white;">Iniciar Sesión</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Si no solicitaste este cambio, por favor contacta con soporte inmediatamente.</p>
                    <p>&copy; 2026 Ecopolo. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        mail.send(msg)

        return jsonify({'message': 'Correo enviado correctamente'}), 200

    except Exception as e:
        print(f"Error en backend: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500
