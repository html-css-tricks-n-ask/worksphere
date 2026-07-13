import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from './dialog';
import { Button } from './button';












export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}) => {
  return (
    React.createElement(Dialog, { isOpen: isOpen, onClose: onClose, title: title, className: "max-w-md",}
      , React.createElement('div', { className: "flex gap-4" ,}
        , variant === 'destructive' && (
          React.createElement('div', { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"        ,}
            , React.createElement(AlertTriangle, { className: "h-5 w-5" ,} )
          )
        )
        , React.createElement('div', { className: "space-y-2",}
          , React.createElement('p', { className: "text-sm text-muted-foreground" ,}, message)
        )
      )
      , React.createElement('div', { className: "mt-6 flex justify-end gap-2 border-t pt-3"     ,}
        , React.createElement(Button, { variant: "ghost", size: "sm", onClick: onClose,}
          , cancelText
        )
        , React.createElement(Button, {
          variant: variant === 'destructive' ? 'destructive' : 'default',
          size: "sm",
          onClick: () => {
            onConfirm();
            onClose();
          },}

          , confirmText
        )
      )
    )
  );
};

export default ConfirmDialog;
