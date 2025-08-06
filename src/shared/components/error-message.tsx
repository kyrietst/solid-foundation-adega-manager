/**
 * Componente padronizado para exibir mensagens de erro
 * Usa o sistema centralizado de mensagens
 */

import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/primitives/alert';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { cn } from '@/core/config/utils';
import { 
  ErrorMessage as ErrorMessageType, 
  getErrorColor, 
  shouldShowTechnicalDetails 
} from '@/lib/error-messages';

interface ErrorMessageProps {
  error: ErrorMessageType;
  technicalError?: Error;
  context?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  showTechnicalDetails?: boolean;
  variant?: 'default' | 'destructive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  technicalError,
  context,
  onRetry,
  onDismiss,
  retryText = 'Tentar Novamente',
  dismissText = 'Dispensar',
  showTechnicalDetails,
  variant,
  size = 'md',
  className
}) => {
  const errorColor = getErrorColor(error.severity);
  const shouldShowDetails = showTechnicalDetails ?? shouldShowTechnicalDetails(error.severity);

  // Determinar variante baseada na severidade se não especificada
  const alertVariant = variant || (
    error.severity === 'critical' || error.severity === 'high' ? 'destructive' : 
    error.severity === 'medium' ? 'warning' : 
    'default'
  );

  // Ícone baseado na severidade
  const getIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <Alert variant={alertVariant} className={cn(sizeClasses[size], className)}>
      {getIcon()}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <AlertTitle className="flex items-center gap-2">
            {error.title}
            <Badge 
              variant={error.severity === 'critical' || error.severity === 'high' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {error.severity}
            </Badge>
          </AlertTitle>
        </div>
        
        <AlertDescription className="space-y-3">
          <p>{error.description}</p>
          
          {error.action && (
            <p className="text-sm font-medium">
              💡 <strong>Ação recomendada:</strong> {error.action}
            </p>
          )}

          {context && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Contexto:</strong> {context}
            </p>
          )}

          {/* Ações disponíveis */}
          {(onRetry || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {retryText}
                </Button>
              )}
              {onDismiss && (
                <Button size="sm" variant="ghost" onClick={onDismiss}>
                  {dismissText}
                </Button>
              )}
            </div>
          )}

          {/* Detalhes técnicos */}
          {shouldShowDetails && technicalError && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer font-medium mb-2">
                Detalhes Técnicos
              </summary>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded border space-y-2">
                <div>
                  <strong>Erro:</strong> {technicalError.name}
                </div>
                <div>
                  <strong>Mensagem:</strong> {technicalError.message}
                </div>
                {technicalError.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                      {technicalError.stack}
                    </pre>
                  </div>
                )}
                <div>
                  <strong>Timestamp:</strong> {new Date().toLocaleString()}
                </div>
                <div>
                  <strong>URL:</strong> {window.location.href}
                </div>
                <div>
                  <strong>User Agent:</strong> {navigator.userAgent}
                </div>
              </div>
            </details>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
};

// Componente para lista de erros múltiplos
interface ErrorListProps {
  errors: Array<{
    error: ErrorMessageType;
    technicalError?: Error;
    context?: string;
  }>;
  onRetryAll?: () => void;
  onDismissAll?: () => void;
  maxVisible?: number;
  className?: string;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  onRetryAll,
  onDismissAll,
  maxVisible = 5,
  className
}) => {
  const visibleErrors = errors.slice(0, maxVisible);
  const hiddenCount = errors.length - maxVisible;

  if (errors.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header com resumo */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-red-700 dark:text-red-300">
          {errors.length} Erro{errors.length !== 1 ? 's' : ''} Detectado{errors.length !== 1 ? 's' : ''}
        </h3>
        {(onRetryAll || onDismissAll) && (
          <div className="flex gap-2">
            {onRetryAll && (
              <Button size="sm" variant="outline" onClick={onRetryAll}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar Todos
              </Button>
            )}
            {onDismissAll && (
              <Button size="sm" variant="ghost" onClick={onDismissAll}>
                Dispensar Todos
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Lista de erros */}
      <div className="space-y-2">
        {visibleErrors.map((errorItem, index) => (
          <ErrorMessage
            key={index}
            error={errorItem.error}
            technicalError={errorItem.technicalError}
            context={errorItem.context}
            size="sm"
          />
        ))}
        
        {hiddenCount > 0 && (
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertDescription>
              ... e mais {hiddenCount} erro{hiddenCount !== 1 ? 's' : ''} não exibido{hiddenCount !== 1 ? 's' : ''}.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

// Componente compacto para erros inline
interface InlineErrorProps {
  error: ErrorMessageType;
  technicalError?: Error;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  technicalError,
  className
}) => {
  return (
    <div className={cn(
      'flex items-center space-x-2 text-sm text-red-600 dark:text-red-400',
      className
    )}>
      <XCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error.description}</span>
      {shouldShowTechnicalDetails(error.severity) && technicalError && (
        <span className="text-xs text-gray-500">
          ({technicalError.message})
        </span>
      )}
    </div>
  );
};

// Hook para usar mensagens de erro padronizadas
export const useErrorMessage = () => {
  return {
    ErrorMessage,
    ErrorList,
    InlineError
  };
};