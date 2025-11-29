import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="pagination" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      margin: '1rem 0'
    }}>
      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <i className="fas fa-chevron-left"></i> Previous
      </button>
      
      {pages[0] > 1 && (
        <>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(1)}
          >
            1
          </button>
          {pages[0] > 2 && <span>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span>...</span>}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        className="btn btn-outline btn-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;

