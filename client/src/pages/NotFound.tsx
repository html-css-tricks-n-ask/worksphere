import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, MoveLeft } from 'lucide-react';
import { Button } from '../components/ui/button.js';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6 animate-pulse">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Sorry, the page you are looking for does not exist or has been moved to another path.
      </p>
      <Link to="/dashboard">
        <Button className="gap-2">
          <MoveLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
