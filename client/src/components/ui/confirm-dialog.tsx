import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from './dialog.js';
import { Button } from './button.js';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
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
    <Dialog isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="flex gap-4">
        {variant === 'destructive' && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2 border-t pt-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          size="sm"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
