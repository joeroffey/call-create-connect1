import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 2;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: Math.random().toString(36).substr(2, 9),
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.props.context || 'unknown',
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };
    
    console.error(`Error in ${this.props.context || 'component'}:`, errorDetails);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReportingService.log(errorDetails);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
        errorId: Math.random().toString(36).substr(2, 9)
      }));
    } else {
      // Force a page refresh as last resort
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';

      return (
        <Alert className="my-4 border-destructive/50 bg-destructive/5">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <AlertDescription className="flex flex-col gap-3">
            <div>
              <p className="font-medium text-destructive">
                Error in {this.props.context || 'component'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {errorMessage}
              </p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-muted-foreground">
                    Technical details (ID: {this.state.errorId})
                  </summary>
                  <pre className="text-xs mt-1 text-muted-foreground overflow-auto max-h-32">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.handleRetry}
                disabled={!canRetry}
                className="h-8"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {canRetry ? `Try Again (${this.maxRetries - this.state.retryCount} left)` : 'Refresh Page'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}