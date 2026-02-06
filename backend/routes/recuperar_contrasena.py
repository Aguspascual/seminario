from flask import Blueprint, request, jsonify
import secrets
import string
from app import db 
from models import usuario
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
        usuario = usuario.query.filter_by(email=email).first()

        if not usuario:
            # Si no existe, devolvemos error (o mentimos por seguridad, tú decides)
            return jsonify({'error': 'Email no encontrado'}), 404

        # 3. Generar contraseña temporal (ej: "Xy9zP2qL")
        caracteres = string.ascii_letters + string.digits
        pass_temporal = ''.join(secrets.choice(caracteres) for i in range(8))

        # 4. Guardar en base de datos (Encriptada)
        # Asumiendo que tu modelo tiene un campo 'password'
        usuario.password = generate_password_hash(pass_temporal)
        db.session.commit()

        # 5. SIMULACIÓN: Mostrar en la consola negra (Terminal)
        print("\n" + "="*50)
        print(f"📧 EMAIL ENVIADO A: {email}")
        print(f"🔑 CONTRASEÑA TEMPORAL: {pass_temporal}")
        print("="*50 + "\n")

        return jsonify({'message': 'Correo enviado correctamente'}), 200

    except Exception as e:
        print(f"Error en backend: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500