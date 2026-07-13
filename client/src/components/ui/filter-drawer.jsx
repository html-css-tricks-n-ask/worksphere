import * as React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from './button';









export const FilterDrawer = ({
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
    React.createElement('div', { className: "fixed inset-0 z-50 overflow-hidden"   ,}
      /* Backdrop */
      , React.createElement('div', {
        className: "absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"     ,
        onClick: onClose,}
      )

      , React.createElement('div', { className: "pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"      ,}
        , React.createElement('div', { className: "pointer-events-auto w-screen max-w-sm"  ,}
          , React.createElement('div', { className: "flex h-full flex-col overflow-y-scroll bg-card shadow-2xl border-l animate-in slide-in-from-right duration-300"         ,}
            /* Header */
            , React.createElement('div', { className: "flex items-center justify-between border-b px-6 py-4"     ,}
              , React.createElement('div', { className: "flex items-center gap-2"  ,}
                , React.createElement(Filter, { className: "h-4 w-4 text-primary"  ,} )
                , React.createElement('h2', { className: "text-sm font-bold tracking-tight"  ,}, title)
              )
              , React.createElement('button', {
                onClick: onClose,
                className: "rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"    ,}

                , React.createElement(X, { className: "h-4 w-4" ,} )
              )
            )

            /* Content (Filter Form Fields) */
            , React.createElement('div', { className: "flex-1 px-6 py-6 space-y-5"   ,}, children)

            /* Footer Actions */
            , React.createElement('div', { className: "border-t px-6 py-4 bg-muted/20 flex gap-2 justify-end"      ,}
              , React.createElement(Button, { variant: "outline", size: "sm", className: "gap-1.5 text-xs font-semibold"  , onClick: onClear,}
                , React.createElement(RotateCcw, { className: "h-3 w-3" ,} ), " Reset"
              )
              , React.createElement(Button, { size: "sm", className: "text-xs font-semibold px-5"  , onClick: onClose,}, "Apply"

              )
            )
          )
        )
      )
    )
  );
};

export default FilterDrawer;
