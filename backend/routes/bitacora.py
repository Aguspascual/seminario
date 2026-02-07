from flask import Blueprint, jsonify, request
from models.bitacora import Bitacora
<<<<<<< HEAD
from models.usuario import Usuario  # Importante para el join
from utils.database import db
from flask_jwt_extended import jwt_required

bitacora_bp = Blueprint('bitacora_bp', __name__)

@bitacora_bp.route('/bitacora/recientes', methods=['GET'])
@jwt_required()
def get_bitacora_recientes():
    try:
        # Hacemos un join con Usuario para traer el nombre directamente de la base de datos
        registros = db.session.query(Bitacora, Usuario.nombre)\
            .join(Usuario, Bitacora.Usuario_idUsuario == Usuario.Legajo)\
            .order_by(Bitacora.FechaHora.desc())\
            .limit(10).all() # Traemos los últimos 10 para el dashboard

        resultado = []
        for reg, nombre_usuario in registros:
            resultado.append({
                "id": reg.idBitacora,
                "hora": reg.FechaHora.strftime('%H:%M'), # Formato 08:30 am
                "nombre": nombre_usuario,
                "mensaje": f"{nombre_usuario} {reg.Accion} {reg.Detalle if reg.Detalle else ''}"
            })

        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
=======
from utils.database import db

bitacora_bp = Blueprint('bitacora_bp', __name__)

@bitacora_bp.route('/bitacora', methods=['GET'])
def get_bitacora():
    try:
        registros = Bitacora.query.order_by(Bitacora.FechaHora.desc()).limit(50).all()
        resultado = []
        for reg in registros:
            resultado.append({
                "id": reg.idBitacora,
                "accion": reg.Accion,
                "detalle": reg.Detalle,
                "fecha": reg.FechaHora,
                "usuario": reg.Usuario_idUsuario # O el nombre si haces join
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
>>>>>>> origin/Home
