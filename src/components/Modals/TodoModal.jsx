import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { sanitizeTitle, sanitizeDescription } from '../../utils/sanitize';
import logger from '../../utils/logger';

const TodoModal = ({ onClose }) => {
  const { createEvent } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const todoData = {
        title: sanitizeTitle(formData.title),
        date: formData.date,
        description: sanitizeDescription(formData.description),
        type: 'todo',
        assignedTo: []
      };

      await createEvent(todoData);
      onClose();
    } catch (error) {
      logger.error('Error creating todo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fas fa-tasks"></i> Add Todo</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="todoTitle">Todo Title</label>
            <input
              type="text"
              id="todoTitle"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="todoDate">Due Date</label>
            <input
              type="date"
              id="todoDate"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="todoDescription">Description</label>
            <textarea
              id="todoDescription"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>Create Todo</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;

