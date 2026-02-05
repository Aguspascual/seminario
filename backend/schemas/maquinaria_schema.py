from marshmallow import Schema, fields, validate

class MaquinariaSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    tipo = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    anio = fields.Int(allow_none=True)
    estado = fields.Str(dump_default="Activa")
    fecha_creacion = fields.DateTime(dump_only=True)
    fecha_actualizacion = fields.DateTime(dump_only=True)
