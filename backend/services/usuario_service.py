from models.usuario import Usuario
from utils.database import db
from werkzeug.security import generate_password_hash

class UsuarioService:
    
    @staticmethod
    def create_user(data):
        """
        Crea un nuevo usuario en la base de datos.
        Recibe 'data' ya validado por UsuarioSchema.
        """
        email = data["Email"].lower()
        
        # Verificar si existe email
        if Usuario.query.filter_by(Email=email).first():
            raise ValueError("El email ya está registrado")

        # Lógica de nombre/apellido (si viniera apellido por separado)
        nombre = data["nombre"]
        if "apellido" in data:
            nombre = f"{nombre} {data['apellido']}"

        # Hash password
        hashed_password = generate_password_hash(data["contrasena"])

        # Limpiar telefono
        telefono = str(data["Telefono"]).replace("-", "").replace(" ", "").replace("(", "").replace(")", "")

        nuevo_usuario = Usuario(
            Area_idArea=data["Area_idArea"],
            nombre=nombre,
            contrasena=hashed_password,
            Email=email,
            Telefono=telefono,
            Rol=data["Rol"],
            turno_id=data.get("turno_id")
        )

        db.session.add(nuevo_usuario)
        db.session.commit()

        return nuevo_usuario
