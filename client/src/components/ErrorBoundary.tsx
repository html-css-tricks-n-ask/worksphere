import { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from './ui/button.js';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-6 animate-pulse">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            An unexpected error occurred in the application. Please reload or contact support if the issue persists.
          </p>
          {this.state.error && (
            <pre className="p-4 mb-6 text-xs text-left border rounded-lg bg-muted text-muted-foreground font-mono max-w-lg overflow-auto custom-scrollbar">
              {this.state.error.toString()}
            </pre>
          )}
          <Button onClick={this.handleReload} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
