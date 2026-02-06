from flask import Blueprint, jsonify, request
from models.bitacora import Bitacora
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