from flask import Flask, render_template
from utils.db import *
from utils.config import *
from models.Usuario import *
from routes.usuarios import *
from routes.auth import *
from routes.mensajes import *

app = Flask(__name__)


# Cargar la configuración desde config.py
app.config.from_object(Config)

# Inicio la base de datos
db.init_app(app)


# Llamo a la ruta de cada clase
app.register_blueprint(usuarios)
app.register_blueprint(auth)
app.register_blueprint(mensajes)



if __name__ == "__main__":
    # Crear todas las tablas que tengo en la base de datos
    with app.app_context():
        db.create_all()

    app.run(debug=True)