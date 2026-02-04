from marshmallow import Schema, fields, validate

class AreaSchema(Schema):
    id = fields.Int(dump_only=True, attribute="idArea")
    nombre = fields.Str(required=True, validate=validate.Length(min=2))
    estado = fields.Str(dump_only=True)
