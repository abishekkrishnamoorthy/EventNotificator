import React from 'react';

const Header = ({ onMenuToggle }) => {
  const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  return (
    <header className="app-header">
      <button 
        className="menu-toggle-btn" 
        onClick={handleMenuToggle}
        type="button"
        aria-label="Toggle navigation menu"
      >
        <i className="fas fa-bars"></i>
      </button>
      <h1><i className="fas fa-calendar-alt"></i> Calendar & Todo Manager</h1>
    </header>
  );
};

export default Header;

