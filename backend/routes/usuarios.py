from flask import Blueprint, request, jsonify
from utils.database import db
from models.usuario import Usuario
from models.area import Area
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity

usuarios = Blueprint("usuarios", __name__)

@usuarios.route("/usuarios", methods=["GET"])
def get_usuarios():
    try:
        listaUsuarios = Usuario.query.all()  #es como un select * from
        
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
                "estado": usuario.Estado
            })
        area_map = Area.obtenerAreas()
        return jsonify(usuarios_list), 200


    except Exception as e:
        return jsonify({"error": f"Error al obtener usuarios: {str(e)}"}), 500


@usuarios.route("/usuarios/perfil", methods=["GET"])
@jwt_required()
def get_perfil():
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

@usuarios.route("/usuarios", methods=["POST"])
def create_usuario():
    try:
        data = request.get_json()
        # Validar campos requeridos
        if not data or not all(
            k in data for k in ("nombre", "contrasena", "telefono", "email", "rol", "area_id")
        ):
            return jsonify({"error": "Todos los campos son requeridos"}), 400

        if "apellido" in data:
            nombre = f"{data['nombre']} {data['apellido']}"
        else:
            nombre = data["nombre"]
        # Limpia el telefono (quitar guiones, espacios) pero mantén como string
        telefono = str(data["telefono"]).replace("-", "").replace(" ", "").replace("(", "").replace(")", "")
        contrasena = data["contrasena"].strip()
        email = data["email"].strip().lower()
        rol = data["rol"]
        area_id = int(data["area_id"])  # Convertir a entero

        area_map = Area.obtenerAreas()
        # Mapear área a ID
        # area_map = {"RRHH": 1, "Finanzas": 2, "Operaciones": 3}
        # area_nombre = area_map.get(area_id, 1)  # Default a 1 si no encuentra

        hashed_password = generate_password_hash(contrasena)
        usuario = Usuario(Area_idArea=area_id, nombre=nombre, contrasena=hashed_password, Email=email, Telefono=telefono, Rol=rol)
        db.session.add(usuario)
        db.session.commit()
        return jsonify({"message": "Usuario creado exitosamente"}), 201

    except ValueError as e:
        return jsonify({"error": f"Error de formato de datos: {str(e)}"}), 400
    except Exception as e:
        print(f"Error detallado: {str(e)}")  # Para debug
        return jsonify({"error": f"Error al crear usuario: {str(e)}"}), 500