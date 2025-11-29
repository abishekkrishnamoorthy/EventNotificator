import React, { useEffect } from 'react';

const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      <div className="notification-content">
        <span>{notification.message}</span>
        <button className="notification-close" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
};

export default Notification;

