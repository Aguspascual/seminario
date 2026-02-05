from flask import Blueprint, request, jsonify
from schemas.proveedor_schema import ProveedorSchema
from services.proveedor_service import ProveedorService
from marshmallow import ValidationError

proveedores = Blueprint("proveedores", __name__)

@proveedores.route("/proveedores", methods=["GET"])
def get_proveedores():
    """
    Obtener lista de proveedores
    ---
    tags:
      - Proveedores
    responses:
      200:
        description: Lista de proveedores
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nombre:
                type: string
              numero:
                type: string
              email:
                type: string
              tipo:
                type: string
      500:
        description: Error interno
    """
    try:
        lista = ProveedorService.get_all()
        # Puedes crear un schema para lista pero por ahora to_dict() del modelo es ok
        # O mejor, usar el schema:
        schema = ProveedorSchema(many=True)
        return jsonify(schema.dump(lista)), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener proveedores: {str(e)}"}), 500

@proveedores.route("/proveedores", methods=["POST"])
def create_proveedor():
    """
    Crear un nuevo proveedor
    ---
    tags:
      - Proveedores
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - Nombre
            - Numero
            - Email
            - idTipo
          properties:
            Nombre:
              type: string
            Numero:
              type: string
            Email:
              type: string
            idTipo:
              type: integer
    responses:
      201:
        description: Proveedor creado
      400:
        description: Datos faltantes
      409:
        description: Email ya existe
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        
        # Validar
        schema = ProveedorSchema()
        validated_data = schema.load(data)
        
        # Crear servicio
        ProveedorService.create_proveedor(validated_data)
        
        return jsonify({"message": "Proveedor creado exitosamente"}), 201
        
    except ValidationError as err:
         return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except ValueError as err:
        return jsonify({"error": str(err)}), 409
    except Exception as e:
        return jsonify({"error": f"Error al crear proveedor: {str(e)}"}), 500

@proveedores.route("/tipos-proveedor", methods=["GET"])
def get_tipos_proveedor():
    """
    Obtener tipos de proveedor
    ---
    tags:
      - Proveedores
    responses:
      200:
        description: Lista de tipos de proveedor
    """
    try:
        tipos = ProveedorService.get_tipos()
        tipos_list = [tipo.to_dict() for tipo in tipos]
        return jsonify(tipos_list), 200
    except Exception as e:
        # Fallback a to_dict si el service falló (typo en nombre metodo)
        try:
             # Este bloque es por si cometi error en service name arriba
             from models.tipo_proveedor import TipoProveedor
             tipos = TipoProveedor.query.all()
             return jsonify([tipo.to_dict() for tipo in tipos]), 200
        except:
             return jsonify({"error": f"Error al obtener tipos de proveedor: {str(e)}"}), 500
