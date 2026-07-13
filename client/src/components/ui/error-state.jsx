import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';








export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this content. Please try again.',
  retryText = 'Retry Request',
  onRetry,
}) => {
  return (
    React.createElement('div', { className: "flex flex-col items-center justify-center text-center p-8 border border-destructive/20 rounded-xl bg-destructive/5 backdrop-blur-sm shadow-sm duration-300"            ,}
      , React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4"        ,}
        , React.createElement(AlertCircle, { className: "h-6 w-6" ,} )
      )
      , React.createElement('h3', { className: "text-base font-semibold tracking-tight text-destructive"   ,}, title)
      , React.createElement('p', { className: "text-sm text-muted-foreground mt-1 max-w-sm"   ,}, description)
      , onRetry && (
        React.createElement(Button, { onClick: onRetry, variant: "destructive", className: "mt-4", size: "sm",}
          , retryText
        )
      )
    )
  );
};

export default ErrorState;
