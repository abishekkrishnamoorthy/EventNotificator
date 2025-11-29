import React from 'react';

const LoadingSpinner = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="loading-spinner show">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;

