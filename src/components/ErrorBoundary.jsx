import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    logger.error('ErrorBoundary caught an error:', error);
    logger.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2>
              <i className="fas fa-exclamation-triangle"></i>
              Something went wrong
            </h2>
            <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
            {import.meta.env.DEV && this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary>Error Details (Development Only)</summary>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '300px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div className="error-boundary-actions">
              <button 
                className="btn btn-primary" 
                onClick={this.handleReset}
              >
                <i className="fas fa-redo"></i> Try Again
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-refresh"></i> Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

