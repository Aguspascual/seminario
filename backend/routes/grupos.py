from flask import Blueprint, request, jsonify
from models.grupos import Grupo, Turno
from utils.database import db

grupos_bp = Blueprint('grupos_bp', __name__)

@grupos_bp.route('/grupos', methods=['GET'])
def get_grupos():
    grupos = Grupo.query.all()
    return jsonify([g.to_dict() for g in grupos]), 200

@grupos_bp.route('/grupos', methods=['POST'])
def create_grupo():
    data = request.json
    nombre = data.get('nombre')
    
    if not nombre:
        return jsonify({'error': 'Nombre es requerido'}), 400
        
    nuevo_grupo = Grupo(nombre=nombre)
    db.session.add(nuevo_grupo)
    db.session.commit()
    
    # Add shifts if provided
    turnos = data.get('turnos', [])
    for t in turnos:
        if t.get('nombre') and t.get('hora_inicio') and t.get('hora_fin'):
            nuevo_turno = Turno(
                grupo_id=nuevo_grupo.id,
                nombre=t['nombre'],
                hora_inicio=t['hora_inicio'],
                hora_fin=t['hora_fin']
            )
            db.session.add(nuevo_turno)
    
    db.session.commit()
    return jsonify(nuevo_grupo.to_dict()), 201

@grupos_bp.route('/grupos/<int:id>', methods=['PUT'])
def update_grupo(id):
    grupo = Grupo.query.get_or_404(id)
    data = request.json
    
    grupo.nombre = data.get('nombre', grupo.nombre)
    
    if 'turnos' in data:
        # Clear existing shifts
        Turno.query.filter_by(grupo_id=id).delete()
        for t in data['turnos']:
            nuevo_turno = Turno(
                grupo_id=id,
                nombre=t['nombre'],
                hora_inicio=t['hora_inicio'],
                hora_fin=t['hora_fin']
            )
            db.session.add(nuevo_turno)
            
    db.session.commit()
    return jsonify(grupo.to_dict()), 200

@grupos_bp.route('/grupos/<int:id>', methods=['DELETE'])
def delete_grupo(id):
    grupo = Grupo.query.get_or_404(id)
    db.session.delete(grupo)
    db.session.commit()
    return jsonify({'message': 'Grupo eliminado'}), 200
