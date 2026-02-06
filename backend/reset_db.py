from app import app, db
from sqlalchemy import text
# Import all models to ensure metadata is populated
from models.maquinaria import Maquinaria
from models.auditoria import Auditoria
from models.capacitacion import Capacitacion
from models.area import Area
from models.usuario import Usuario
from models.proveedor import Proveedor
from models.tipo_proveedor import TipoProveedor
from models.reporte import Reporte

with app.app_context():
    print("Attempting to drop all tables...")
    try:
        db.drop_all()
    except Exception as e:
        print(f"Standard drop failed: {e}")
        print("Attempting CASCADE drop on known tables...")
        # Order matters if not using CASCADE, but CASCADE makes it easier
        tables = [
            'reporte', 'maquinaria', 'auditoria', 'capacitacion', 
            'proveedor', 'usuario', 'tipoproveedor', 'area'
        ]
        for t in tables:
            try:
                db.session.execute(text(f"DROP TABLE IF EXISTS {t} CASCADE"))
                db.session.commit()
            except Exception as e2:
                print(f"Failed to drop {t}: {e2}")
                db.session.rollback()

    print("Creating all tables...")
    db.create_all()
    print("Database reset complete.")
