import React from 'react';

const ConfirmModal = ({ show, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  if (!show) return null;

  return (
    <div className="modal show" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>
            {type === 'danger' && <i className="fas fa-exclamation-triangle" style={{ color: '#dc3545' }}></i>}
            {type === 'warning' && <i className="fas fa-exclamation-circle" style={{ color: '#ffc107' }}></i>}
            {type === 'info' && <i className="fas fa-info-circle" style={{ color: '#17a2b8' }}></i>}
            {' '}{title}
          </h3>
          <button className="close-btn" onClick={onCancel}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn ${type === 'danger' ? 'btn-danger' : type === 'warning' ? 'btn-warning' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

