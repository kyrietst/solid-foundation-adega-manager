/**
 * Hook padronizado para tratamento de erros
 * Centraliza lógica de error handling com toast notifications e retry
 */

import { useCallback } from 'react';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface ErrorConfig {
  showToast?: boolean;
  toastTitle?: string;
  toastDescription?: string;
  logError?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

export interface ErrorContext {
  operation: string;
  data?: any;
  retryCount?: number;
}

export interface ErrorHandlerReturn {
  handleError: (error: unknown, context?: ErrorContext) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    config?: ErrorConfig
  ) => Promise<T | null>;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => R | Promise<R>,
    context?: ErrorContext,
    config?: ErrorConfig
  ) => (...args: T) => Promise<R | null>;
}

const DEFAULT_CONFIG: Required<ErrorConfig> = {
  showToast: true,
  toastTitle: 'Erro',
  toastDescription: 'Ocorreu um erro inesperado. Tente novamente.',
  logError: true,
  retryable: false,
  maxRetries: 3,
};

/**
 * Hook para tratamento padronizado de erros
 * @param defaultConfig - Configuração padrão para todos os erros
 */
export const useErrorHandler = (defaultConfig?: Partial<ErrorConfig>): ErrorHandlerReturn => {
  const { toast } = useToast();
  const config = { ...DEFAULT_CONFIG, ...defaultConfig };

  // Função para extrair mensagem de erro
  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    return 'Erro desconhecido';
  }, []);

  // Função para categorizar erro
  const categorizeError = useCallback((error: unknown) => {
    const message = getErrorMessage(error);
    
    if (message.includes('network') || message.includes('fetch')) {
      return { type: 'network', userMessage: 'Problema de conexão. Verifique sua internet.' };
    }
    if (message.includes('timeout')) {
      return { type: 'timeout', userMessage: 'Operação demorou muito. Tente novamente.' };
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return { type: 'auth', userMessage: 'Sessão expirada. Faça login novamente.' };
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return { type: 'permission', userMessage: 'Você não tem permissão para esta operação.' };
    }
    if (message.includes('not found') || message.includes('404')) {
      return { type: 'notFound', userMessage: 'Recurso não encontrado.' };
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return { type: 'validation', userMessage: 'Dados inválidos. Verifique as informações.' };
    }
    
    return { type: 'unknown', userMessage: message };
  }, [getErrorMessage]);

  // Handler principal de erro
  const handleError = useCallback((error: unknown, context?: ErrorContext, customConfig?: ErrorConfig) => {
    const finalConfig = { ...config, ...customConfig };
    const errorCategory = categorizeError(error);
    
    // Log do erro (desenvolvimento/debug)
    if (finalConfig.logError) {
      console.error('Error Handler:', {
        error,
        context,
        category: errorCategory.type,
        timestamp: new Date().toISOString()
      });
    }

    // Mostrar toast se habilitado
    if (finalConfig.showToast) {
      const title = finalConfig.toastTitle || 'Erro';
      const description = errorCategory.userMessage || finalConfig.toastDescription;
      
      toast({
        title,
        description,
        variant: 'destructive',
      });
    }

    // Aqui poderia integrar com serviços de monitoramento como Sentry
    // if (errorCategory.type !== 'validation') {
    //   Sentry.captureException(error, { contexts: { operation: context } });
    // }
  }, [config, categorizeError, toast]);

  // Wrapper para funções assíncronas com error handling
  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext,
    customConfig?: ErrorConfig
  ): Promise<T | null> => {
    const finalConfig = { ...config, ...customConfig };
    let retryCount = 0;

    while (retryCount <= (finalConfig.maxRetries || 0)) {
      try {
        return await asyncFn();
      } catch (error) {
        retryCount++;
        
        if (retryCount > (finalConfig.maxRetries || 0) || !finalConfig.retryable) {
          handleError(error, { ...context, retryCount }, finalConfig);
          return null;
        }
        
        // Delay exponencial entre tentativas
        if (retryCount <= (finalConfig.maxRetries || 0)) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }
    }
    
    return null;
  }, [config, handleError]);

  // Higher-order function para wrappear qualquer função com error handling
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => R | Promise<R>,
    context?: ErrorContext,
    customConfig?: ErrorConfig
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        handleError(error, context, customConfig);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError: (error: unknown, context?: ErrorContext) => handleError(error, context),
    handleAsyncError,
    withErrorHandling,
  };
};

// Hook especializado para operações de banco de dados
export const useDatabaseErrorHandler = () => {
  return useErrorHandler({
    showToast: true,
    toastTitle: 'Erro de Banco de Dados',
    logError: true,
    retryable: true,
    maxRetries: 2,
  });
};

// Hook especializado para operações de API
export const useApiErrorHandler = () => {
  return useErrorHandler({
    showToast: true,
    toastTitle: 'Erro de Conexão',
    logError: true,
    retryable: true,
    maxRetries: 3,
  });
};

// Hook especializado para validação
export const useValidationErrorHandler = () => {
  return useErrorHandler({
    showToast: true,
    toastTitle: 'Dados Inválidos',
    logError: false,
    retryable: false,
  });
};