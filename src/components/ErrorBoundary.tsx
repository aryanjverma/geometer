import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere below it so a single broken page degrades
 * gracefully instead of unmounting the whole SPA and leaving every route blank.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.assign('/dashboard');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-center">
          <div className="question-box">
            <h2>Something went wrong</h2>
            <p className="muted">An unexpected error interrupted this page.</p>
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
