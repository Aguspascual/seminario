from flask import Blueprint, request, jsonify
from utils.database import db
from models.mensaje import Mensaje
from models.usuario import Usuario
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_, and_, func

mensajes_bp = Blueprint("mensajes", __name__)

@mensajes_bp.route("/mensajes", methods=["POST"])
@jwt_required()
def enviar_mensaje():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        id_receptor = data.get("idUsuarioReceptor")
        texto_mensaje = data.get("mensaje")
        
        if not id_receptor or not texto_mensaje:
            return jsonify({"error": "Faltan datos (receptor o mensaje)"}), 400
            
        nuevo_mensaje = Mensaje(
            idUsuarioEmisor=current_user_id,
            idUsuarioReceptor=int(id_receptor),
            mensaje=texto_mensaje
        )
        
        db.session.add(nuevo_mensaje)
        db.session.commit()
        
        return jsonify({"message": "Mensaje enviado"}), 201
        
    except Exception as e:
        return jsonify({"error": f"Error al enviar mensaje: {str(e)}"}), 500

@mensajes_bp.route("/mensajes/conversaciones", methods=["GET"])
@jwt_required()
def obtener_conversaciones():
    try:
        current_user_id = get_jwt_identity()
        
        # Obtener IDs de usuarios con los que he interactuado (enviado o recibido)
        # Subquery para encontrar el último mensaje de cada conversación
        # Esto es complejo en SQLAlchemy puro sin lógica extra, simplificaremos:
        # 1. Obtener todos los mensajes donde soy emisor o receptor.
        # 2. Agrupar por el "otro" usuario.
        
        # Enfoque más simple: Traer distinct usuarios
        enviados = db.session.query(Mensaje.idUsuarioReceptor).filter_by(idUsuarioEmisor=current_user_id).distinct()
        recibidos = db.session.query(Mensaje.idUsuarioEmisor).filter_by(idUsuarioReceptor=current_user_id).distinct()
        
        contactos_ids = set([r[0] for r in enviados] + [r[0] for r in recibidos])
        
        conversaciones = []
        for contacto_id in contactos_ids:
             usuario = Usuario.query.get(contacto_id)
             if usuario:
                 # Obtener último mensaje
                 ultimo_msg = Mensaje.query.filter(
                     or_(
                         and_(Mensaje.idUsuarioEmisor == current_user_id, Mensaje.idUsuarioReceptor == contacto_id),
                         and_(Mensaje.idUsuarioEmisor == contacto_id, Mensaje.idUsuarioReceptor == current_user_id)
                     )
                 ).order_by(Mensaje.fechaHora.desc()).first()
                 
                 # Contar no leídos de este usuario hacia mí
                 no_leidos = Mensaje.query.filter_by(
                     idUsuarioEmisor=contacto_id, 
                     idUsuarioReceptor=current_user_id, 
                     leido=False
                 ).count()
                 
                 conversaciones.append({
                     "id": usuario.Legajo,
                     "nombre": usuario.nombre,
                     "ultimoMensaje": ultimo_msg.mensaje if ultimo_msg else "",
                     "fechaUltimo": ultimo_msg.fechaHora.isoformat() if ultimo_msg else "",
                     "noLeidos": no_leidos
                 })
        
        # Ordenar por fecha del último mensaje
        conversaciones.sort(key=lambda x: x['fechaUltimo'], reverse=True)
        
        return jsonify(conversaciones), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener conversaciones: {str(e)}"}), 500

@mensajes_bp.route("/mensajes/<int:contacto_id>", methods=["GET"])
@jwt_required()
def obtener_chat(contacto_id):
    try:
        current_user_id = get_jwt_identity()
        
        # Marcar como leídos los mensajes recibidos de este contacto
        mensajes_no_leidos = Mensaje.query.filter_by(
            idUsuarioEmisor=contacto_id,
            idUsuarioReceptor=current_user_id,
            leido=False
        ).all()
        
        for msg in mensajes_no_leidos:
            msg.leido = True
        db.session.commit()
        
        # Obtener historial
        mensajes = Mensaje.query.filter(
            or_(
                and_(Mensaje.idUsuarioEmisor == current_user_id, Mensaje.idUsuarioReceptor == contacto_id),
                and_(Mensaje.idUsuarioEmisor == contacto_id, Mensaje.idUsuarioReceptor == current_user_id)
            )
        ).order_by(Mensaje.fechaHora.asc()).all()
        
        result = []
        for m in mensajes:
            result.append({
                "id": m.id,
                "emisor": m.idUsuarioEmisor,
                "receptor": m.idUsuarioReceptor,
                "mensaje": m.mensaje,
                "fecha": m.fechaHora.isoformat(),
                "leido": m.leido
            })
            
        return jsonify(result), 200
        
    except Exception as e:
         return jsonify({"error": f"Error al obtener chat: {str(e)}"}), 500

@mensajes_bp.route("/mensajes/no-leidos", methods=["GET"])
@jwt_required()
def contar_no_leidos():
    try:
        current_user_id = get_jwt_identity()
        count = Mensaje.query.filter_by(idUsuarioReceptor=current_user_id, leido=False).count()
        return jsonify({"cantidad": count}), 200
    except Exception as e:
        return jsonify({"error": f"Error al contar mensajes: {str(e)}"}), 500
