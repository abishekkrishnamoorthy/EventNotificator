import React, { useMemo } from 'react';
import CalendarDay from './CalendarDay';

const Calendar = React.memo(({ currentDate, events, onDayClick, previousMonth, nextMonth }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const days = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const daysArray = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      daysArray.push(new Date(date));
    }
    return daysArray;
  }, [currentDate]);

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <button className="btn btn-outline" onClick={previousMonth}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button className="btn btn-outline" onClick={nextMonth}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      <div id="calendarGrid">
        <div className="calendar-weekdays">
          {weekdays.map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((date, idx) => (
            <CalendarDay
              key={idx}
              date={date}
              currentMonth={currentDate}
              events={events}
              onClick={onDayClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;

