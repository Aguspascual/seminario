from flask import Blueprint, request, jsonify
from utils.database import db
from models.usuario import Usuario
from models.area import Area

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
        print("hola")
        area_map = Area.obtenerAreas()
        print(area_map)
        return jsonify(usuarios_list), 200
        # cursor = db.database.cursor()
        # cursor.execute("SELECT * FROM Usuario")
        # usuarios = cursor.fetchall()
        # cursor.close()

        # # Convertir los resultados a formato JSON
        # usuarios_list = []
        # for usuario in usuarios:
        #     nroArea = usuario[8] if len(usuario) > 8 else None
        #     if nroArea:
        #         cursor = db.database.cursor()
        #         cursor.execute(
        #             "SELECT nombre FROM area WHERE idArea = :area_id",
        #             {"area_id": nroArea},
        #         )
        #         nombreArea = cursor.fetchone()
        #         cursor.close()
        #         area_nombre = nombreArea[0] if nombreArea else "Sin área"
        #     else:
        #         area_nombre = "Sin área"

        #     usuarios_list.append(
        #         {
        #             "id": usuario[0],
        #             "nombre": usuario[9] if len(usuario) > 9 else "Sin nombre",
        #             "telefono": usuario[6] if len(usuario) > 6 else None,
        #             "email": usuario[1],
        #             "rol": usuario[3] if len(usuario) > 3 else None,
        #             "area": area_nombre,
        #         }
        #     )

        # return jsonify(usuarios_list), 200

    except Exception as e:
        return jsonify({"error": f"Error al obtener usuarios: {str(e)}"}), 500


@usuarios.route("/usuarios", methods=["POST"])
def create_usuario():
    try:
        data = request.get_json()

        # Validar campos requeridos
        if not data or not all(
            k in data for k in ("nombre", "contrasena", "telefono", "email", "rol", "area_id")
        ):
            return jsonify({"error": "Todos los campos son requeridos"}), 400

        nombre = data["nombre"]
        telefono = data["telefono"]
        contrasena = data["contrasena"]
        email = data["email"]
        rol = data["rol"]
        area_id = data["area_id"]

        area_map = Area.obtenerAreas()
        print(area_map)
        # Mapear área a ID
        # area_map = {"RRHH": 1, "Finanzas": 2, "Operaciones": 3}
        # area_nombre = area_map.get(area_id, 1)  # Default a 1 si no encuentra

        usuario = Usuario(area_id, nombre, contrasena, email, telefono, rol)
        db.session.add(usuario)
        db.session.commit()
        return jsonify({"message": "Usuario creado exitosamente"}), 201

        # cursor = db.database.cursor()

        # # Verificar si el email ya existe
        # cursor.execute("SELECT * FROM Usuario WHERE Email = :email", {"email": email})
        # if cursor.fetchone():
        #     cursor.close()
        #     return jsonify({"error": "El email ya está registrado"}), 409

        # Usar una contraseña por defecto para usuarios creados desde admin

        # cursor.execute(
        #     """INSERT INTO Usuario (Email, contrasena, Rol, Telefono, Estado, Area_idArea, nombre) 
        #        VALUES (:email, :contrasena, :rol, :telefono, :estado, :area_id, :nombre)""",
        #     {
        #         "email": email,
        #         "contrasena": contrasena_default,
        #         "rol": rol,
        #         "telefono": telefono,
        #         "estado": 1,
        #         "area_id": area_id,
        #         "nombre": nombre,
        #     },
        # )
        # db.database.commit()
        # cursor.close()

        # return jsonify({"message": "Usuario creado exitosamente"}), 201

    except Exception as e:
        return jsonify({"error": f"Error al crear usuario: {str(e)}"}), 500