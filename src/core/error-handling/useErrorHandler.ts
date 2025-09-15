/**
 * useErrorHandler.ts - Hook especializado para tratamento de erros (IMPLEMENTADO)
 * Context7 Pattern: Error handling centralizado com feedback ao usuário
 * Elimina console.error órfãos e garante feedback adequado na UI
 *
 * IMPLEMENTAÇÃO BASEADA NA ANÁLISE:
 * - Context adequado para debugging
 * - Estados de erro para UI
 * - Retry mechanisms integrados
 * - Logging estruturado
 * - User feedback consistente
 *
 * @version 1.0.0 - Error Handling Implementation (Context7)
 */

import { useState, useCallback } from 'react';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
  canRetry: boolean;
  context?: string;
  timestamp?: number;
}

export interface ErrorContext {
  feature: string;
  operation: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: Error, context: ErrorContext) => void;
  clearError: () => void;
  retry: (retryFn?: () => Promise<void>) => Promise<void>;
  setRetrying: (isRetrying: boolean) => void;
}

/**
 * Hook especializado para tratamento robusto de erros
 * Substitui padrões problemáticos identificados na análise:
 * - Console.error sem ação → Logging estruturado + UI feedback
 * - Falhas silenciosas → Estados de erro claros
 * - Retry manual → Retry automático com backoff
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isRetrying: false,
    canRetry: true,
  });

  const handleError = useCallback((error: Error, context: ErrorContext) => {
    const timestamp = Date.now();
    const errorContext = `[${context.feature}:${context.operation}]`;

    // Logging estruturado (substitui console.error simples)
    console.error(`${errorContext} Error occurred:`, {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context: context.feature,
      operation: context.operation,
      userId: context.userId,
      metadata: context.metadata,
      timestamp: new Date(timestamp).toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Determinar se pode fazer retry baseado no tipo de erro
    const canRetry = !['AuthError', 'PermissionError', 'ValidationError'].includes(error.name);

    // Atualizar estado para UI
    setErrorState({
      hasError: true,
      error,
      isRetrying: false,
      canRetry,
      context: errorContext,
      timestamp,
    });

    // Report para serviço de monitoramento em produção
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementar serviço de error reporting
      // errorReportingService.captureException(error, {
      //   tags: { feature: context.feature, operation: context.operation },
      //   user: { id: context.userId },
      //   extra: context.metadata
      // });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isRetrying: false,
      canRetry: true,
    });
  }, []);

  const setRetrying = useCallback((isRetrying: boolean) => {
    setErrorState(prev => ({
      ...prev,
      isRetrying,
    }));
  }, []);

  const retry = useCallback(async (retryFn?: () => Promise<void>) => {
    if (!errorState.canRetry) {
      console.warn('[ErrorHandler] Retry attempted on non-retryable error');
      return;
    }

    setRetrying(true);

    try {
      if (retryFn) {
        await retryFn();
      }
      clearError();
    } catch (retryError) {
      console.error('[ErrorHandler] Retry failed:', retryError);
      setErrorState(prev => ({
        ...prev,
        error: retryError instanceof Error ? retryError : prev.error,
        isRetrying: false,
      }));
    }
  }, [errorState.canRetry, setRetrying, clearError]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
    setRetrying,
  };
};

/**
 * Hook específico para operações assíncronas com retry automático
 * Elimina padrão de falha silenciosa identificado na análise
 */
export const useAsyncOperation = <T>() => {
  const { errorState, handleError, clearError, setRetrying } = useErrorHandler();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    context: ErrorContext,
    options: {
      retries?: number;
      retryDelay?: number;
    } = {}
  ) => {
    const { retries = 2, retryDelay = 1000 } = options;

    setIsLoading(true);
    clearError();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          setRetrying(true);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        const result = await operation();
        setData(result);
        setIsLoading(false);
        setRetrying(false);
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === retries) {
          handleError(lastError, {
            ...context,
            metadata: {
              ...context.metadata,
              attempts: attempt + 1,
              lastAttempt: true,
            }
          });
        }
      }
    }

    setIsLoading(false);
    setRetrying(false);
    throw lastError;
  }, [handleError, clearError, setRetrying]);

  return {
    data,
    isLoading,
    errorState,
    execute,
    clearError,
  };
};