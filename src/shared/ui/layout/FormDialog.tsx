/**
 * FormDialog - Componente base para modais de formulário
 * Modal genérico com form, validação, estados de loading e glass morphism
 * Enhanced for Story 2.3: Glass morphism + Black/Gold theme
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getGlassInputClasses } from '@/core/config/theme-utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  
  // Behavior
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
  preventClose?: boolean;
  
  // Trigger
  trigger?: React.ReactNode;
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
  variant = 'premium',
  glassEffect = true,
  closeOnClickOutside = true,
  showCloseButton = true,
  preventClose = false,
  trigger
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

  // Glass morphism classes
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';
  const dialogClasses = cn(
    sizeClasses[size], 
    glassEffect && 'backdrop-blur-xl bg-gray-900/90 shadow-2xl',
    className
  );

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: -20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
      modal={closeOnClickOutside}
    >
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <AnimatePresence mode="wait">
        {open && (
          <DialogContent
            className={cn("bg-black/95 backdrop-blur-sm border border-white/10", dialogClasses)}
            onInteractOutside={(e) => {
              if (!closeOnClickOutside || (preventClose && loading)) {
                e.preventDefault();
              }
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl font-bold text-white">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-gray-400">
                  {description}
                </DialogDescription>
              )}
            </div>
            
          </div>
        </DialogHeader>

        {/* Error Message */}
        {errorMessage && (
          <div className="rounded-md p-3 border bg-red-500/10 border-red-500/30 backdrop-blur-sm">
            <p className="text-sm font-medium text-red-400">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-[60vh] overflow-y-auto px-1">
            {children}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-gray-700/30 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading && preventClose}
              className="order-2 sm:order-1 border-gray-600/50 text-gray-300 hover:text-white hover:border-gray-500"
            >
              {cancelLabel}
            </Button>
            
            <Button
              type="submit"
              disabled={disabled || loading || hasErrors}
              className="order-1 sm:order-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};