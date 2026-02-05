from marshmallow import Schema, fields, validate

class AuditoriaSchema(Schema):
    id = fields.Int(dump_only=True)
    fecha = fields.Date(required=True)
    hora = fields.Time(required=True)
    estado = fields.Str(required=True)
    lugar = fields.Str(required=True)
    archivo_path = fields.Str(dump_only=True)
    fecha_creacion = fields.DateTime(dump_only=True)
    fecha_actualizacion = fields.DateTime(dump_only=True)
