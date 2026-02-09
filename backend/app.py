from flask import Flask, request, jsonify
from utils.database import db
from routes.usuarios import usuarios
from routes.login import login_bp
from routes.proveedores import proveedores
from routes.areas import areas_bp
from routes.reportes import reportes_bp
from routes.mensajes import mensajes_bp
from routes.maquinarias import maquinarias_bp
from routes.mantenimiento import mantenimiento_bp
from routes.auditorias import auditorias_bp

from routes.legal import legal_bp
from routes.bitacora import bitacora_bp
from routes.insumos import insumos_bp
from routes.grupos import grupos_bp
from routes.recuperar_contrasena import bp_recuperar
from routes.home import home_bp
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.extensions import mail
from flasgger import Swagger
import os

# Carga variables de entorno desde .env
try:
    from dotenv import load_dotenv
    # Force reload of .env file to ensure changes are picked up
    # override=True ensures .env values take precedence over system env vars
    load_dotenv(override=True)
    print(f"Loaded .env from: {os.getcwd()}")
except ImportError:
    pass

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

uri = os.getenv("DATABASE_URL")
if uri and uri.startswith("postgres://"):
    uri = uri.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = uri

app.config["SQLALCHEMY_DATABASE_URI"] = uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key") # Cambiar en producción

# Inicializa la base de datos
db.init_app(app)
jwt = JWTManager(app)

# Configuración de Flask-Mail (MUST be before mail.init_app!)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])

print("--- DEBUG MAIL CONFIG ---")
print(f"Server: {app.config['MAIL_SERVER']}")
print(f"Port: {app.config['MAIL_PORT']}")
print(f"Username: {app.config['MAIL_USERNAME']}")
print(f"Password set: {'Yes' if app.config['MAIL_PASSWORD'] else 'No'}")
print(f"SSL: {app.config['MAIL_USE_SSL']}")
print(f"TLS: {app.config['MAIL_USE_TLS']}")
print("-------------------------")

# NOW initialize Flask-Mail with the correct config
mail.init_app(app)

swagger = Swagger(app)

# Force reload for blueprint registration

# Registra los blueprints existentes
app.register_blueprint(usuarios)
app.register_blueprint(login_bp)
app.register_blueprint(proveedores)
app.register_blueprint(areas_bp)
app.register_blueprint(reportes_bp)
app.register_blueprint(mensajes_bp)
app.register_blueprint(maquinarias_bp)
app.register_blueprint(mantenimiento_bp, url_prefix='/api')

# Registra los nuevos blueprints
app.register_blueprint(legal_bp)
app.register_blueprint(auditorias_bp)
app.register_blueprint(bitacora_bp)
app.register_blueprint(bp_recuperar)
app.register_blueprint(home_bp, url_prefix='/api')
app.register_blueprint(insumos_bp, url_prefix='/api')
app.register_blueprint(grupos_bp, url_prefix='/api')

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Welcome to the backend API"})
