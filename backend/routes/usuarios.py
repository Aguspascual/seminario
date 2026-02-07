from flask import Blueprint, request, jsonify
from utils.database import db
from models.usuario import Usuario
from models.area import Area
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity
from schemas.usuario_schema import UsuarioSchema
from services.usuario_service import UsuarioService
from marshmallow import ValidationError

usuarios = Blueprint("usuarios", __name__)

@usuarios.route("/usuarios", methods=["GET"])
def get_usuarios():
    """
    Obtener lista de todos los usuarios
    ---
    tags:
      - Usuarios
    responses:
      200:
        description: Lista de usuarios
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              nombre:
                type: string
              email:
                type: string
              telefono:
                type: string
              rol:
                type: string
              area:
                type: string
              estado:
                type: boolean
      500:
        description: Error interno del servidor
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('limit', 10, type=int)
        
        # Paginación con SQLAlchemy
        pagination = Usuario.query.paginate(page=page, per_page=per_page, error_out=False)
        listaUsuarios = pagination.items
        
        # Convertir objetos SQLAlchemy a diccionarios para serialización JSON
        usuarios_list = []
        for usuario in listaUsuarios:
            # Obtener el nombre del área
            area_nombre = "Sin área"
            if usuario.Area_idArea:
                area = Area.query.get(usuario.Area_idArea)
                if area:
                    area_nombre = area.nombre
            
            usuarios_list.append({
                "id": usuario.Legajo,
                "nombre": usuario.nombre or "Sin nombre",
                "telefono": usuario.Telefono,
                "email": usuario.Email,
                "rol": usuario.Rol,
                "area": area_nombre,
                "area_id": usuario.Area_idArea,
                "estado": usuario.Estado,
                "turno_id": usuario.turno_id,
                "turno_nombre": usuario.turno.nombre if usuario.turno else None,
                "grupo_nombre": usuario.turno.grupo.nombre if usuario.turno and usuario.turno.grupo else None
            })
            
        return jsonify({
            "usuarios": usuarios_list,
            "total_pages": pagination.pages,
            "current_page": page,
            "total_items": pagination.total
        }), 200


    except Exception as e:
        return jsonify({"error": f"Error al obtener usuarios: {str(e)}"}), 500


@usuarios.route("/usuarios/conteo", methods=["GET"])
@jwt_required()
def get_usuarios_conteo():
    """
    Obtener conteo de usuarios activos (Solo Admin)
    ---
    tags:
      - Usuarios
    security:
      - BearerAuth: []
    responses:
      200:
        description: Conteo de usuarios activos
        schema:
          type: object
          properties:
            personal_activo:
              type: integer
            detalle:
              type: string
      401:
        description: Token faltante o inválido
      500:
        description: Error interno del servidor
    """
    try:
        # Contar usuarios activos
        total_activos = Usuario.query.filter_by(Estado=True).count()
        total_usuarios = Usuario.query.count()
        
        return jsonify({
            "personal_activo": total_activos,
            "detalle": f"{total_activos} de {total_usuarios} usuarios activos"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener conteo: {str(e)}"}), 500


@usuarios.route("/usuarios/perfil", methods=["GET"])
@jwt_required()
def get_perfil():
    """
    Obtener perfil del usuario autenticado.
    ---
    tags:
      - Usuarios
    security:
      - BearerAuth: []
    responses:
      200:
        description: Datos del perfil del usuario
        schema:
          type: object
          properties:
            id:
              type: integer
            nombre:
              type: string
            email:
              type: string
            telefono:
              type: string
            rol:
              type: string
            area:
              type: string
      401:
        description: Token faltante o inválido
      404:
        description: Usuario no encontrado
    """
    try:
        current_user_id = get_jwt_identity() # Obtiene el ID del token
        usuario = Usuario.query.get(current_user_id)
        
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        area_nombre = "Sin área"
        if usuario.Area_idArea:
            area = Area.query.get(usuario.Area_idArea)
            if area:
                area_nombre = area.nombre
                
        return jsonify({
            "id": usuario.Legajo,
            "nombre": usuario.nombre,
            "email": usuario.Email,
            "telefono": usuario.Telefono,
            "rol": usuario.Rol,
            "area": area_nombre
        }), 200
    except Exception as e:
         return jsonify({"error": f"Error al obtener perfil: {str(e)}"}), 500



@usuarios.route("/usuarios/cambiar_contrasena", methods=["PUT"])
@jwt_required()
def cambiar_contrasena():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        contrasena_actual = data.get("contrasena_actual")
        nueva_contrasena = data.get("nueva_contrasena")
        
        if not contrasena_actual or not nueva_contrasena:
            return jsonify({"error": "Faltan datos (contraseña actual o nueva)"}), 400
            
        usuario = Usuario.query.get(current_user_id)
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
            
        # Verificar contraseña actual
        if not check_password_hash(usuario.contrasena, contrasena_actual):
            return jsonify({"error": "La contraseña actual es incorrecta"}), 401
            
        # Actualizar contraseña
        usuario.contrasena = generate_password_hash(nueva_contrasena)
        db.session.commit()
        
        return jsonify({"message": "Contraseña actualizada exitosamente"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al cambiar contraseña: {str(e)}"}), 500

@usuarios.route("/usuarios", methods=["POST"])
def create_usuario():
    """
    Crear un nuevo usuario
    ---
    tags:
      - Usuarios
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - nombre
            - contrasena
            - telefono
            - email
            - rol
            - area_id
          properties:
            nombre:
              type: string
              example: Juan Perez
            contrasena:
              type: string
              example: password123
            telefono:
              type: string
              example: "123456789"
            email:
              type: string
              example: juan@example.com
            rol:
              type: string
              example: Usuario
            area_id:
              type: integer
              example: 1
    responses:
      201:
        description: Usuario creado exitosamente
      400:
        description: Datos faltantes o inválidos
      500:
        description: Error interno del servidor
    """
    try:
        data = request.get_json()
        
        # 1. Validar datos con Schema
        schema = UsuarioSchema()
        validated_data = schema.load(data)
        
        # 2. Llamar al servicio
        nuevo_usuario = UsuarioService.create_user(validated_data)
        
        # 3. Respuesta exitosa
        return jsonify({"message": "Usuario creado exitosamente", "id": nuevo_usuario.Legajo}), 201

    except ValidationError as err:
        return jsonify({"error": "Error de validación", "detalles": err.messages}), 400
    except ValueError as err:
        return jsonify({"error": str(err)}), 400 # Error de negocio (ej. email duplicado)
    except Exception as e:
        print(f"Error detallado: {str(e)}")
        return jsonify({"error": f"Error al crear usuario: {str(e)}"}), 500


@usuarios.route("/usuarios/<int:id>", methods=["PUT"])
def update_usuario(id):
    """
    Actualizar un usuario existente
    """
    try:
        usuario = Usuario.query.get(id)
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        data = request.get_json()
        
        # Actualizar campos si están presentes
        if 'nombre' in data:
            usuario.nombre = data['nombre']
        if 'email' in data:
            # Verificar que el email no esté en uso por otro usuario
            if data['email'] != usuario.Email:
                existing = Usuario.query.filter_by(Email=data['email']).first()
                if existing and existing.Legajo != id:
                    return jsonify({"error": "El email ya está en uso"}), 400
            usuario.Email = data['email']
        if 'telefono' in data:
            usuario.Telefono = data['telefono']
        if 'rol' in data:
            usuario.Rol = data['rol']
        if 'area_id' in data:
            usuario.Area_idArea = data['area_id']
        if 'turno_id' in data:
            val = data['turno_id']
            usuario.turno_id = val if val else None
        
        db.session.commit()
        
        return jsonify({"message": "Usuario actualizado exitosamente"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Error al actualizar usuario: {str(e)}"}), 500