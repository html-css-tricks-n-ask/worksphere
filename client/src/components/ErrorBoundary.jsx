import React, { Component, } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';










export class ErrorBoundary extends Component {constructor(...args) { super(...args); ErrorBoundary.prototype.__init.call(this);ErrorBoundary.prototype.__init2.call(this); }
   __init() {this.state = {
    hasError: false,
    error: null,
  }}

   static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

   componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

   __init2() {this.handleReload = () => {
    window.location.reload();
  }}

   render() {
    if (this.state.hasError) {
      return (
        React.createElement('div', { className: "flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background"       ,}
          , React.createElement('div', { className: "flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-6 animate-pulse"         ,}
            , React.createElement(ShieldAlert, { className: "h-8 w-8" ,} )
          )
          , React.createElement('h1', { className: "text-2xl font-bold tracking-tight mb-2"   ,}, "Something went wrong"  )
          , React.createElement('p', { className: "text-sm text-muted-foreground max-w-md mb-6"   ,}, "An unexpected error occurred in the application. Please reload or contact support if the issue persists."

          )
          , this.state.error && (
            React.createElement('pre', { className: "p-4 mb-6 text-xs text-left border rounded-lg bg-muted text-muted-foreground font-mono max-w-lg overflow-auto custom-scrollbar"           ,}
              , this.state.error.toString()
            )
          )
          , React.createElement(Button, { onClick: this.handleReload, className: "gap-2",}
            , React.createElement(RotateCcw, { className: "h-4 w-4" ,} ), "Reload Page"

          )
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
