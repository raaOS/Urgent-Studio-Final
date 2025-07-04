
'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }
  
  // A method to reset the error state, e.g., on a button click
  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card p-8 rounded-lg border text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Ada Sesuatu yang Salah
            </h2>
            <p className="text-muted-foreground mb-6">
              Maaf, terjadi kesalahan tak terduga pada bagian ini.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="text-left bg-muted p-2 rounded-md text-xs overflow-auto mb-6">
                    {this.state.error.stack}
                </pre>
            )}
            <Button
              onClick={this.resetError}
            >
              Coba lagi
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
