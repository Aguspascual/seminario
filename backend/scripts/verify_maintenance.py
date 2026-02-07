import sys
import os

# Add parent directory to path to import app and models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from utils.database import db
from models.mantenimiento import Mantenimiento, ReporteFalla, MantenimientoInsumo
from models.insumo import Insumo
from models.maquinaria import Maquinaria
from models.usuario import Usuario
from datetime import date, datetime, timedelta
from sqlalchemy import inspect

def verify_backend():
    print("Starting backend verification...")
    
    with app.app_context():
        # Ensure tables exist
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        print("Existing tables:", existing_tables)
        
        if 'mantenimientos' in existing_tables:
            columns = [c['name'] for c in inspector.get_columns('mantenimientos')]
            print("Columns in 'mantenimientos':", columns)
            if 'maquinaria_id' not in columns:
                print("Schema mismatch detected. Dropping tables to recreate with correct schema...")
                # Drop dependent tables first!
                if 'mantenimientos_insumos' in existing_tables: 
                    MantenimientoInsumo.__table__.drop(db.engine)
                if 'reportes_fallas' in existing_tables: 
                    ReporteFalla.__table__.drop(db.engine)
                
                # Now drop the main table
                Mantenimiento.__table__.drop(db.engine)
        
        db.create_all()
        
        try:
            print("Creating dummy data...")
            
            # Check if we have a machine, if not create one
            maquina = Maquinaria.query.first()
            if not maquina:
                maquina = Maquinaria(codigo="TEST-001", nombre="Test Machine", modelo="T-1000", anio="2024", ubicacion="Lab")
                db.session.add(maquina)
                db.session.commit()
                print("Created dummy machine.")
            else:
                print(f"Using existing machine: {maquina.nombre} ID:{maquina.id_maquinaria}")
                
            # Check if we have a user
            usuario = Usuario.query.first()
            if not usuario:
                print("Warning: No users found. Skipping user assignment.")
                user_id = None
            else:
                print(f"Using existing user: {usuario.nombre} Legajo:{usuario.Legajo}")
                user_id = usuario.Legajo

            # Create Maintenance Record
            fecha_prog = date.today() + timedelta(days=2)
            mant = Mantenimiento(
                maquinaria_id=maquina.id_maquinaria,
                tipo="Preventivo",
                fecha_programada=fecha_prog,
                descripcion="Test Maintenance",
                prioridad="Alta",
                responsable_id=user_id,
                estado="Pendiente"
            )
            db.session.add(mant)
            db.session.commit()
            print(f"Created maintenance record ID: {mant.id}")
            
        except Exception as e:
            print(f"ERROR creating data: {e}")
            import traceback
            traceback.print_exc()
            return
        
        # 2. Test Endpoints
        print("Testing Endpoints...")
        
        # Dashboard
        with app.test_client() as client:
            resp = client.get('/api/mantenimientos/dashboard')
            if resp.status_code == 200:
                data = resp.json
                print("Dashboard Data:", data)
                if data['pendientes'] >= 1:
                    print("SUCCESS: Dashboard reflects pending maintenance.")
                else:
                    print("FAILURE: Dashboard did not show pending maintenance.")
            else:
                print(f"FAILURE: Dashboard endpoint returned {resp.status_code}")
                print(resp.data)

            # Calendar
            month = fecha_prog.month
            year = fecha_prog.year
            resp = client.get(f'/api/mantenimientos/calendario?mes={month}&anio={year}')
            if resp.status_code == 200:
                data = resp.json
                print("Calendar Data:", data)
                events = data.get('eventos', [])
                found = any(e['id'] == mant.id for e in events)
                if found:
                    print("SUCCESS: Calendar shows the maintenance event.")
                else:
                    print("FAILURE: Calendar did not show the event.")
            else:
                print(f"FAILURE: Calendar endpoint returned {resp.status_code}")

        # Cleanup (Optional, but good for repeatability)
        # db.session.delete(mant) # Keep it for manual verification if needed
        # db.session.commit()
        print("Verification complete.")

if __name__ == "__main__":
    verify_backend()
