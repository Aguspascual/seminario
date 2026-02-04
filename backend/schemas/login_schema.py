from marshmallow import Schema, fields

class LoginSchema(Schema):
    email = fields.Email(required=True)
    contrasena = fields.Str(required=True)
