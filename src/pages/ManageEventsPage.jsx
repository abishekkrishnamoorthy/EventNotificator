import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { formatDisplayDate } from '../utils/helpers';
import EventModal from '../components/Modals/EventModal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';

const ManageEventsPage = () => {
  const { events, groups, deleteEvent } = useApp();
  const { showEventModal, setShowEventModal } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, eventId: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      const matchesType = !typeFilter || event.type === typeFilter;
      const matchesDate = !dateFilter || event.date === dateFilter;
      return matchesSearch && matchesType && matchesDate;
    });
  }, [events, debouncedSearchTerm, typeFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, typeFilter, dateFilter]);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleDelete = (eventId) => {
    setDeleteConfirm({ show: true, eventId });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.eventId) {
      await deleteEvent(deleteConfirm.eventId);
      setDeleteConfirm({ show: false, eventId: null });
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
  };

  return (
    <>
      <div className="page-header">
        <h2><i className="fas fa-list"></i> Manage All Events</h2>
        <button className="btn btn-primary" onClick={() => setShowEventModal(true)}>
          <i className="fas fa-plus"></i> Add New Event
        </button>
      </div>
      <div className="manage-events-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
        <div className="filter-box">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="event">Events</option>
            <option value="todo">Todos</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>
      <div className="manage-events-list">
        {filteredEvents.length === 0 ? (
          <p className="empty-state">No events match your filters.</p>
        ) : (
          paginatedEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <div>
                  <span className="event-card-title">{event.title}</span>
                  <span className={`event-card-type ${event.type}`}>{event.type}</span>
                </div>
                <div className="event-card-actions">
                  <button className="btn btn-success btn-sm" onClick={() => handleEdit(event)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event.id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
              <div className="event-card-body">
                <p>{event.description || 'No description'}</p>
              </div>
              <div className="event-card-footer">
                <div>
                  <strong>Date:</strong> {formatDisplayDate(event.date)}
                  {event.completed && (
                    <span style={{ color: '#28a745', marginLeft: '10px' }}>
                      <i className="fas fa-check"></i> Completed
                    </span>
                  )}
                </div>
                {event.assignedTo && event.assignedTo.length > 0 && (
                  <div className="event-assignees">
                    {event.assignedTo.map((email, idx) => (
                      <span key={idx} className="event-assignee">{email}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {showEventModal && (
        <EventModal
          onClose={handleCloseModal}
          groups={groups}
          eventToEdit={editingEvent}
        />
      )}
      <ConfirmModal
        show={deleteConfirm.show}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, eventId: null })}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
};

export default ManageEventsPage;

