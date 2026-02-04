from flask import Blueprint, request, jsonify
from schemas.login_schema import LoginSchema
from services.auth_service import AuthService
from marshmallow import ValidationError

login_bp = Blueprint("login", __name__)

@login_bp.route("/login", methods=["POST"])
def loginpost():
    """
    Login de usuario y generación de token JWT.
    ---
    tags:
      - Autenticación
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - email
            - contrasena
          properties:
            email:
              type: string
              example: test@example.com
            contrasena:
              type: string
              example: password123
    responses:
      200:
        description: Login exitoso
        schema:
          type: object
          properties:
            message:
              type: string
              example: Login successful
            access_token:
              type: string
            user:
              type: object
              properties:
                id:
                  type: integer
                nombre:
                  type: string
                email:
                  type: string
                rol:
                  type: string
      400:
        description: Datos faltantes o inválidos
      401:
        description: Credenciales inválidas
    """
    try:
        data = request.get_json()
        
        # 1. Validar inputs
        schema = LoginSchema()
        validated_data = schema.load(data)
        
        # 2. Autenticar
        user_data, access_token = AuthService.login(validated_data) # Retorna tuple o raise ValueError
        
        return jsonify({
            "message": "Login successful", 
            "user": user_data,
            "access_token": access_token
        }), 200

    except ValidationError as err:
         return jsonify({"error": "Datos inválidos", "detalles": err.messages}), 400
    except ValueError as err:
        return jsonify({"error": str(err)}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500