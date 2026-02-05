from marshmallow import Schema, fields, validate

class CapacitacionSchema(Schema):
    id = fields.Int(dump_only=True)
    nombre = fields.Str(required=True)
    profesional = fields.Str(required=True)
    fecha = fields.Date(required=True)
    descripcion = fields.Str(required=True)
    fecha_creacion = fields.DateTime(dump_only=True)
    fecha_actualizacion = fields.DateTime(dump_only=True)
