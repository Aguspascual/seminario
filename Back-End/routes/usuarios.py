from flask import render_template, redirect, Blueprint, request, url_for, flash, session, jsonify
from utils.db import db
from models.Usuario import *
import os
from werkzeug.utils import secure_filename
import datetime

usuarios = Blueprint('usuarios', __name__)

@usuarios.route('/usuarios')
def verUsuarios():
    idUsuario = session.get('user_id')
    if not idUsuario:
        return render_template('/rutas/sinPermiso.html')
    nombre = session.get('nombre')
    tipoUsuario = session.get('tipo_usuario')
    if tipoUsuario != 'Admin' and tipoUsuario != 'Director' and tipoUsuario != 'Preceptor':
        return render_template('/rutas/sinPermiso.html')
    fotoPerfil = session.get('fotoPerfil')
    calendarioAside = Calendario.eventos_mes_aside(tipoUsuario, idUsuario)
    avisos = Comunicado.obtener_para_usuario(tipoUsuario, idUsuario)
    usuarios = Usuario.query.all()
    usuarios_data = []

    for usuario in usuarios:
        fecha_creacion = usuario.fechaCreacion.strftime("%Y-%m-%d %H:%M:%S") if usuario.fechaCreacion else "N/A"
        ultima_vez = usuario.fechaUltimaVez.strftime("%Y-%m-%d %H:%M:%S") if usuario.fechaUltimaVez else "N/A"

        usuarios_data.append({
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "usuario": usuario.usuario,
            "correo": usuario.correo,
            "contrasena": usuario.contrasena,
            "dni": usuario.dni,
            "tipoUsuario": usuario.tipoUsuario,
            "fechaCreacion": fecha_creacion,
            "ultimaVez": ultima_vez
        })
    print(fotoPerfil)

    return render_template('/rutas/usuarios.html', usuarios=usuarios_data, nombre=nombre, fotoPerfil=fotoPerfil, tipoUsuario=tipoUsuario, avisos = avisos, calendarioAside = calendarioAside)

@usuarios.route('/usuario/agregar')
def agregarUsuario():
    nombre = session.get('nombre')
    idUsuario = session.get('user_id')
    if not idUsuario:
        return render_template('/rutas/sinPermiso.html')
    tipoUsuario = session.get('tipo_usuario')
    if tipoUsuario != 'Admin' and tipoUsuario != 'Director':
        return render_template('/rutas/sinPermiso.html')
    calendarioAside = Calendario.eventos_mes_aside(tipoUsuario, idUsuario)
    avisos = Comunicado.obtener_para_usuario(tipoUsuario, idUsuario)
    fotoPerfil = session.get('fotoPerfil')
    return render_template('/rutas/usuarioAgregar.html', nombre = nombre, fotoPerfil = fotoPerfil, tipoUsuario = tipoUsuario, avisos = avisos, calendarioAside = calendarioAside)

@usuarios.route('/usuario/agregar', methods=['POST'])
def guardarUsuario():
    idUsuario = session.get('user_id')
    if not idUsuario:
        return render_template('/rutas/sinPermiso.html')
    tipoUsuario = session.get('tipo_usuario')
    if tipoUsuario != 'Admin' and tipoUsuario != 'Director':
        return render_template('/rutas/sinPermiso.html')
    nombre = request.form.get("nombre")
    apellido = request.form.get("apellido")
    correo = request.form.get("correo")
    dni = request.form.get("dni")
    tipoUsuario = request.form.get("tipoUsuario")
    contraseña = dni
    fotoPerfil = "nombre de la foto"
    usuario = correo

    # Validaciones de duplicados
    if Usuario.query.filter_by(usuario=usuario).first():
        flash('Ya existe un usuario con este correo electrónico.', 'error')
        return redirect(url_for('usuarios.agregarUsuario'))

    #if Usuario.query.filter_by(dni=dni).first():
    #    flash('Ya existe un usuario con este DNI.', 'error')
    #    return redirect(url_for('usuarios.agregarUsuario'))

    if Usuario.query.filter_by(correo=correo).first():
        flash('Ya existe un usuario con este correo electrónico.', 'error')
        return redirect(url_for('usuarios.agregarUsuario'))

    # Manejo de la foto de perfil
    if 'fotoPerfil' in request.files:
        foto = request.files['fotoPerfil']
        if foto.filename != '':
            nombre_archivo_original = secure_filename(foto.filename)
            hora_creacion = datetime.datetime.now().strftime("%Y%m%d%H%M%S") 
            filename = f"{nombre_archivo_original}_{hora_creacion}"
            _, file_extension = os.path.splitext(foto.filename)
            filename_with_extension = filename + file_extension
            upload_folder = 'static/img/perfiles'
            os.makedirs(upload_folder, exist_ok=True)
            foto_path = os.path.join(upload_folder, filename_with_extension)
            foto.save(foto_path)
            fotoPerfil = filename_with_extension
        else:
            fotoPerfil = None
    else:
        fotoPerfil = None

    nuevoUsuario = Usuario(nombre, apellido, usuario, correo, contraseña, dni, fotoPerfil, tipoUsuario)
    db.session.add(nuevoUsuario)
    db.session.commit()
    flash('Usuario agregado con éxito.', 'success')
    return redirect(url_for('usuarios.verUsuarios'))

@usuarios.route('/usuario/eliminar/<int:id>', methods=['DELETE'])
def eliminarUsuario(id):
    idUsuario = session.get('user_id')
    if not idUsuario:
        return render_template('/rutas/sinPermiso.html')
    tipoUsuario = session.get('tipo_usuario')
    if tipoUsuario != 'Admin' and tipoUsuario != 'Director':
        return render_template('/rutas/sinPermiso.html')
    usuario = Usuario.obtenerUsuarioPorId(id) 
    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({"success": True, "message": "Usuario eliminado"}), 200
    else:
        return jsonify({"success": False, "message": "Usuario no encontrado"}), 404

@usuarios.route('/usuario/modificar', methods=['POST'])
def modificarUsuario():
    idUsuario = session.get('user_id')
    if not idUsuario:
        return render_template('/rutas/sinPermiso.html')
    tipoUsuario = session.get('tipo_usuario')
    if tipoUsuario != 'Admin' and tipoUsuario != 'Director':
        return render_template('/rutas/sinPermiso.html')
    id = request.form['id']
    usuario = Usuario.query.get(id)
    if usuario:
        usuario.nombre = request.form['nombre']
        usuario.apellido = request.form['apellido']
        usuario.usuario = request.form['usuario']
        usuario.correo = request.form['correo']
        usuario.dni = request.form['dni']
        usuario.tipoUsuario = request.form['tipoUsuario']
        db.session.commit()
        return jsonify({'success': True, 'message': 'Usuario modificado con éxito'})
    else:
        return jsonify({'success': False, 'message': 'Usuario no encontrado'})
    
#@usuarios.route('/crearAdmin')
#def crearAdmin():
#    nuevoUsuario = Usuario(nombre ="Agustin", apellido = "Pascual", usuario = "admin@gmail.com", correo = "admin@gmail.com", contrasena = "1234", dni = 1234, fotoPerfil = None, tipoUsuario = "Admin")
#    db.session.add(nuevoUsuario)
#    db.session.commit()
#    return "Usuario admin creado con éxito"