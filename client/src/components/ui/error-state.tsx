import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button.js';

interface ErrorStateProps {
  title?: string;
  description?: string;
  retryText?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  retryText = 'Retry Request',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-destructive/20 rounded-xl bg-destructive/5 backdrop-blur-sm shadow-sm duration-300">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-destructive">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="destructive" className="mt-4" size="sm">
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
