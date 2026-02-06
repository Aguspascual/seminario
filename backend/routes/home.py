from flask import Blueprint, jsonify, request
from app import db  # Asegúrate de que apunte a donde instancias SQLAlchemy
from models import usuario # Importa tu modelo de usuario

home_bp = Blueprint('home', __name__)

@home_bp.route('/home-data', methods=['GET'])
def get_home_data():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Falta el token'}), 401

    try:
        # En una versión real, aquí decodificarías el JWT para obtener el email
        # Por ahora, probamos la conexión con el email de tu captura
        email_prueba = 'test@test.com'
        
        # Realizamos la consulta a la base de datos
        usuario = usuario.query.filter_by(Email=email_prueba).first()
        
        if not usuario:
            return jsonify({'error': 'Usuario no encontrado en la DB'}), 404

        # Retornamos los datos reales de tu tabla 'usuario'
        return jsonify({
            'nombre': usuario.nombre,
            'legajo': usuario.Legajo,
            'rol': usuario.Rol,
            'status': 'Conexión exitosa'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error de conexión: {str(e)}'}), 500