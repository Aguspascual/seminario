from marshmallow import Schema, fields, validate

class ProveedorSchema(Schema):
    id = fields.Int(dump_only=True, attribute="idProveedor")
    Nombre = fields.Str(required=True, validate=validate.Length(min=3))
    Numero = fields.Str(required=True)
    Email = fields.Email(required=True)
    idTipo = fields.Int(required=True)
    Estado = fields.Bool(dump_only=True)
    tipo_proveedor = fields.Function(lambda obj: obj.tipo_proveedor.nombreTipo if obj.tipo_proveedor else None)
