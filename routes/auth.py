from flask import render_template, redirect, Blueprint, request, url_for, flash, session
from utils.db import db
from models.Usuario import Usuario
from models.Token import *
import smtplib
from email.mime.text import MIMEText 
from email.mime.multipart import MIMEMultipart

auth = Blueprint('auth', __name__)

@auth.route('/')
def login():
    return render_template('/rutas/login.html')

@auth.route('/', methods=['POST'])
def login_post():
    usuario = request.form['usuario']
    contrasena = request.form['contrasena']
    respuesta = Usuario.verificar_usuario_y_contraseña(usuario, contrasena)

    if isinstance(respuesta, dict): 
        #Guardo datos de session
        session['token_usuario'] = TokenUsuario.crear_token(respuesta['id'])
        session['tipo_usuario'] = respuesta['tipoUsuario']
        session['nombre'] = respuesta['nombre']
        if 'fotoPerfil' in respuesta and respuesta['fotoPerfil'] is not None: 
            session['fotoPerfil'] = respuesta['fotoPerfil']
        else:
            session['fotoPerfil'] = None
        
        return redirect(url_for('cursos.verCursos'))

        

@auth.route('/logout')
def logout():
    token_a_eliminar = session.get('token')
    if token_a_eliminar:
        eliminar_token_usuario(token_a_eliminar)

    # Limpia la sesión de Flask
    session.pop('token_usuario', None)
    session.pop('tipo_usuario', None)
    session.pop('nombre', None)
    session.pop('fotoPerfil', None)
    session.pop('token_curso', None)  

    return redirect(url_for('auth.login'))

#Elimina token del usuario de la bd
def eliminar_token_usuario(token):
    token_obj = TokenUsuario.query.filter_by(token=token).first()
    if token_obj:
        db.session.delete(token_obj)
        db.session.commit()

@auth.route('/cambiar-contrasena')
def cambiarContra():
    return render_template('/rutas/cambiarContrasena.html')

@auth.route('/cambiar-contrasena', methods=['POST'])
def modContra():
    tokenUsuario = session.get('token_usuario')
    if not tokenUsuario:
        return render_template('/sinPermiso.html')

    contrasena = request.form['contrasena-actual']
    nuevaContrasena = request.form['contrasena-nueva']
    nuevaContrasenaX2 = request.form['confirmar-contrasena']

    #Verificaciones sobre las contraseñas
    if contrasena == nuevaContrasena:
        flash("La nueva contraseña no puede ser igual a la actual.", "error")
        return redirect(url_for('auth.cambiarContra'))

    if nuevaContrasena != nuevaContrasenaX2:
        flash("Las nuevas contraseñas no coinciden.", "error")
        return redirect(url_for('auth.cambiarContra'))

    #Modificar contraseña
    idUsuario = TokenUsuario.obtener_idUsuario_por_token(tokenUsuario)
    mensaje = Usuario.modContrasena(idUsuario, contrasena, nuevaContrasena, nuevaContrasenaX2)
    
    #Si la contraseña se modificó correctamente
    if mensaje == "contraseña modificada correctamente":
        flash("Contraseña modificada correctamente.", "success")
        tipoUsuario = session.get('tipo_usuario')
        if tipoUsuario == "Admin" or tipoUsuario == "Director" or tipoUsuario == "Preceptor" or tipoUsuario == "Profesor":
            return redirect(url_for('cursos.verCursos'))
        elif tipoUsuario == "Alumno":
            curso = CursoAlumnos.obtener_curso_por_alumno(idUsuario)
            tokenCurso = TokenObjeto.obtener_token_por_idObjeto(curso.id, "Curso")
            session['token_curso'] = tokenCurso
            return redirect(url_for('cursos.verCurso', idCurso=curso.idCurso))
            
    else:
        flash(mensaje, "error")
        return redirect(url_for('auth.cambiarContra'))

    flash("Tipo de usuario no reconocido.", "error")
    return redirect(url_for('auth.cambiarContra')) 

@auth.route('/recuperar-contrasena')
def recuperarContra():
    return render_template('/rutas/recuperarContrasena.html')

@auth.route('/recuperar-contrasena', methods=['POST'])
def recuperarContrasena_post():
    email = request.form['email']
    usuario = Usuario.query.filter_by(correo=email).first()

    if usuario:
        try:
            # Generar URL de recuperación
            url_recuperacion = url_for('auth.recuperarUsuario', idUsuario=usuario.id, tipoUsuario=usuario.tipoUsuario, _external=True)

            # Función para cargar la plantilla y reemplazar variables (¡Ahora usa render_template!)
            def cargar_plantilla(ruta_plantilla, **kwargs):
                return render_template(ruta_plantilla, **kwargs)

            # Datos del correo
            asunto = "Recuperacion de cuenta"

            html = cargar_plantilla('mails/recuperarContraseña.html', url_usuario=url_recuperacion)

            # Configuración del servidor SMTP (sin cambios)
            servidor = smtplib.SMTP("smtp.gmail.com", 587)
            servidor.starttls()
            servidor.login("aguspascual2001@gmail.com", "isqy rsxw laps hnqq")

            # Crear el mensaje con formato HTML (sin cambios)
            msg = MIMEMultipart("alternative")
            msg["From"] = "aguspascual2001@gmail.com"
            msg["To"] = email
            msg["Subject"] = asunto
            parte_html = MIMEText(html, "html")
            msg.attach(parte_html)

            # Enviar el correo (sin cambios)
            servidor.sendmail("aguspascual2001@gmail.com", email, msg.as_string())
            servidor.quit()

            flash("Se ha enviado un correo para recuperar tu contraseña.", "success")
            return redirect(url_for('auth.login'))

        except Exception as e:
            flash(f"Error al enviar el correo: {e}", "error")
            return redirect(url_for('auth.recuperarContra'))

    else:
        flash("El correo no está registrado.", "error")
        return redirect(url_for('auth.recuperarContra'))

@auth.route('/recuperarUsuario/<int:tokenUsuario>', methods=['GET'])
def recuperarUsuario(tokenUsuario):
    # Verificar si el token es válido
    session['token_usuario'] = tokenUsuario
    idUsuario = TokenUsuario.obtener_idUsuario_por_token(tokenUsuario)
    usuario = Usuario.obtenerUsuarioPorId(idUsuario)
    session['tipo_usuario'] = usuario.tipoUsuario

    return render_template('/rutas/cambiarContrasena.html')

@auth.route('/recuperarUsuario/<int:tokenUsuario>', methods=['POST'])
def recuperarUsuario_post(tokenUsuario):
    contrasena = request.form['contrasena-actual']
    nuevaContrasena = request.form['contrasena-nueva']
    nuevaContrasenaX2 = request.form['confirmar-contrasena']

    #Obtengo datos del usuario
    idUsuario = TokenUsuario.obtener_idUsuario_por_token(tokenUsuario)
    tipoUsuario = session.get('tipo_usuario')
    #Verificaciones sobre las contraseñas
    if contrasena == nuevaContrasena:
        flash("La nueva contraseña no puede ser igual a la actual.", "error")
        return redirect(url_for('auth.recuperarUsuario', idUsuario=idUsuario, tipoUsuario=tipoUsuario))

    if nuevaContrasena != nuevaContrasenaX2:
        flash("Las nuevas contraseñas no coinciden.", "error")
        return redirect(url_for('auth.recuperarUsuario', idUsuario=idUsuario, tipoUsuario=tipoUsuario))

    #Modificar contraseña
    mensaje = Usuario.modContrasena(idUsuario, contrasena, nuevaContrasena, nuevaContrasenaX2)

    #Si la contraseña se modificó correctamente
    if mensaje == "contraseña modificada correctamente":
        flash("Contraseña modificada correctamente.", "success")
        return redirect(url_for('auth.login'))
    
    else:
        flash(mensaje, "error")
        return redirect(url_for('auth.recuperarUsuario', tokenUsuario = tokenUsuario))

@auth.route('/sinPermiso')
def sinPermiso():
    return render_template('/rutas/sinPermiso.html')