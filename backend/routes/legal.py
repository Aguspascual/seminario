from flask import Blueprint, jsonify, request
from models.legal import Legal
from utils.database import db

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
    return jsonify({"mensaje": "Documento legal creado"}), 201