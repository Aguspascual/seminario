from flask import render_template, redirect, Blueprint, request, url_for, flash, jsonify ,json, session
from utils.db import db
from models.Usuario import *
from models.Mensaje import Mensaje
from sqlalchemy import func, desc

mensajes = Blueprint('mensajes', __name__)

@mensajes.route('/mensajes')
def verTodosMensajes():
    idUsuario = session.get('user_id')
    if not idUsuario:
        return redirect(url_for('auth.login'))
    
    usuarios = Usuario.query.filter(Usuario.id != idUsuario).all() 
    mensajes = Mensaje.query.filter(Mensaje.idEmisor == idUsuario).all()
    if mensajes == []:
        return redirect(url_for('mensajes.verMensajes', idReceptor=0))
    #Busca el ultimo usuario con el que chateo
    for mensaje in mensajes:
        for usuario in usuarios:
            if mensaje.idReceptor == usuario.id:
                ultimoUsuario = usuario.id
                break
    return redirect(url_for('mensajes.verMensajes', idReceptor=ultimoUsuario))

@mensajes.route('/mensajes/<int:idReceptor>')
def verMensajes(idReceptor):
    user_id = session.get('user_id')
    if not user_id:
        return redirect(url_for('auth.login'))
    nombre = session.get('nombre')

    tipoUsuario = session.get('tipo_usuario')
    calendarioAside = Calendario.eventos_mes_aside(tipoUsuario, user_id)
    avisos = Comunicado.obtener_para_usuario(tipoUsuario, user_id)
    #PARA ASIDE
    contactos = []
    usuarios = Usuario.query.filter(Usuario.id != user_id).all()
    mensajes = Mensaje.query.filter((Mensaje.idReceptor == user_id) | (Mensaje.idEmisor == user_id)).all()
    usuarios_agregados = set()  # Conjunto para realizar un seguimiento de los usuarios agregados
    
    for mensaje in mensajes:
        for usuario in usuarios:
            if mensaje.idReceptor == usuario.id and usuario.id not in usuarios_agregados:
                contactos.append(usuario)
                usuarios_agregados.add(usuario.id)  # Agregar el ID del usuario al conjunto
                break
            
    contactos = list(reversed(contactos))

    # Convertir los objetos Usuario a diccionarios
    contactos_serializados = [{
        'id': contacto.id,
        'nombre': contacto.nombre
    } for contacto in contactos]

    chats = Mensaje.query.filter((Mensaje.idReceptor == user_id) & (Mensaje.idEmisor == idReceptor) | (Mensaje.idEmisor == user_id) & (Mensaje.idReceptor == idReceptor)).all()
    

    if tipoUsuario == 'Alumno':
        curso = Curso.obtener_curso_por_alumno(user_id)
        return render_template('/rutas/mensajes.html', nombre=nombre, contactos=contactos_serializados, usuarios=usuarios, chats=chats, idReceptor=idReceptor, avisos = avisos, tipoUsuario = tipoUsuario, calendarioAside = calendarioAside, idCurso = curso.id)
    return render_template('/rutas/mensajes.html', nombre=nombre, contactos=contactos_serializados, usuarios=usuarios, chats=chats, idReceptor=idReceptor, avisos = avisos, tipoUsuario = tipoUsuario, calendarioAside = calendarioAside)


@mensajes.route('/mensajes/enviar', methods=['POST'])
def enviarMensaje():
    idEmisor = session.get('user_id')
    idReceptor = request.form.get('idReceptor')
    descripcion = request.form.get('mensaje')

    mensaje = Mensaje(idEmisor, idReceptor, descripcion)
    db.session.add(mensaje)
    db.session.commit()

    return redirect(url_for('mensajes.verTodosMensajes'))