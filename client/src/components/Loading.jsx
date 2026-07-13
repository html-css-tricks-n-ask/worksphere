import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';







export const Loading = ({
  fullScreen = false,
  message = 'Loading WorkSphere...',
  className,
}) => {
  return (
    React.createElement('div', {
      className: cn(
        "flex flex-col items-center justify-center p-6 text-center transition-all duration-300",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm min-h-screen" : "w-full min-h-[200px]",
        className
      ),}

      , React.createElement('div', { className: "relative flex items-center justify-center mb-4"    ,}
        /* Modern Double Spinner rings */
        , React.createElement('div', { className: "absolute w-12 h-12 rounded-full border-4 border-primary/20"     ,} )
        , React.createElement(Loader2, { className: "h-8 w-8 text-primary animate-spin"   ,} )
      )
      , React.createElement('p', { className: "text-sm font-semibold tracking-tight animate-pulse"   ,}, message)
    )
  );
};

export default Loading;
