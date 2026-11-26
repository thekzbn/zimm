import React from 'react';

interface ErrorBoundaryProps {
  fallbackTitle: string;
  fallbackActionLabel: string;
  onReset?: () => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || null };
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="zimm-error-boundary" role="alert">
          <h2 className="zimm-mode-header__title">{this.props.fallbackTitle}</h2>
          {this.state.errorMessage && (
            <p className="zimm-mode-header__desc">{this.state.errorMessage}</p>
          )}
          <button
            type="button"
            className="zimm-btn-primary"
            onClick={this.handleReset}
          >
            {this.props.fallbackActionLabel}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
