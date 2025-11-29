import React, { useMemo, useCallback } from 'react';
import { formatDisplayDate } from '../../utils/helpers';
import { useApp } from '../../contexts/AppContext';

const Sidebar = React.memo(({ events, groups }) => {
  const { updateEvent, deleteEvent } = useApp();

  const todos = useMemo(() => events.filter(event => event.type === 'todo'), [events]);
  
  const upcoming = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= nextWeek && !event.completed;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const handleToggleTodo = useCallback(async (todoId) => {
    const todo = events.find(e => e.id === todoId);
    if (todo) {
      await updateEvent(todoId, { completed: !todo.completed });
    }
  }, [events, updateEvent]);

  return (
    <aside className="sidebar">
      <div className="todo-section">
        <h3><i className="fas fa-tasks"></i> Todo List</h3>
        <div className="todo-list">
          {todos.length === 0 ? (
            <p className="empty-state">No todos yet. Create your first todo!</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  className="todo-checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                />
                <div className="todo-content">
                  <div className="todo-title">{todo.title}</div>
                  <div className="todo-date">{formatDisplayDate(todo.date)}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(todo.id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="groups-section">
        <h3><i className="fas fa-users"></i> Groups</h3>
        <div className="groups-list">
          {groups.length === 0 ? (
            <p className="empty-state">No groups yet. Create your first group!</p>
          ) : (
            groups.map(group => (
              <div key={group.id} className="group-item">
                <div className="group-name">{group.name}</div>
                <div className="group-members">{group.members.length} members</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="upcoming-section">
        <h3><i className="fas fa-clock"></i> Upcoming Events</h3>
        <div className="upcoming-list">
          {upcoming.length === 0 ? (
            <p className="empty-state">No upcoming events this week.</p>
          ) : (
            upcoming.map(event => (
              <div key={event.id} className="upcoming-item">
                <div className="upcoming-title">{event.title}</div>
                <div className="upcoming-date">{formatDisplayDate(event.date)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;

