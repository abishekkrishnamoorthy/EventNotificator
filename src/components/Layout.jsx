import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';
import Notification from './Notification';
import { useApp } from '../contexts/AppContext';

const Layout = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const { loading, notification, showNotification } = useApp();

  const toggleNav = () => setNavOpen(!navOpen);
  const closeNav = () => setNavOpen(false);

  return (
    <div className="app-container">
      <Navigation isOpen={navOpen} onClose={closeNav} />
      <div className={`content-wrapper ${navOpen ? 'nav-open' : ''}`}>
        <Header
          onMenuToggle={toggleNav}
        />
        <Outlet context={{ 
          showEventModal, 
          setShowEventModal, 
          showGroupModal, 
          setShowGroupModal, 
          showTodoModal, 
          setShowTodoModal 
        }} />
      </div>
      <LoadingSpinner show={loading} />
      {notification && (
        <Notification 
          notification={notification} 
          onClose={() => showNotification(null)} 
        />
      )}
    </div>
  );
};

export default Layout;

