import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { events, groups } = useApp();

  // Calculate stats
  const today = new Date();
  // Normalize to date-only string (YYYY-MM-DD) for consistent comparison
  const todayStr = today.toISOString().split('T')[0];
  
  // Filter upcoming events (excluding today, using date-only comparison)
  const upcomingEvents = events.filter(event => {
    if (!event.date) return false;
    // Compare date strings directly to avoid timezone issues
    const eventDateStr = event.date.split('T')[0]; // Handle ISO strings
    return eventDateStr > todayStr;
  }).sort((a, b) => {
    // Sort by date string comparison
    const dateA = a.date.split('T')[0];
    const dateB = b.date.split('T')[0];
    return dateA.localeCompare(dateB);
  }).slice(0, 5);

  // Filter today's events using date-only comparison
  const todayEvents = events.filter(event => {
    if (!event.date) return false;
    const eventDateStr = event.date.split('T')[0];
    return eventDateStr === todayStr;
  });
  const totalEvents = events.length;
  const totalGroups = groups.length;

  const getUserDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          <i className="fas fa-tachometer-alt"></i>
          Welcome back, {getUserDisplayName()}!
        </h1>
        <p>Here's what's happening with your events and groups.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>{totalEvents}</h3>
            <p>Total Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-content">
            <h3>{todayEvents.length}</h3>
            <p>Today's Events</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-success">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>{totalGroups}</h3>
            <p>Groups</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{upcomingEvents.length}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2><i className="fas fa-calendar-day"></i> Today's Events</h2>
            <Link to="/events" className="btn btn-outline btn-sm">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          {todayEvents.length > 0 ? (
            <div className="events-list">
              {todayEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <div>
                      <div className="event-card-title">{event.title}</div>
                      {event.group && (
                        <span className="event-card-type group-task">
                          {event.group}
                        </span>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <div className="event-card-body">{event.description}</div>
                  )}
                  <div className="event-card-footer">
                    <span><i className="fas fa-clock"></i> {event.time || 'All day'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>No events scheduled for today</p>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2><i className="fas fa-calendar-alt"></i> Upcoming Events</h2>
            <Link to="/calendar" className="btn btn-outline btn-sm">
              View Calendar <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="events-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <div>
                      <div className="event-card-title">{event.title}</div>
                      {event.group && (
                        <span className="event-card-type group-task">
                          {event.group}
                        </span>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <div className="event-card-body">{event.description}</div>
                  )}
                  <div className="event-card-footer">
                    <span>
                      <i className="fas fa-calendar"></i> {new Date(event.date).toLocaleDateString()}
                    </span>
                    {event.time && (
                      <span><i className="fas fa-clock"></i> {event.time}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-calendar-check"></i>
              <p>No upcoming events</p>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-actions">
        <h2><i className="fas fa-bolt"></i> Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/calendar" className="action-card">
            <i className="fas fa-plus-circle"></i>
            <h3>Create Event</h3>
            <p>Add a new event to your calendar</p>
          </Link>

          <Link to="/groups" className="action-card">
            <i className="fas fa-users"></i>
            <h3>View Groups</h3>
            <p>Manage your groups and members</p>
          </Link>

          <Link to="/chat" className="action-card">
            <i className="fas fa-comments"></i>
            <h3>Group Chat</h3>
            <p>Chat with your group members</p>
          </Link>

          <Link to="/profile" className="action-card">
            <i className="fas fa-user-circle"></i>
            <h3>Profile</h3>
            <p>Update your profile settings</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

