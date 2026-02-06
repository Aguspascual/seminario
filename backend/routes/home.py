from flask import Blueprint, jsonify, request
from utils.database import db
from models.usuario import Usuario

home_bp = Blueprint('home', __name__)

@home_bp.route('/home-data', methods=['GET'])
def get_home_data():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({'error': 'Falta el token'}), 401

    try:
        # En una versión real, aquí decodificarías el JWT para obtener el email
        # Por ahora, probamos la conexión con el email de prueba
        email_prueba = 'test@test.com'

        # Realizamos la consulta a la base de datos
        # Usamos 'Email' (Mayúscula) según el modelo Usuario
        usuario = Usuario.query.filter_by(Email=email_prueba).first()

        if not usuario:
            # Si no existe, devolvemos un mock o error, depende del caso de uso.
            # Para evitar romper si no hay usuario 'test', devolvemos datos mockeados si falla la query
            return jsonify({
                 'nombre': 'Usuario Test',
                 'legajo': 0,
                 'rol': 'Invitado',
                 'status': 'Usuario test no encontrado, pero conexión OK'
            }), 200

        # Retornamos los datos reales de tu tabla 'usuario'
        return jsonify({
            'nombre': usuario.nombre,
            'legajo': usuario.Legajo,
            'rol': usuario.Rol,
            'status': 'Conexión exitosa'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error de conexión: {str(e)}'}), 500
