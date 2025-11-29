import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Calendar from '../components/Calendar/Calendar';
import Sidebar from '../components/Calendar/Sidebar';
import EventModal from '../components/Modals/EventModal';
import TodoModal from '../components/Modals/TodoModal';
import GroupModal from '../components/Modals/GroupModal';
import logger from '../utils/logger';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { events, groups } = useApp();
  const { showEventModal, setShowEventModal, showGroupModal, setShowGroupModal, showTodoModal, setShowTodoModal } = useOutletContext();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (date) => {
    // Show events for the day
    const dayEvents = events.filter(e => e.date === date.toISOString().split('T')[0]);
    if (dayEvents.length > 0) {
      logger.debug('Events for', { date, dayEvents });
    }
  };

  return (
    <>
      <main className="main-content">
        <Calendar currentDate={currentDate} events={events} onDayClick={handleDayClick} previousMonth={previousMonth} nextMonth={nextMonth} />
        <Sidebar events={events} groups={groups} />
      </main>
      {showEventModal && <EventModal onClose={() => setShowEventModal(false)} groups={groups} />}
      {showTodoModal && <TodoModal onClose={() => setShowTodoModal(false)} />}
      {showGroupModal && <GroupModal onClose={() => setShowGroupModal(false)} />}
    </>
  );
};

export default CalendarPage;

