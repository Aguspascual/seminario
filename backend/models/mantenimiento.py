from utils.database import db
from datetime import datetime

class Mantenimiento(db.Model):
    __tablename__ = 'mantenimientos'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('Maquinaria.idMaquinaria'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False) # Preventivo, Correctivo, Predictivo
    
    fecha_programada = db.Column(db.Date, nullable=False)
    hora_programada = db.Column(db.Time, nullable=True)
    
    fecha_realizada = db.Column(db.Date, nullable=True)
    hora_inicio = db.Column(db.Time, nullable=True)
    hora_fin = db.Column(db.Time, nullable=True)
    
    tiempo_estimado = db.Column(db.Float, nullable=True) # En horas
    tiempo_real = db.Column(db.Float, nullable=True) # En horas
    
    responsable_id = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=True)
    
    estado = db.Column(db.String(20), nullable=False, default='Pendiente') # Pendiente, En Proceso, Completado, Vencido, Cancelado
    prioridad = db.Column(db.String(10), nullable=False, default='Media') # Alta, Media, Baja
    
    descripcion = db.Column(db.Text, nullable=False)
    observaciones = db.Column(db.Text, nullable=True)
    hallazgos_adicionales = db.Column(db.Text, nullable=True)
    requiere_seguimiento = db.Column(db.Boolean, default=False)
    
    es_recurrente = db.Column(db.Boolean, default=False)
    frecuencia_dias = db.Column(db.Integer, nullable=True)
    
    creado_por = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.now)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relaciones
    maquinaria = db.relationship('Maquinaria', backref=db.backref('mantenimientos', lazy=True))
    responsable = db.relationship('Usuario', foreign_keys=[responsable_id], backref=db.backref('mantenimientos_asignados', lazy=True))
    creador = db.relationship('Usuario', foreign_keys=[creado_por], backref=db.backref('mantenimientos_creados', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'maquinaria_id': self.maquinaria_id,
            'maquinaria_nombre': self.maquinaria.nombre if self.maquinaria else None,
            'tipo': self.tipo,
            'fecha_programada': self.fecha_programada.isoformat() if self.fecha_programada else None,
            'hora_programada': self.hora_programada.strftime('%H:%M') if self.hora_programada else None,
            'fecha_realizada': self.fecha_realizada.isoformat() if self.fecha_realizada else None,
            'tiempo_estimado': self.tiempo_estimado,
            'tiempo_real': self.tiempo_real,
            'responsable_id': self.responsable_id,
            'responsable_nombre': self.responsable.nombre if self.responsable else None, # Changed .Nombre to .nombre based on usuario.py
            'estado': self.estado,
            'prioridad': self.prioridad,
            'descripcion': self.descripcion,
            'observaciones': self.observaciones,
            'es_recurrente': self.es_recurrente,
            'frecuencia_dias': self.frecuencia_dias
        }

class ReporteFalla(db.Model):
    __tablename__ = 'reportes_fallas'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    maquinaria_id = db.Column(db.Integer, db.ForeignKey('Maquinaria.idMaquinaria'), nullable=False)
    reportado_por = db.Column(db.Integer, db.ForeignKey('usuario.Legajo'), nullable=False)
    fecha_reporte = db.Column(db.DateTime, default=datetime.now)
    
    descripcion_falla = db.Column(db.Text, nullable=False)
    criticidad = db.Column(db.String(10), nullable=False) # Alta, Media, Baja
    ubicacion_especifica = db.Column(db.String(255), nullable=True)
    puede_operar = db.Column(db.String(20), nullable=True) # Si, No, Con restricciones
    
    estado_reporte = db.Column(db.String(20), default='Pendiente') # Pendiente, Asignado, En Proceso, Resuelto
    fecha_baja = db.Column(db.DateTime, nullable=True) # Soft delete
    
    mantenimiento_generado_id = db.Column(db.Integer, db.ForeignKey('mantenimientos.id'), nullable=True)
    
    # Relaciones
    maquinaria = db.relationship('Maquinaria', backref=db.backref('reportes_fallas', lazy=True))
    reportador = db.relationship('Usuario', foreign_keys=[reportado_por])
    mantenimiento = db.relationship('Mantenimiento', backref=db.backref('reporte_origen', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'maquinaria_id': self.maquinaria_id,
            'maquinaria_nombre': self.maquinaria.nombre if self.maquinaria else None,
            'maquinaria_ubicacion': self.maquinaria.ubicacion if self.maquinaria else None,
            'reportado_por': self.reportado_por,
            'reportador_nombre': self.reportador.nombre if self.reportador else None, # Changed .Nombre to .nombre
            'fecha_reporte': self.fecha_reporte.isoformat() if self.fecha_reporte else None,
            'descripcion_falla': self.descripcion_falla,
            'criticidad': self.criticidad,
            'ubicacion_especifica': self.ubicacion_especifica,
            'puede_operar': self.puede_operar,
            'estado_reporte': self.estado_reporte,
            'mantenimiento_generado_id': self.mantenimiento_generado_id
        }

class MantenimientoInsumo(db.Model):
    __tablename__ = 'mantenimientos_insumos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mantenimiento_id = db.Column(db.Integer, db.ForeignKey('mantenimientos.id'), nullable=False)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'), nullable=False)
    cantidad_utilizada = db.Column(db.Float, nullable=False)
    fecha_uso = db.Column(db.DateTime, default=datetime.now)
    
    # Relaciones
    insumo = db.relationship('Insumo')
    
    __table_args__ = (db.UniqueConstraint('mantenimiento_id', 'insumo_id', name='unique_mantenimiento_insumo'),)

