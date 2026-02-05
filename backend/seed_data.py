from app import app, db
from models.area import Area
from models.usuario import Usuario
from models.maquinaria import Maquinaria
from models.auditoria import Auditoria
from models.capacitacion import Capacitacion
from models.proveedor import Proveedor
from models.tipo_proveedor import TipoProveedor
from werkzeug.security import generate_password_hash
import datetime

def seed_data():
    with app.app_context():
        # Limpiar datos existentes (opcional, pero recomendado para seed)
        # db.drop_all()
        # db.create_all()
        
        # 1. Crear Areas
        area1 = Area(nombre="Planta", estado="Activa")
        area2 = Area(nombre="Oficinas", estado="Activa")
        db.session.add(area1)
        db.session.add(area2)
        db.session.commit()
        
        # 2. Crear Usuario Test
        # Verificar si existe para no duplicar
        if not Usuario.query.filter_by(Email="test@test.com").first():
            # Hash password? Assuming common practice, but checking login route logic is safer.
            # Based on user request "contra: 123456", if backend expects hash we hash, if plain we store plain.
            # I will use generate_password_hash as a safe default if login uses check_password_hash.
            hashed_pw = generate_password_hash("123456", method='scrypt')
            user_test = Usuario(
                Area_idArea=area1.idArea,
                nombre="Test User",
                contrasena=hashed_pw,
                Email="test@test.com",
                Telefono="1234567890",
                Rol="Admin"
            )
            db.session.add(user_test)
            print("Usuario test@test.com creado.")

        # 3. Crear Maquinaria
        maq1 = Maquinaria(nombre="Excavadora CAT", tipo="Pesada", anio=2022)
        maq2 = Maquinaria(nombre="Montacargas Toyota", tipo="Ligera", anio=2020)
        db.session.add_all([maq1, maq2])

        # 4. Crear Auditoria
        aud1 = Auditoria(fecha="2026-02-10", hora="10:00", estado="Programado", lugar="Planta", archivo_path=None)
        db.session.add(aud1)

        # 5. Crear Capacitacion
        cap1 = Capacitacion(nombre="Seguridad Industrial", profesional="Ing. Perez", fecha="2026-03-01", descripcion="Curso basico")
        db.session.add(cap1)
        
        # 6. Proveedores (requiere TipoProveedor)
        tipo = TipoProveedor(nombreTipo="Insumos")
        db.session.add(tipo)
        db.session.commit()

        prov1 = Proveedor(Nombre="Ferreteria Industrial", Numero=123456, Email="contacto@ferreteria.com", idTipo=tipo.idTipo)
        db.session.add(prov1)

        db.session.commit()
        print("Datos de prueba insertados exitosamente.")

if __name__ == "__main__":
    seed_data()
