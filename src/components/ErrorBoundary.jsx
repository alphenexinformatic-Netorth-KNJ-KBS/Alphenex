import React from 'react';
import ErrorPage from '../pages/ErrorPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidMount() {
    // Catch-all for async chunk loading errors (offline navigation)
    window.addEventListener('unhandledrejection', this.handleAsyncError);
    // Explicit offline detection
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleAsyncError);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOffline = () => {
    this.setState({ hasError: true, error: new Error('Network Connection Lost') });
  };

  handleAsyncError = (event) => {
    if (event.reason && (
      event.reason.name === 'ChunkLoadError' || 
      event.reason.message.includes('loading chunk') ||
      !navigator.onLine
    )) {
      this.setState({ hasError: true, error: event.reason });
    }
  };

  componentDidCatch(error, errorInfo) {
    // Log to DB via the error logger endpoint
    try {
      const errorData = {
        error_source: 'frontend',
        error_page_name: errorInfo?.componentStack?.match(/at (\w+)/)?.[1] || 'ErrorBoundary',
        endpoint: window.location.pathname,
        error_message: `REACT CRASH: ${error.name}: ${error.message}\n\nStack: ${error.stack || 'N/A'}\n\nComponent Stack: ${errorInfo?.componentStack || 'N/A'}`,
      };
      fetch('/api/log_error.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      }).catch(() => {}); // fail silently
    } catch {}
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    // Attempt to navigate to the home route
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorPage resetError={this.resetError} error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
