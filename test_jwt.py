import requests
import json

BASE_URL = "http://localhost:5000"

def test_flow():
    # 1. Crear usuario
    print("1. Creando usuario de prueba...")
    user_data = {
        "nombre": "Test User",
        "email": "test@example.com",
        "contrasena": "password123",
        "telefono": "123456789",
        "rol": "Test",
        "area_id": 1
    }
    
    # Intentamos crear, si ya existe no importa, intentamos login
    try:
        res = requests.post(f"{BASE_URL}/usuarios", json=user_data)
        print(f"Crear usuario: {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Error conex: {e}")

    # 2. Login
    print("\n2. Intentando Login...")
    login_data = {
        "email": "test@example.com",
        "contrasena": "password123"
    }
    
    res = requests.post(f"{BASE_URL}/login", json=login_data)
    print(f"Login status: {res.status_code}")
    
    token = None
    if res.status_code == 200:
        data = res.json()
        token = data.get("access_token")
        print(f"Token recibido: {token[:20]}..." if token else "NO TOKEN")
        
    if not token:
        print("Fallo el login, abortando prueba de perfil.")
        return

    # 3. Get Perfil
    print("\n3. Obteniendo Perfil...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/usuarios/perfil", headers=headers)
    print(f"Perfil status: {res.status_code}")
    print(f"Perfil data: {res.text}")

if __name__ == "__main__":
    test_flow()
