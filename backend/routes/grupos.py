from flask import Blueprint, request, jsonify
from models.grupos import Grupo, Turno
from models.usuario import Usuario
from utils.database import db
from datetime import datetime

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

@grupos_bp.route('/turnos/actual', methods=['GET'])
def get_turno_actual():
    try:
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        
        # Obtener todos los turnos
        # Obtener todos los turnos
        turnos = Turno.query.all()
        turnos_activos = []
        
        for t in turnos:
            start = t.hora_inicio
            end = t.hora_fin
            
            # Caso normal: start < end (ej: 06:00 - 14:00)
            if start <= end:
                if start <= current_time_str <= end:
                    turnos_activos.append(t)
            # Caso nocturno: start > end (ej: 22:00 - 06:00)
            else:
                if current_time_str >= start or current_time_str <= end:
                    turnos_activos.append(t)
        
        if not turnos_activos:
            return jsonify({
                "turnos": [],
                "usuarios": [],
                "mensaje": "No hay turnos activos en este momento"
            }), 200
            
        # Buscar usuarios de los turnos activos
        ids_turnos = [t.id for t in turnos_activos]
        usuarios_activos = Usuario.query.filter(Usuario.turno_id.in_(ids_turnos), Usuario.Estado == True).all()
        
        usuarios_data = [{
            "id": u.Legajo,
            "nombre": u.nombre,
            "rol": u.Rol,
            "area": u.area.nombre if u.area else "Sin área",
            "turno": u.turno.nombre if u.turno else "Sin turno"
        } for u in usuarios_activos]
        
        turnos_data = [{
            "id": t.id,
            "nombre": t.nombre,
            "hora_inicio": t.hora_inicio,
            "hora_fin": t.hora_fin,
            "grupo": t.grupo.nombre if t.grupo else "Sin grupo"
        } for t in turnos_activos]
        
        return jsonify({
            "turnos": turnos_data,
            "usuarios": usuarios_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
