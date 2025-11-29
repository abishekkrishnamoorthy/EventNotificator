import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

const Navigation = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      logger.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/calendar', icon: 'fa-calendar', label: 'Calendar' },
    { path: '/events', icon: 'fa-list', label: 'Events' },
    { path: '/groups', icon: 'fa-users', label: 'Groups' },
    { path: '/chat', icon: 'fa-comments', label: 'Chat' },
    { path: '/profile', icon: 'fa-user-circle', label: 'Profile' }
  ];

  return (
    <>
      <nav className={`nav-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <h2><i className="fas fa-calendar-alt"></i> Menu</h2>
          <button className="nav-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul className="nav-menu">
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={onClose}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-footer">
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="nav-item nav-logout"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
      {isOpen && <div className="nav-overlay show" onClick={onClose}></div>}
    </>
  );
};

export default Navigation;

