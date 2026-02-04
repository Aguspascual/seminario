from flask import Flask, request, jsonify
from utils.database import db
from routes.usuarios import usuarios
from routes.login import login_bp
from routes.proveedores import proveedores
from routes.areas import areas_bp
from flask_cors import CORS
import os

# Carga variables de entorno desde .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app)
# Configuración de la base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# Inicializa la base de datos
db.init_app(app)

# Registra los blueprints
app.register_blueprint(usuarios)
app.register_blueprint(login_bp)
app.register_blueprint(proveedores)
app.register_blueprint(areas_bp)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Welcome to the backend API"})
