import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarMantenimiento = ({ events, onEventClick, date, onNavigate }) => {
    return (
        <div>
            <h2 className="header-section" style={{ borderBottom: 'none', marginBottom: '10px' }}>Calendario de Mantenimientos</h2>
            <Calendar
                localizer={localizer}
                events={events}
                date={date}
                onNavigate={onNavigate}
                views={['month']}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                culture='es'
                messages={{
                    next: "Sig.",
                    previous: "Ant.",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "No hay eventos en este rango.",
                }}
                eventPropGetter={(event) => {
                    const backgroundColor = event.color || '#3b82f6';
                    return { style: { backgroundColor } };
                }}
                onSelectEvent={onEventClick}
            />
        </div>
    );
};

export default CalendarMantenimiento;
