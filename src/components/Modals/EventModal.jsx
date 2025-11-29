import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { validateEmails } from '../../utils/helpers';
import { sanitizeTitle, sanitizeDescription } from '../../utils/sanitize';
import logger from '../../utils/logger';

const EventModal = ({ onClose, groups = [], eventToEdit = null }) => {
  const { createEvent, updateEvent, showNotification } = useApp();
  
  // Parse event date and time if editing
  const eventDate = eventToEdit?.date ? eventToEdit.date.split('T')[0] : '';
  const eventTime = eventToEdit?.date && eventToEdit.date.includes('T') 
    ? eventToEdit.date.split('T')[1].substring(0, 5) 
    : '';
  
  const [formData, setFormData] = useState({
    title: eventToEdit?.title || '',
    date: eventDate,
    time: eventTime,
    description: eventToEdit?.description || '',
    selectedGroups: eventToEdit?.groupIds || [],
    assignedMembers: eventToEdit?.assignedTo?.join(', ') || ''
  });
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setLoading(true);
    
    try {
      // Validate that at least one group or member is selected
      if (formData.selectedGroups.length === 0 && !formData.assignedMembers.trim()) {
        setEmailError('Please select at least one group or add at least one member');
        setLoading(false);
        return;
      }
      
      // Validate emails if assignedMembers is provided
      let assignees = [];
      if (formData.assignedMembers.trim()) {
        const emailValidation = validateEmails(formData.assignedMembers);
        if (!emailValidation.valid) {
          setEmailError(`Invalid email addresses: ${emailValidation.invalid.join(', ')}`);
          setLoading(false);
          return;
        }
        assignees = emailValidation.emails;
      }

      // Combine date and time
      const eventDateTime = formData.time 
        ? `${formData.date}T${formData.time}:00`
        : `${formData.date}T00:00:00`;

      const eventData = {
        title: sanitizeTitle(formData.title),
        date: eventDateTime,
        description: sanitizeDescription(formData.description),
        type: 'event',
        groupIds: formData.selectedGroups,
        assignedTo: assignees
      };

      if (eventToEdit) {
        await updateEvent(eventToEdit.id, eventData);
      } else {
        await createEvent(eventData);
      }
      onClose();
    } catch (error) {
      logger.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGroupToggle = (groupId) => {
    setFormData(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter(id => id !== groupId)
        : [...prev.selectedGroups, groupId]
    }));
  };

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fas fa-calendar-plus"></i> {eventToEdit ? 'Edit' : 'Add'} Event</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventTitle">Event Title</label>
            <input
              type="text"
              id="eventTitle"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDate">Date</label>
            <input
              type="date"
              id="eventDate"
              required
              min={getMinDate()}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventTime">Time</label>
            <input
              type="time"
              id="eventTime"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="eventDescription">Description</label>
            <textarea
              id="eventDescription"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Select Groups</label>
            {groups.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }}>
                {groups.map(group => (
                  <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.selectedGroups.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', fontSize: '0.875rem' }}>No groups available. Create a group first.</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="eventAssignees">Add Members (Email addresses, comma separated)</label>
            <input
              type="text"
              id="eventAssignees"
              placeholder="user1@email.com, user2@email.com"
              value={formData.assignedMembers}
              onChange={(e) => {
                setFormData({ ...formData, assignedMembers: e.target.value });
                setEmailError('');
              }}
            />
            {emailError && (
              <div className="form-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                <i className="fas fa-exclamation-circle"></i> {emailError}
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>Save Event</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;

