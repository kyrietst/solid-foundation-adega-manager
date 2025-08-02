/**
 * Componentes de loading específicos para formulários
 * Estados visuais durante submissão e processamento
 */

import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormLoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  successText?: string;
  showSuccess?: boolean;
  timeoutWarning?: boolean;
  children: React.ReactNode;
}

export const FormLoadingButton: React.FC<FormLoadingButtonProps> = ({
  isLoading = false,
  loadingText = 'Processando...',
  successText = 'Concluído!',
  showSuccess = false,
  timeoutWarning = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const getButtonContent = () => {
    if (showSuccess) {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          {successText}
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      );
    }

    if (timeoutWarning) {
      return (
        <>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Timeout - Tentar Novamente
        </>
      );
    }

    return children;
  };

  const getButtonVariant = () => {
    if (showSuccess) return 'default';
    if (timeoutWarning) return 'destructive';
    return 'default';
  };

  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        className,
        showSuccess && 'bg-green-600 hover:bg-green-700',
        timeoutWarning && 'bg-red-600 hover:bg-red-700'
      )}
    >
      {getButtonContent()}
    </Button>
  );
};

interface FormLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  onCancel?: () => void;
  cancelText?: string;
}

export const FormLoadingOverlay: React.FC<FormLoadingOverlayProps> = ({
  isVisible,
  message = 'Processando...',
  showProgress = false,
  progress = 0,
  onCancel,
  cancelText = 'Cancelar'
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          
          <div className="text-center">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {message}
            </p>
            {showProgress && (
              <div className="mt-3 w-full">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(progress)}% concluído
                </p>
              </div>
            )}
          </div>

          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface FormStatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'timeout';
  message?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const FormStatusIndicator: React.FC<FormStatusIndicatorProps> = ({
  status,
  message,
  showIcon = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className={cn(iconSizes[size], 'animate-spin text-blue-600')} />,
          text: message || 'Processando...',
          className: 'text-blue-600'
        };
      case 'success':
        return {
          icon: <CheckCircle className={cn(iconSizes[size], 'text-green-600')} />,
          text: message || 'Concluído com sucesso!',
          className: 'text-green-600'
        };
      case 'error':
        return {
          icon: <XCircle className={cn(iconSizes[size], 'text-red-600')} />,
          text: message || 'Erro na operação',
          className: 'text-red-600'
        };
      case 'timeout':
        return {
          icon: <Clock className={cn(iconSizes[size], 'text-yellow-600')} />,
          text: message || 'Operação atingiu timeout',
          className: 'text-yellow-600'
        };
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();
  if (!statusContent) return null;

  return (
    <div className={cn(
      'flex items-center space-x-2',
      sizeClasses[size],
      statusContent.className
    )}>
      {showIcon && statusContent.icon}
      <span>{statusContent.text}</span>
    </div>
  );
};

interface FormProgressBarProps {
  isVisible: boolean;
  progress: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const FormProgressBar: React.FC<FormProgressBarProps> = ({
  isVisible,
  progress,
  label,
  showPercentage = true,
  variant = 'default'
}) => {
  if (!isVisible) return null;

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <Progress 
        value={progress} 
        className={cn(
          'w-full h-2',
          '[&>div]:transition-all',
          `[&>div]:${variantClasses[variant]}`
        )}
      />
    </div>
  );
};

interface UnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  saveText?: string;
  discardText?: string;
  message?: string;
}

export const UnsavedChangesWarning: React.FC<UnsavedChangesWarningProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard,
  saveText = 'Salvar',
  discardText = 'Descartar',
  message = 'Você tem alterações não salvas.'
}) => {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {message}
          </p>
          <div className="mt-3 flex space-x-2">
            {onSave && (
              <Button size="sm" variant="outline" onClick={onSave}>
                {saveText}
              </Button>
            )}
            {onDiscard && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDiscard}
                className="text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              >
                {discardText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};