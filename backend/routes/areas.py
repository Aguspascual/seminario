from flask import Blueprint, request, jsonify
from utils.database import db
from models.area import Area

areas_bp = Blueprint("areas", __name__)

@areas_bp.route("/areas", methods=["GET"])
def get_areas():
    try:
        # Obtener todas las areas activas
        areas = Area.query.filter_by(estado="Activa").all()
        areas_list = []
        for area in areas:
            areas_list.append({
                "id": area.idArea,
                "nombre": area.nombre,
                "estado": area.estado
            })
        return jsonify(areas_list), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener areas: {str(e)}"}), 500

@areas_bp.route("/areas", methods=["POST"])
def create_area():
    try:
        data = request.get_json()
        if not data or "nombre" not in data:
            return jsonify({"error": "El nombre es requerido"}), 400
        
        nombre = data["nombre"]
        new_area = Area(nombre=nombre) # Default es "Activa"
        db.session.add(new_area)
        db.session.commit()
        
        return jsonify({"message": "Area creada exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": f"Error al crear area: {str(e)}"}), 500

@areas_bp.route("/areas/<int:id>", methods=["PUT"])
def update_area(id):
    try:
        area = Area.query.get(id)
        if not area:
            return jsonify({"error": "Area no encontrada"}), 404
        
        data = request.get_json()
        if "nombre" in data:
            area.nombre = data["nombre"]
            
        db.session.commit()
        return jsonify({"message": "Area actualizada exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": f"Error al actualizar area: {str(e)}"}), 500

@areas_bp.route("/areas/<int:id>", methods=["DELETE"])
def delete_area(id):
    try:
        area = Area.query.get(id)
        if not area:
            return jsonify({"error": "Area no encontrada"}), 404
        
        # Soft delete: cambiar estado a "Eliminada"
        area.estado = "Eliminada"
        db.session.commit()
        return jsonify({"message": "Area eliminada exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": f"Error al eliminar area: {str(e)}"}), 500
