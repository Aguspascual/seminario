from flask import Blueprint, request, jsonify
from utils.database import db
from models.proveedor import Proveedor
from models.tipo_proveedor import TipoProveedor

proveedores = Blueprint("proveedores", __name__)

@proveedores.route("/proveedores", methods=["GET"])
def get_proveedores():
    try:
        listaProveedores = Proveedor.query.all()
        
        # Convertir objetos SQLAlchemy a diccionarios para serialización JSON
        proveedores_list = []
        for proveedor in listaProveedores:
            if proveedor.idTipo:
                tipo = tipo.query.get(proveedor.idTipo)
            proveedores_list.append(proveedor.to_dict())
        
        return jsonify(proveedores_list), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener proveedores: {str(e)}"}), 500

@proveedores.route("/proveedores", methods=["POST"])
def create_proveedor():
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        if not data or not all(
            k in data for k in ("Nombre", "Numero", "Email", "idTipo")
        ):
            return jsonify({"error": "Los campos Nombre, Numero, Email e idTipo son requeridos"}), 400
        
        # Verificar si el email ya existe
        proveedor_existente = Proveedor.query.filter_by(Email=data["Email"]).first()
        if proveedor_existente:
            return jsonify({"error": "El email ya está registrado"}), 409
        
        # Crear nuevo proveedor
        nuevo_proveedor = Proveedor(
            Nombre=data["Nombre"],
            Numero=data["Numero"],
            Email=data["Email"],
            idTipo=data["idTipo"]
        )
        
        db.session.add(nuevo_proveedor)
        db.session.commit()
        
        return jsonify({"message": "Proveedor creado exitosamente"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al crear proveedor: {str(e)}"}), 500


@proveedores.route("/tipos-proveedor", methods=["GET"])
def get_tipos_proveedor():
    try:
        tipos = TipoProveedor.query.all()
        tipos_list = [tipo.to_dict() for tipo in tipos]
        return jsonify(tipos_list), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener tipos de proveedor: {str(e)}"}), 500
