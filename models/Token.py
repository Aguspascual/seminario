from utils.db import db
from datetime import datetime, timedelta
import secrets

class TokenObjeto(db.Model):
    __tablename__ = 'url_tokens'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, index=True, nullable=False)
    tipoObjeto = db.Column(db.String(50), nullable=False)
    idObjeto = db.Column(db.Integer, nullable=False)
    creado = db.Column(db.DateTime)
    expira = db.Column(db.DateTime)

    def __init__(self, token, tipoObjeto, idObjeto, expira=None):
        self.token = token
        self.tipoObjeto = tipoObjeto
        self.idObjeto = idObjeto
        self.expira = expira
        self.creado = datetime.now()

def generar_token_unico():
    # Genera un token unico de 32 caracteres
    return secrets.token_urlsafe(32)

def crear_token(tipoObjeto, idObjeto, expira_dias=None):
    token = generar_token_unico()
    if expira_dias is not None:
        expira = datetime.now() + timedelta(days=expira_dias)
    else:
        expira = None
    nuevo_token = TokenObjeto(token=token, tipoObjeto=tipoObjeto, idObjeto=idObjeto, expira=expira)
    db.session.add(nuevo_token)
    db.session.commit()
    return token

def obtener_idObjeto_por_token(token, tipoObjeto):
    url_token = TokenObjeto.query.filter_by(token=token, tipoObjeto=tipoObjeto).first()
    if url_token and (url_token.expira is None or url_token.expira > datetime.now()):
        return url_token.idObjeto
    return None

def obtener_token_por_idObjeto(idObjeto, tipoObjeto):
    url_token = TokenObjeto.query.filter_by(idObjeto=idObjeto, tipoObjeto=tipoObjeto).first()
    if url_token and (url_token.expira is None or url_token.expira > datetime.now()):
        return url_token.token
    return None

class TokenUsuario(db.Model):
    __tablename__ = 'url_tokens_usuario'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, index=True, nullable=False)
    idUsuario = db.Column(db.Integer, nullable=False)
    creado = db.Column(db.DateTime)
    expira = db.Column(db.DateTime)

    def __init__(self, token, idUsuario, expira):
        self.token = token
        self.idUsuario = idUsuario
        self.expira = expira
        self.creado = datetime.now()

def generar_token_unico():
    # Genera un token unico de 32 caracteres
    return secrets.token_urlsafe(32)

def crear_token(idUsuario):
    token = generar_token_unico()
    #El token del usuario expira en 1 dia
    expira = datetime.now() + timedelta(days=1)
    
    nuevo_token = TokenUsuario(token=token, idUsuario=idUsuario, expira=expira)
    db.session.add(nuevo_token)
    db.session.commit()
    return token

def obtener_idUsuario_por_token(token):
    url_token = TokenUsuario.query.filter_by(token=token).first()
    if url_token and (url_token.expira is None or url_token.expira > datetime.now()):
        return url_token.idUsuario
    return None
