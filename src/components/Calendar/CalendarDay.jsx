import React, { useMemo } from 'react';
import { formatDate, isDateToday } from '../../utils/helpers';

const CalendarDay = React.memo(({ date, currentMonth, events, onClick }) => {
  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
  const isToday = isDateToday(date);
  const dayEvents = useMemo(() => {
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  }, [events, date]);

  const dayClasses = ['calendar-day'];
  if (!isCurrentMonth) dayClasses.push('other-month');
  if (isToday) dayClasses.push('today');
  if (dayEvents.length > 0) dayClasses.push('has-events');

  return (
    <div className={dayClasses.join(' ')} onClick={() => onClick(date)}>
      <div className="day-number">{date.getDate()}</div>
      <div className="day-events">
        {dayEvents.slice(0, 3).map((event, idx) => (
          <div key={idx} className={`event-item ${event.type}`} title={event.description || event.title}>
            {event.title}
          </div>
        ))}
        {dayEvents.length > 3 && (
          <div className="event-item">+{dayEvents.length - 3} more</div>
        )}
      </div>
    </div>
  );
});

CalendarDay.displayName = 'CalendarDay';

export default CalendarDay;

