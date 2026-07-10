import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn.js';

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = false,
  message = 'Loading WorkSphere...',
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center transition-all duration-300",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm min-h-screen" : "w-full min-h-[200px]",
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        {/* Modern Double Spinner rings */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-primary/20" />
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <p className="text-sm font-semibold tracking-tight animate-pulse">{message}</p>
    </div>
  );
};

export default Loading;
