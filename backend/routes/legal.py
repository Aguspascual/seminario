from flask import Blueprint, jsonify, request
from models.legal import Legal
from utils.database import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from utils.logger import registrar_accion

legal_bp = Blueprint('legal_bp', __name__)

@legal_bp.route('/legal', methods=['GET'])
def get_legales():
    try:
        documentos = Legal.query.all()
        # Convertimos los objetos a JSON
        resultado = []
        for doc in documentos:
            resultado.append({
                "id": doc.idLegal,
                "titulo": doc.Titulo,
                "vencimiento": str(doc.FechaVencimiento),
                "estado": doc.Estado
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@legal_bp.route('/legal', methods=['POST'])
def crear_legal():
    data = request.json
    nuevo_doc = Legal(
        Titulo=data['titulo'],
        Descripcion=data.get('descripcion'),
        FechaVencimiento=data['fechaVencimiento'],
        ArchivoUrl=data.get('archivoUrl')
    )
    db.session.add(nuevo_doc)
    db.session.commit()
    user_id = get_jwt_identity() # Obtienes el ID del token
    registrar_accion(user_id, "Subió un documento", data.get('titulo')) #sirve para actualizar la bitacora continuamente
    return jsonify({"mensaje": "Documento legal creado"}), 201

@legal_bp.route('/legal/dashboard-status', methods=['GET'])
@jwt_required()
def get_dashboard_status():
    try:
        # Buscamos los documentos específicos por título (ajusta los nombres a tu BD)
        docs_criticos = Legal.query.filter(Legal.Titulo.in_(['Habilitación Provincial', 'Seguro Ambiental', 'Certificado ISO'])).all()
        
        hoy = datetime.now()
        semaforo = []

        for doc in docs_criticos:
            # Lógica para determinar el icono y estado
            dias_para_vencer = (doc.FechaVencimiento - hoy.date()).days
            
            estado_visual = "ok" # ✅
            if dias_para_vencer <= 0:
                estado_visual = "danger" # ❌
            elif dias_para_vencer <= 30:
                estado_visual = "warning" # ⚠️

            semaforo.append({
                "titulo": doc.Titulo,
                "vencimiento": doc.FechaVencimiento.strftime('%m/%Y'),
                "dias_restantes": dias_para_vencer,
                "estado_visual": estado_visual
            })

        return jsonify(semaforo), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
