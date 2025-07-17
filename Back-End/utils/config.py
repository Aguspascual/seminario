import os

class Seguridad:
    SECRET_KEY = '1*2¡2-3__4_56*sT7_891*2¡2222498754667npoi_++2-3__4_56*sT7_891*2¡2-3__4_56*sT7_89'

class Config (Seguridad):
    # Heredo de la clase Seguridad
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql://root:@localhost/beam')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

