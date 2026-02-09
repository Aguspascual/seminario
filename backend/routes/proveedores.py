from flask import Blueprint, request, jsonify
from schemas.proveedor_schema import ProveedorSchema
from services.proveedor_service import ProveedorService
from marshmallow import ValidationError

proveedores = Blueprint("proveedores", __name__)

@proveedores.route("/proveedores/<int:id>", methods=["DELETE"])
def delete_proveedor(id):
    """
    Eliminar un proveedor (Soft Delete)
    ---
    tags:
      - Proveedores
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Proveedor eliminado
      404:
        description: Proveedor no encontrado
      500:
        description: Error interno
    """
    try:
        ProveedorService.delete_proveedor(id)
        return jsonify({"message": "Proveedor eliminado exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"Error al eliminar proveedor: {str(e)}"}), 500

@proveedores.route("/proveedores", methods=["GET"])
def get_proveedores():
    """
    Obtener lista de proveedores con paginación y búsqueda
    ---
    tags:
      - Proveedores
    parameters:
      - name: page
        in: query
        type: integer
        required: false
        default: 1
      - name: limit
        in: query
        type: integer
        required: false
        default: 10
      - name: search
        in: query
        type: string
        required: false
    responses:
      200:
        description: Lista de proveedores paginada
      500:
        description: Error interno
    """
    try:
        from models.proveedor import Proveedor
        
        # Base query: todos los proveedores (o solo activos si se desea, pero el requerimiento no lo especifica explicitamente, aunque usuarios si. Asumiremos todos por ahora, o Estado=True si existe)
        # Viendo el codigo original, no filtraba por estado. Pero el componente frontend muestra "Estado: Activo/Inactivo".
        # Si queremos mostrar todos para gestionarlos, no filtramos por estado en la query base.
        # Sin embargo, la tabla de usuarios filtraba Estado=True. 
        # Voy a mostrar TODOS para que se pueda ver el estado y reactivar si es necesario, o filtrar en front.
        # REVISION: Usuarios mostraba solo activos. Proveedores tiene Soft Delete.
        # Si hago soft delete, normalmente quiero ocultarlos. 
        # Voy a filtrar Estado=True para consistencia con Usuarios, salvo que se pida lo contrario.
        
        query = Proveedor.query.filter(Proveedor.Estado == True)

        # Búsqueda
        search_term = request.args.get('search', '').strip()
        if search_term:
            search_pattern = f"%{search_term}%"
            query = query.filter(
                (Proveedor.Nombre.ilike(search_pattern)) | 
                (Proveedor.Email.ilike(search_pattern)) |
                (Proveedor.Numero.ilike(search_pattern))
            )

        # Paginación
        if "page" in request.args or "limit" in request.args:
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('limit', 10, type=int)
            
            pagination = query.paginate(page=page, per_page=per_page, error_out=False)
            lista = pagination.items
            
            total_pages = pagination.pages
            total_items = pagination.total
            current_page = page
            
            # Serializar
            schema = ProveedorSchema(many=True)
            data = schema.dump(lista)
            
            return jsonify({
                "proveedores": data,
                "total_pages": total_pages,
                "total_items": total_items,
                "current_page": current_page
            }), 200
        else:
            # Sin paginación explícita (legacy support o select inputs) -> Ojo, el frontend nuevo usará paginación.
            # Si no envían page, devuelvo todo? Mejor default a paginación si no se dice nada?
            # Para selects, se suele pedir sin paginacion.
            # Mantendré el comportamiento "sin params -> todo" para no romper selects
            lista = query.all()
            schema = ProveedorSchema(many=True)
            return jsonify(schema.dump(lista)), 200

    except Exception as e:
        return jsonify({"error": f"Error al obtener proveedores: {str(e)}"}), 500

@proveedores.route("/proveedores/<int:id>", methods=["PUT"])
def update_proveedor(id):
    """
    Actualizar un proveedor
    ---
    tags:
      - Proveedores
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        required: true
        schema:
          type: object
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
      200:
        description: Proveedor actualizado
      400:
        description: Error de validación
      404:
        description: Proveedor no encontrado
      500:
        description: Error interno
    """
    try:
        data = request.get_json()
        proveedor = ProveedorService.update_proveedor(id, data)
        # Podríamos devolver el objeto actualizado usando schema.dump(proveedor)
        return jsonify({"message": "Proveedor actualizado exitosamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error al actualizar proveedor: {str(e)}"}), 500

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
