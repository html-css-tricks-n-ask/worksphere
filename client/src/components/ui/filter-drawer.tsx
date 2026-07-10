import * as React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from './button.js';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
  children: React.ReactNode;
  title?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onClear,
  children,
  title = 'Filters',
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-sm">
          <div className="flex h-full flex-col overflow-y-scroll bg-card shadow-2xl border-l animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold tracking-tight">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content (Filter Form Fields) */}
            <div className="flex-1 px-6 py-6 space-y-5">{children}</div>

            {/* Footer Actions */}
            <div className="border-t px-6 py-4 bg-muted/20 flex gap-2 justify-end">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={onClear}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
              <Button size="sm" className="text-xs font-semibold px-5" onClick={onClose}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
