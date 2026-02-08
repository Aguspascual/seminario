from flask import Blueprint, request, jsonify
from models.insumo import Insumo, MovimientoInsumo
from models.usuario import Usuario
from utils.database import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from flask_jwt_extended import jwt_required, get_jwt_identity

insumos_bp = Blueprint('insumos_bp', __name__)

@insumos_bp.route('/insumos/dashboard-summary', methods=['GET'])
def get_dashboard_summary():
    """
    Obtener resumen de insumos para dashboard
    ---
    tags:
      - Insumos
    responses:
      200:
        description: Resumen de insumos (alertas de stock)
    """
    try:
        # Items con stock crítico
        criticos = Insumo.query.filter(Insumo.stock_actual <= Insumo.stock_minimo).all()
        
        return jsonify({
            "alertas_stock": len(criticos),
            "items_criticos": [i.to_dict() for i in criticos]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insumos_bp.route('/insumos', methods=['GET'])
def get_insumos():
    try:
        insumos = Insumo.query.all()
        return jsonify([i.to_dict() for i in insumos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@insumos_bp.route('/insumos', methods=['POST'])
@jwt_required()
def create_insumo():
    try:
        data = request.json
        nuevo_insumo = Insumo(
            nombre=data['nombre'],
            codigo=data.get('codigo'),
            descripcion=data.get('descripcion'),
            unidad=data['unidad'],
            proveedor_id=data.get('proveedor_id'),
            stock_minimo=data.get('stock_minimo', 0),
            stock_actual=data.get('stock_actual', 0)
        )
        db.session.add(nuevo_insumo)
        db.session.commit()
        return jsonify(nuevo_insumo.to_dict()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@insumos_bp.route('/insumos/<int:id>', methods=['PUT'])
@jwt_required()
def update_insumo(id):
    try:
        insumo = Insumo.query.get_or_404(id)
        data = request.json
        
        insumo.nombre = data.get('nombre', insumo.nombre)
        insumo.codigo = data.get('codigo', insumo.codigo)
        insumo.descripcion = data.get('descripcion', insumo.descripcion)
        insumo.unidad = data.get('unidad', insumo.unidad)
        insumo.proveedor_id = data.get('proveedor_id', insumo.proveedor_id)
        insumo.stock_minimo = data.get('stock_minimo', insumo.stock_minimo)
        
        db.session.commit()
        return jsonify(insumo.to_dict()), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@insumos_bp.route('/insumos/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_insumo(id):
    try:
        insumo = Insumo.query.get_or_404(id)
        # Check if there are movements or dependencies before deleting?
        # For now, hard delete.
        db.session.delete(insumo)
        db.session.commit()
        return jsonify({'message': 'Insumo eliminado correctamente'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@insumos_bp.route('/insumos/movimiento', methods=['POST'])
@jwt_required()
def registrar_movimiento():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        
        insumo_id = data.get('insumo_id')
        tipo = data.get('tipo') # 'ENTRADA', 'SALIDA'
        cantidad = float(data.get('cantidad', 0))
        motivo = data.get('motivo')
        
        if not insumo_id or not tipo or cantidad <= 0:
            return jsonify({'error': 'Datos inválidos'}), 400
            
        insumo = Insumo.query.get_or_404(insumo_id)
        
        if tipo == 'SALIDA' and insumo.stock_actual < cantidad:
            return jsonify({'error': 'Stock insuficiente'}), 400
            
        # Create movement record
        movimiento = MovimientoInsumo(
            insumo_id=insumo_id,
            tipo=tipo,
            cantidad=cantidad,
            usuario_id=current_user_id,
            motivo=motivo
        )
        
        # Update stock
        if tipo == 'ENTRADA':
            insumo.stock_actual += cantidad
        elif tipo == 'SALIDA':
            insumo.stock_actual -= cantidad
            
        db.session.add(movimiento)
        db.session.commit()
        
        return jsonify(insumo.to_dict()), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@insumos_bp.route('/insumos/<int:id>/movimientos', methods=['GET'])
def get_movimientos(id):
    try:
        movimientos = MovimientoInsumo.query.filter_by(insumo_id=id).order_by(MovimientoInsumo.fecha.desc()).all()
        return jsonify([m.to_dict() for m in movimientos]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
