/**
 * FormDialog - Componente base para modais de formulário
 * Modal genérico com form, validação e estados de loading
 */

import React from 'react';
import { cn } from '@/core/config/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { X } from 'lucide-react';

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  
  // Form Actions
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  
  // States
  loading?: boolean;
  disabled?: boolean;
  
  // Validation
  hasErrors?: boolean;
  errorMessage?: string;
  
  // Styling
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  
  // Behavior
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4'
};

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  loading = false,
  disabled = false,
  hasErrors = false,
  errorMessage,
  size = 'md',
  className,
  closeOnClickOutside = true,
  showCloseButton = true,
  preventClose = false
}) => {
  const handleOpenChange = (newOpen: boolean) => {
    if (preventClose && !newOpen) return;
    onOpenChange(newOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || disabled) return;
    onSubmit?.();
  };

  const handleCancel = () => {
    if (loading && preventClose) return;
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      modal={closeOnClickOutside}
    >
      <DialogContent 
        className={cn(sizeClasses[size], className)}
        onInteractOutside={(e) => {
          if (!closeOnClickOutside || (preventClose && loading)) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-lg font-semibold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            
            {showCloseButton && !preventClose && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto px-1">
            {children}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading && preventClose}
              className="order-2 sm:order-1"
            >
              {cancelLabel}
            </Button>
            
            <Button
              type="submit"
              disabled={disabled || loading || hasErrors}
              className="order-1 sm:order-2"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};