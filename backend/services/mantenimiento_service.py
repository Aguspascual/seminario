from models.mantenimiento import Mantenimiento, ReporteFalla
from models.insumo import Insumo
from utils.database import db
from datetime import datetime, timedelta, date
from sqlalchemy import func

class MantenimientoService:
    @staticmethod
    def get_dashboard_kpis():
        today = date.today()
        first_day_of_month = today.replace(day=1)
        
        vencidos = Mantenimiento.query.filter(Mantenimiento.estado == 'Vencido').count()
        # Also count pendants that are past due as 'Vencido' for display, or just rely on 'estado' field update
        # For now, let's assume a job updates the status, or we count manually.
        # Let's count 'Pendiente' with date < today as Vencido too if not updated.
        real_vencidos = Mantenimiento.query.filter(
            ((Mantenimiento.estado == 'Vencido') | 
             ((Mantenimiento.estado == 'Pendiente') & (Mantenimiento.fecha_programada < today)))
        ).count()
        
        pendientes = Mantenimiento.query.filter(Mantenimiento.estado == 'Pendiente', Mantenimiento.fecha_programada >= today).count()
        en_proceso = Mantenimiento.query.filter(Mantenimiento.estado == 'En Proceso').count()
        completados = Mantenimiento.query.filter(
            Mantenimiento.estado == 'Completado'
        ).count()
        
        # Calculate completion rate (completados / (completados + vencidos)) * 100 roughly
        # For total completion rate, maybe we should use total created vs total completed?
        # User only asked to change the count. I will keep the rate logic simple/same for now or maybe adjust?
        # "tasa_cumplimiento" usually implies adherence to schedule. 
        # If we change "Completados" to total, the rate might be confusing if it combines monthly vencidos with total completed.
        # Let's keep existing rate logic but update the count variable name.
        
        # Actually user just wants "Completados" to show total.
        # I will keep "completados_mes" variable for rate calculation if needed, or just not touch rate for now.
        # Let's see:
        
        total_closed = completados + real_vencidos
        tasa_cumplimiento = (completados / total_closed * 100) if total_closed > 0 else 100
        
        # Upcoming 7 days
        next_week = today + timedelta(days=7)
        proximos = Mantenimiento.query.filter(
            Mantenimiento.fecha_programada >= today,
            Mantenimiento.fecha_programada <= next_week,
            Mantenimiento.estado != 'Completado',
            Mantenimiento.estado != 'Cancelado'
        ).order_by(Mantenimiento.fecha_programada.asc()).limit(5).all()
        
        # Get recent faults
        fallas_recientes = MantenimientoService.get_recent_faults()

        return {
            "vencidos": real_vencidos,
            "pendientes": pendientes,
            "en_proceso": en_proceso,
            "completados": completados,
            "tasa_cumplimiento": round(tasa_cumplimiento, 1),
            "proximos_7_dias": [m.to_dict() for m in proximos],
            "fallas_recientes": fallas_recientes
        }

    @staticmethod
    def get_calendar_events(month, year):
        # Calculate start and end date of the month
        # Creating a date object requires day, so start with 1st
        try:
            start_date = date(year, month, 1)
            # Simple way to get end of month: first day of next month - 1 day
            if month == 12:
                end_date = date(year + 1, 1, 1) - timedelta(days=1)
            else:
                end_date = date(year, month + 1, 1) - timedelta(days=1)
        except ValueError:
            return []

        events = Mantenimiento.query.filter(
            Mantenimiento.fecha_programada >= start_date,
            Mantenimiento.fecha_programada <= end_date
        ).all()
        
        event_list = []
        for e in events:
            color = "#6b7280" # Default gray
            if e.tipo == "Preventivo": color = "#3b82f6"
            elif e.tipo == "Correctivo": color = "#ef4444"
            elif e.tipo == "Predictivo": color = "#f59e0b"
            
            # Status override
            if e.estado == "Completado": color = "#10b981"
            elif e.estado == "Vencido": color = "#dc2626"
            
            event_list.append({
                "id": e.id,
                "title": f"{e.tipo} - {e.maquinaria.nombre if e.maquinaria else 'Unk'}",
                "start": e.fecha_programada.isoformat(),
                "end":(e.fecha_programada).isoformat(), # All day events usually
                "allDay": True,
                "color": color,
                "extendedProps": {
                    "estado": e.estado,
                    "prioridad": e.prioridad,
                    "maquinaria_id": e.maquinaria_id,
                    "maquinaria_nombre": e.maquinaria.nombre if e.maquinaria else 'Desconocida',
                    "tipo": e.tipo,
                    "descripcion": e.descripcion,
                    "responsable_id": e.responsable_id,
                    "responsable_nombre": e.responsable.nombre if e.responsable else 'Sin asignar',
                    "tiempo_estimado": e.tiempo_estimado,
                    "hora_programada": e.hora_programada.strftime('%H:%M') if e.hora_programada else None
                }
            })
            
        return event_list

    @staticmethod
    def get_recent_faults():
        faults = ReporteFalla.query.order_by(ReporteFalla.fecha_reporte.desc()).limit(10).all()
        return [f.to_dict() for f in faults]

    @staticmethod
    def create_mantenimiento(data):
        new_mant = Mantenimiento(
            maquinaria_id=data['maquinaria_id'],
            tipo=data['tipo'],
            fecha_programada=datetime.strptime(data['fecha_programada'], '%Y-%m-%d').date(),
            hora_programada=datetime.strptime(data['hora_programada'], '%H:%M').time() if 'hora_programada' in data else None,
            responsable_id=data.get('responsable_id'),
            prioridad=data.get('prioridad', 'Media'),
            tiempo_estimado=data.get('tiempo_estimado'),
            descripcion=data['descripcion'],
            es_recurrente=data.get('es_recurrente', False),
            frecuencia_dias=data.get('frecuencia_dias'),
            creado_por=data.get('creado_por')
        )
        db.session.add(new_mant)
        db.session.commit()
        return new_mant

    @staticmethod
    def update_mantenimiento(id, data):
        mant = Mantenimiento.query.get(id)
        if not mant:
            return None
        
        if 'maquinaria_id' in data: mant.maquinaria_id = data['maquinaria_id']
        if 'tipo' in data: mant.tipo = data['tipo']
        if 'fecha_programada' in data: 
            mant.fecha_programada = datetime.strptime(data['fecha_programada'], '%Y-%m-%d').date()
        if 'hora_programada' in data:
            mant.hora_programada = datetime.strptime(data['hora_programada'], '%H:%M').time() if data['hora_programada'] else None
        if 'responsable_id' in data: mant.responsable_id = data['responsable_id']
        if 'prioridad' in data: mant.prioridad = data['prioridad']
        if 'tiempo_estimado' in data: mant.tiempo_estimado = data['tiempo_estimado']
        if 'descripcion' in data: mant.descripcion = data['descripcion']
        if 'estado' in data: 
            mant.estado = data['estado']
            if mant.estado == 'Completado' and not mant.fecha_realizada:
                 mant.fecha_realizada = date.today()
            elif mant.estado != 'Completado':
                 mant.fecha_realizada = None

        if 'fecha_realizada' in data:
            mant.fecha_realizada = datetime.strptime(data['fecha_realizada'], '%Y-%m-%d').date() if data['fecha_realizada'] else None
        if 'observaciones' in data: mant.observaciones = data['observaciones']
        if 'realizado_por' in data: mant.realizado_por = data['realizado_por']

        db.session.commit()
        return mant

    @staticmethod
    def delete_mantenimiento(id):
        mant = Mantenimiento.query.get(id)
        if not mant:
            return False
        
        db.session.delete(mant)
        db.session.commit()
        return True

    # --- ReporteFalla CRUD ---
    @staticmethod
    def create_reporte_falla(data):
        new_reporte = ReporteFalla(
            maquinaria_id=data['maquinaria_id'],
            reportado_por=data['reportado_por'],
            descripcion_falla=data['descripcion_falla'],
            criticidad=data['criticidad'],
            ubicacion_especifica=data.get('ubicacion_especifica'),
            puede_operar=data.get('puede_operar', 'No')
        )
        db.session.add(new_reporte)
        db.session.commit()
        return new_reporte

    @staticmethod
    def get_all_reportes_fallas():
        reportes = ReporteFalla.query.order_by(ReporteFalla.fecha_reporte.desc()).all()
        return [r.to_dict() for r in reportes]

    @staticmethod
    def update_reporte_falla(id, data):
        reporte = ReporteFalla.query.get(id)
        if not reporte:
            return None
        
        if 'maquinaria_id' in data: reporte.maquinaria_id = data['maquinaria_id']
        if 'descripcion_falla' in data: reporte.descripcion_falla = data['descripcion_falla']
        if 'criticidad' in data: reporte.criticidad = data['criticidad']
        if 'ubicacion_especifica' in data: reporte.ubicacion_especifica = data['ubicacion_especifica']
        if 'puede_operar' in data: reporte.puede_operar = data['puede_operar']
        if 'estado_reporte' in data: reporte.estado_reporte = data['estado_reporte']
        if 'mantenimiento_generado_id' in data: reporte.mantenimiento_generado_id = data['mantenimiento_generado_id']

        db.session.commit()
        return reporte

    @staticmethod
    def delete_reporte_falla(id):
        reporte = ReporteFalla.query.get(id)
        if not reporte:
            return False
        
        db.session.delete(reporte)
        db.session.commit()
        return True
