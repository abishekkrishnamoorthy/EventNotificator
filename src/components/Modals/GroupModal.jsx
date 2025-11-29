import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { validateEmails } from '../../utils/helpers';
import { sanitizeGroupName, sanitizeDescription } from '../../utils/sanitize';
import logger from '../../utils/logger';

const GroupModal = ({ onClose }) => {
  const { createGroup, showNotification } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: ''
  });
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setLoading(true);
    
    try {
      // Validate emails if members are provided
      if (formData.members.trim()) {
        const emailValidation = validateEmails(formData.members);
        if (!emailValidation.valid) {
          setEmailError(`Invalid email addresses: ${emailValidation.invalid.join(', ')}`);
          setLoading(false);
          return;
        }
        if (emailValidation.emails.length === 0) {
          setEmailError('Please provide at least one valid email address');
          setLoading(false);
          return;
        }
      }
      
      const members = formData.members
        ? formData.members
            .split(',')
            .map(email => email.trim())
            .filter(email => email && validateEmails(email).valid)
        : [];

      const groupData = {
        name: sanitizeGroupName(formData.name),
        description: sanitizeDescription(formData.description),
        members: members
      };

      await createGroup(groupData);
      onClose();
    } catch (error) {
      logger.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="fas fa-users"></i> Create Group</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              type="text"
              id="groupName"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="groupDescription">Description</label>
            <textarea
              id="groupDescription"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="groupMembers">Members (Email addresses, comma separated)</label>
            <input
              type="text"
              id="groupMembers"
              placeholder="member1@email.com, member2@email.com"
              value={formData.members}
              onChange={(e) => {
                setFormData({ ...formData, members: e.target.value });
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
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>Create Group</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;

