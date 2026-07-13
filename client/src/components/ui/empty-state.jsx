import React from 'react';
import { Database } from 'lucide-react';
import { Button } from './button';









export const EmptyState = ({
  title = 'No records found',
  description = 'There are no active records in this view right now.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    React.createElement('div', { className: "flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-card/50 backdrop-blur-sm shadow-sm duration-300"            ,}
      , React.createElement('div', { className: "flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 animate-bounce"         ,}
        , icon || React.createElement(Database, { className: "h-6 w-6" ,} )
      )
      , React.createElement('h3', { className: "text-base font-semibold tracking-tight"  ,}, title)
      , React.createElement('p', { className: "text-sm text-muted-foreground mt-1 max-w-sm"   ,}, description)
      , actionText && onAction && (
        React.createElement(Button, { onClick: onAction, className: "mt-4", size: "sm",}
          , actionText
        )
      )
    )
  );
};

export default EmptyState;
