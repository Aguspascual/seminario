import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:5000/api'

def test_maintenance_crud():
    print("--- Testing Maintenance CRUD ---")
    
    # 1. Create Maintenance (Already tested, but needed for ID)
    new_mant = {
        "maquinaria_id": 1,
        "tipo": "Preventivo",
        "fecha_programada": datetime.now().strftime('%Y-%m-%d'),
        "descripcion": "Mantenimiento de prueba CRUD",
        "prioridad": "Alta"
    }
    
    try:
        res = requests.post(f"{BASE_URL}/mantenimientos", json=new_mant)
        print(f"Create: {res.status_code}")
        if res.status_code != 201:
            print(res.text)
            return
        
        mant_id = res.json()['id']
        print(f"Created ID: {mant_id}")
        
        # 2. Update Maintenance
        update_data = {
            "estado": "En Proceso",
            "observaciones": "Iniciado prueba"
        }
        res = requests.put(f"{BASE_URL}/mantenimientos/{mant_id}", json=update_data)
        print(f"Update: {res.status_code}")
        if res.status_code != 200:
            print(res.text)
            
        # 3. Delete Maintenance
        res = requests.delete(f"{BASE_URL}/mantenimientos/{mant_id}")
        print(f"Delete: {res.status_code}")
        if res.status_code != 200:
            print(res.text)
            
    except Exception as e:
        print(f"Error: {e}")

def test_fault_crud():
    print("\n--- Testing Fault Reporting CRUD ---")
    
    # 1. Create Report
    new_report = {
        "maquinaria_id": 1,
        "reportado_por": 1,
        "descripcion_falla": "Falla de prueba CRUD",
        "criticidad": "Alta",
        "puede_operar": "No"
    }
    
    try:
        res = requests.post(f"{BASE_URL}/reportes", json=new_report)
        print(f"Create Report: {res.status_code}")
        if res.status_code != 201:
            print(res.text)
            return

        report_id = res.json()['id']
        print(f"Created Report ID: {report_id}")
        
        # 2. Get Reports
        res = requests.get(f"{BASE_URL}/reportes")
        print(f"Get Reports: {res.status_code}")
        if res.status_code == 200:
            reports = res.json().get('reportes', [])
            found = any(r['id'] == report_id for r in reports)
            print(f"Report found in list: {found}")
            
        # 3. Update Report
        update_data = {
            "estado_reporte": "En Proceso",
            "ubicacion_especifica": "Updated location"
        }
        res = requests.put(f"{BASE_URL}/reportes/{report_id}", json=update_data)
        print(f"Update Report: {res.status_code}")
        
        # 4. Delete Report
        res = requests.delete(f"{BASE_URL}/reportes/{report_id}")
        print(f"Delete Report: {res.status_code}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_maintenance_crud()
    test_fault_crud()
