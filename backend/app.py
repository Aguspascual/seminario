from flask import Flask, request, jsonify
from utils.database import db
from routes.usuarios import usuarios
from routes.login import login_bp
from routes.proveedores import proveedores
from routes.areas import areas_bp
from routes.reportes import reportes_bp
from routes.legal import legal_bp
from routes.bitacora import bitacora_bp
from routes.recuperar_contrasena import bp_recuperar
from routes.home import home_bp
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flasgger import Swagger
import os

# Carga variables de entorno desde .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app)

uri = os.getenv("DATABASE_URL")
if uri and uri.startswith("postgres://"):
    uri = uri.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = uri

# Configuración de la base de datos
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key") # Cambiar en producción

# Inicializa la base de datos
db.init_app(app)
jwt = JWTManager(app)
swagger = Swagger(app)

# Force reload for blueprint registration

# Registra los blueprints
app.register_blueprint(usuarios)
app.register_blueprint(login_bp)
app.register_blueprint(proveedores)
app.register_blueprint(areas_bp)
app.register_blueprint(reportes_bp)
app.register_blueprint(legal_bp)
app.register_blueprint(bitacora_bp)
app.register_blueprint(bp_recuperar)
app.register_blueprint(home_bp, url_prefix='/api')


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Welcome to the backend API"})
