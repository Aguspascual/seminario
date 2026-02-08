from marshmallow import Schema, fields, validate, ValidationError

class UsuarioSchema(Schema):
    id = fields.Int(dump_only=True, attribute="Legajo")
    nombre = fields.Str(required=True, validate=validate.Length(min=3))
    apellido = fields.Str(load_only=True) # Opcional, solo para entrada
    email = fields.Email(required=True, attribute="Email")
    contrasena = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    telefono = fields.Str(required=True, attribute="Telefono")
    rol = fields.Str(required=True, attribute="Rol")
    area_id = fields.Int(required=True, attribute="Area_idArea")
    turno_id = fields.Int(allow_none=True, load_default=None)
    estado = fields.Str(dump_only=True, attribute="Estado")

    # Si necesitas transformar datos (ej. unir nombre y apellido) puedes usar post_load
    # o hacerlo en el servicio. Por simplicidad, mantendremos la lógica en el servicio,
    # el schema garantiza que los datos lleguen bien.
