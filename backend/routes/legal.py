from flask import Blueprint, jsonify, request, send_from_directory
from models.legal import Legal
from utils.database import db
import os
from werkzeug.utils import secure_filename
from datetime import datetime


legal_bp = Blueprint('legal_bp', __name__)

# --- CONFIGURACIÓN DE CARPETA DE ARCHIVOS ---
# Esto crea una carpeta "uploads" en la raíz de tu proyecto si no existe
UPLOAD_FOLDER = os.path.abspath("uploads")
ALLOWED_EXTENSIONS = {'pdf'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- RUTA 1: OBTENER LISTA (GET) ---
# En React llamamos a: /legal/lista
@legal_bp.route('/legal/lista', methods=['GET'])
def get_legales():
    try:
        # Ordenamos por vencimiento para ver los urgentes primero
        documentos = Legal.query.order_by(Legal.FechaVencimiento.asc()).all()
        
        resultado = []
        hoy = datetime.now().date()

        for doc in documentos:
            # Recalculamos el estado al vuelo (por si venció hoy mismo)
            dias_restantes = (doc.FechaVencimiento - hoy).days
            estado_actual = 'Vigente'
            
            if dias_restantes < 0:
                estado_actual = 'Vencido'
            elif dias_restantes < 30:
                estado_actual = 'Por Vencer'

            resultado.append({
                "id": doc.idLegal,
                "titulo": doc.Titulo,
                "entidad": doc.Descripcion,  # En el front lo llamamos 'entidad'
                "vencimiento": str(doc.FechaVencimiento),
                "estado": estado_actual,     # Enviamos el estado calculado
                "archivo": doc.ArchivoUrl    # La URL para descargar
            })
            
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Error al listar: {e}")
        return jsonify({"error": str(e)}), 500

# --- RUTA 2: CREAR DOCUMENTO CON PDF (POST) ---
# En React llamamos a: /legal/crear
@legal_bp.route('/legal/crear', methods=['POST'])
def crear_legal():
    try:
        # 1. Validar que venga el archivo
        if 'archivo' not in request.files:
            return jsonify({"error": "No se envió archivo PDF"}), 400
        
        file = request.files['archivo']
        
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"error": "Archivo no válido (solo .pdf)"}), 400

        # 2. Guardar archivo físico
        filename = secure_filename(file.filename)
        # Agregamos fecha al nombre para que no se repitan (ej: 20240520_contrato.pdf)
        nombre_unico = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
        path_completo = os.path.join(UPLOAD_FOLDER, nombre_unico)
        file.save(path_completo)

        # 3. Calcular Estado inicial
        fecha_str = request.form['vencimiento']
        fecha_venc = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        hoy = datetime.now().date()
        dias = (fecha_venc - hoy).days

        estado_inicial = 'Vigente'
        if dias < 0: estado_inicial = 'Vencido'
        elif dias < 30: estado_inicial = 'Por Vencer'

        # 4. Guardar en Base de Datos (Supabase)
        nuevo_doc = Legal(
            Titulo=request.form['titulo'],
            Descripcion=request.form['entidad'], # Mapeamos 'entidad' del form a 'Descripcion'
            FechaVencimiento=fecha_venc,
            ArchivoUrl=f"/legal/download/{nombre_unico}" # Guardamos la ruta de descarga
        )
        nuevo_doc.Estado = estado_inicial # Forzamos el estado calculado

        db.session.add(nuevo_doc)
        db.session.commit()

        return jsonify({"mensaje": "Documento creado exitosamente"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear: {e}")
        return jsonify({"error": str(e)}), 500

# --- RUTA 3: DESCARGAR ARCHIVO (GET) ---
# Esta ruta sirve el archivo real cuando le dan click a "Descargar"
@legal_bp.route('/legal/download/<filename>')
def download_file(filename):
    try:
        return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "Archivo no encontrado"}), 404

#---- RUTA 4: SIRVE PARA EL DASHBOARD DEL HOME-----#  
@legal_bp.route('/legal/dashboard-status', methods=['GET'])
def dashboard_status():
    try:
        documentos = Legal.query.all()
        hoy = datetime.now().date()
        
        # Contadores iniciales
        resumen = {
            "total": 0,
            "vencidos": 0,
            "por_vencer": 0,
            "vigentes": 0,
            "estado_general": "OK" # O "ALERTA"
        }

        for doc in documentos:
            resumen["total"] += 1
            dias = (doc.FechaVencimiento - hoy).days

            if dias < 0:
                resumen["vencidos"] += 1
            elif dias < 30:
                resumen["por_vencer"] += 1
            else:
                resumen["vigentes"] += 1

        # Decidir el estado general de la planta para mostrar un mensaje
        if resumen["vencidos"] > 0:
            resumen["estado_general"] = "CRITICO"
        elif resumen["por_vencer"] > 0:
            resumen["estado_general"] = "ALERTA"

        return jsonify(resumen), 200

    except Exception as e:
        print(f"Error en dashboard status: {e}")
        return jsonify({"error": str(e)}), 500