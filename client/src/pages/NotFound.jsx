import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, MoveLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export const NotFound = () => {
  return (
    React.createElement('div', { className: "flex flex-col items-center justify-center min-h-[70vh] p-6 text-center"      ,}
      , React.createElement('div', { className: "flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 animate-pulse"         ,}
        , React.createElement(FileQuestion, { className: "h-8 w-8" ,} )
      )
      , React.createElement('h1', { className: "text-3xl font-bold tracking-tight mb-2"   ,}, "Page Not Found"  )
      , React.createElement('p', { className: "text-sm text-muted-foreground max-w-md mb-6"   ,}, "Sorry, the page you are looking for does not exist or has been moved to another path."

      )
      , React.createElement(Link, { to: "/dashboard",}
        , React.createElement(Button, { className: "gap-2",}
          , React.createElement(MoveLeft, { className: "h-4 w-4" ,} ), " Back to Dashboard"
        )
      )
    )
  );
};

export default NotFound;
