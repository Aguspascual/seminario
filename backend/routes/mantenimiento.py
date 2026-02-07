from flask import Blueprint, request, jsonify
from services.mantenimiento_service import MantenimientoService

mantenimiento_bp = Blueprint('mantenimiento_bp', __name__)

@mantenimiento_bp.route('/mantenimientos/dashboard', methods=['GET'])
def get_dashboard():
    try:
        data = MantenimientoService.get_dashboard_kpis()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/mantenimientos/calendario', methods=['GET'])
def get_calendario():
    try:
        month = int(request.args.get('mes'))
        year = int(request.args.get('anio'))
        events = MantenimientoService.get_calendar_events(month, year)
        return jsonify({'eventos': events}), 200
    except ValueError:
         return jsonify({'error': 'Invalid month or year'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/mantenimientos/recientes', methods=['GET'])
def get_recientes():
    try:
        faults = MantenimientoService.get_recent_faults()
        return jsonify({'fallas': faults}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/mantenimientos', methods=['POST'])
def create_mantenimiento():
    try:
        data = request.json
        new_mant = MantenimientoService.create_mantenimiento(data)
        return jsonify({'message': 'Mantenimiento creado', 'id': new_mant.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/mantenimientos/<int:id>', methods=['PUT'])
def update_mantenimiento(id):
    try:
        data = request.json
        updated_mant = MantenimientoService.update_mantenimiento(id, data)
        if updated_mant:
            return jsonify({'message': 'Mantenimiento actualizado', 'mantenimiento': updated_mant.to_dict()}), 200
        return jsonify({'error': 'Mantenimiento no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/mantenimientos/<int:id>', methods=['DELETE'])
def delete_mantenimiento(id):
    try:
        success = MantenimientoService.delete_mantenimiento(id)
        if success:
            return jsonify({'message': 'Mantenimiento eliminado'}), 200
        return jsonify({'error': 'Mantenimiento no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- ReporteFalla Routes ---
@mantenimiento_bp.route('/reportes', methods=['POST'])
def create_reporte():
    try:
        data = request.json
        new_reporte = MantenimientoService.create_reporte_falla(data)
        return jsonify({'message': 'Reporte de falla creado', 'id': new_reporte.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/reportes', methods=['GET'])
def get_reportes():
    try:
        reportes = MantenimientoService.get_all_reportes_fallas()
        return jsonify({'reportes': reportes}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/reportes/<int:id>', methods=['PUT'])
def update_reporte(id):
    try:
        data = request.json
        updated_reporte = MantenimientoService.update_reporte_falla(id, data)
        if updated_reporte:
            return jsonify({'message': 'Reporte actualizado', 'reporte': updated_reporte.to_dict()}), 200
        return jsonify({'error': 'Reporte no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@mantenimiento_bp.route('/reportes/<int:id>', methods=['DELETE'])
def delete_reporte(id):
    try:
        success = MantenimientoService.delete_reporte_falla(id)
        if success:
            return jsonify({'message': 'Reporte eliminado'}), 200
        return jsonify({'error': 'Reporte no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
