from app import app
from services.mantenimiento_service import MantenimientoService
from flask_jwt_extended import create_access_token

with app.app_context():
    # 1. Test Service Directly
    print("Testing Service Directly:")
    try:
        result = MantenimientoService.get_all_reportes_fallas(page=1, per_page=5)
        print(f"Total: {result['total']}")
        print(f"Pages: {result['pages']}")
        print(f"Items in page: {len(result['items'])}")
        if len(result['items']) > 0:
            print(f"First item keys: {result['items'][0].keys()}")
            
            # Verify descripcion_falla is NOT present
            if 'descripcion_falla' not in result['items'][0]:
                print("SUCCESS: 'descripcion_falla' is correctly excluded from list.")
            else:
                print("FAILURE: 'descripcion_falla' should NOT be in list.")
    except Exception as e:
        print(f"Service Error: {e}")
    
    # 2. Test Route via Test Client
    print("\nTesting Route via Test Client:")
    try:
        # Create a dummy token. If identity needs to be string/int will depend on implementation but usually str(id) or int(id)
        token = create_access_token(identity=1)
        client = app.test_client()
        response = client.get('/api/reportes?page=1&limit=5', headers={'Authorization': f'Bearer {token}'})
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response JSON keys: {response.json.keys()}")
            print(f"Pagination metadata: page {response.json.get('current_page')} of {response.json.get('total_pages')}")
            print(f"Items count: {len(response.json.get('reportes', []))}")
        else:
            print(f"Error Response: {response.json}")
    except Exception as e:
        print(f"Route Error: {e}")
