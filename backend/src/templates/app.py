from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import database as db


app = Flask(__name__)
CORS(app)  # Permite requests desde el frontend


@app.route("/", methods=["GET"])
def index():
    cursor= db.database.cursor()
    cursor.execute("SELECT * FROM Usuario")
    
    return jsonify({"message": "Welcome to the backend API"})


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        
        # Validar que los campos requeridos estén presentes
        if not data or 'email' not in data or 'contrasena' not in data:
            return jsonify({"error": "Los campos 'email' y 'contrasena' son requeridos"}), 400
        
        email = data['email']
        contrasena = data['contrasena']
        
        # Validar que los campos no estén vacíos
        if not email.strip() or not contrasena.strip():
            return jsonify({"error": "Los campos no pueden estar vacíos"}), 400
        
        cursor = db.database.cursor()
        cursor.execute("SELECT * FROM Usuario WHERE email = %s AND contrasena = %s", (email, contrasena))
        user = cursor.fetchone()
        
        cursor.close()
        
        if user:
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"error": "Email o contraseña inválidos"}), 401
            
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


# @app.route("/register", methods=["POST"])
# def register():
    # try:
    #     # Obtener datos del request JSON
    #     data = request.get_json()
        
    #     # Validar que los campos requeridos estén presentes
    #     if not data or 'email' not in data or 'contrasena' not in data:
    #         return jsonify({"error": "Los campos 'email' y 'contrasena' son requeridos"}), 400
        
    #     email = data['email']
    #     contrasena = data['contrasena']
    #     rol = "Empleado"
    #     telefono = data['telefono']

    #     # Validar que los campos no estén vacíos
    #     if not email.strip() or not contrasena.strip():
    #         return jsonify({"error": "Los campos no pueden estar vacíos"}), 400
        
    #     cursor = db.database.cursor()
        
    #     # Verificar si el email ya existe
    #     cursor.execute("SELECT * FROM Usuario WHERE email = %s", (email,))
    #     if cursor.fetchone():
    #         return jsonify({"error": "El usuario ya existe"}), 409
        
    #     # Insertar nuevo usuario
    #     cursor.execute("INSERT INTO Usuario (email, contrasena, telefono, rol, Area_idArea) VALUES (%s, %s, %s, %s, %s)", (email, contrasena, telefono, rol, 1))
    #     db.database.commit()
        
    #     cursor.close()
        
    #     return jsonify({"message": "Usuario registrado exitosamente", "email": email}), 201
        
    # except Exception as e:
    #     return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500



@app.route("/usuarios", methods=["GET"])
def get_usuarios():
    try:
        cursor = db.database.cursor()
        cursor.execute("SELECT * FROM Usuario")
        usuarios = cursor.fetchall()
        cursor.close()
        
        # Convertir los resultados a formato JSON
        usuarios_list = []
        for usuario in usuarios:
            nroArea = usuario[8]
            cursor = db.database.cursor()
            cursor.execute("SELECT nombre FROM area WHERE idArea = %s", (nroArea,))
            nombreArea = cursor.fetchone()
            cursor.close()

            usuarios_list.append({
                "id": usuario[0],
                "nombre": usuario[9],
                "telefono": usuario[6],
                "email": usuario[1],
                "rol": usuario[3],
                "area": nombreArea[0]
            })
        
        return jsonify(usuarios_list), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener usuarios: {str(e)}"}), 500


@app.route("/usuarios", methods=["POST"])
def create_usuario():
    try:
        data = request.get_json()
        
        # Validar campos requeridos
        if not data or not all(k in data for k in ('nombre', 'telefono', 'email', 'rol', 'area')):
            return jsonify({"error": "Todos los campos son requeridos"}), 400
        
        nombre = data['nombre']
        telefono = data['telefono']
        email = data['email']
        rol = data['rol']
        area = data['area']
        
        cursor = db.database.cursor()
        
        # Verificar si el email ya existe
        cursor.execute("SELECT * FROM Usuario WHERE email = %s", (email,))
        if cursor.fetchone():
            cursor.close()
            return jsonify({"error": "El email ya está registrado"}), 409
        
        # Insertar nuevo usuario (ajusta la query según tu estructura de tabla)
        cursor.execute(
            "INSERT INTO Usuario (nombre, telefono, email, rol, area) VALUES (%s, %s, %s, %s, %s)", 
            (nombre, telefono, email, rol, area)
        )
        db.database.commit()
        cursor.close()
        
        return jsonify({"message": "Usuario creado exitosamente"}), 201
        
    except Exception as e:
        return jsonify({"error": f"Error al crear usuario: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)