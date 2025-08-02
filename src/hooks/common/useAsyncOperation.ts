/**
 * Hook genérico para operações assíncronas
 * Padroniza loading, error e success states
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface AsyncOperationConfig {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (result?: any) => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
}

export interface AsyncOperationState {
  isLoading: boolean;
  error: Error | null;
  data: any;
  hasExecuted: boolean;
}

export const useAsyncOperation = <T = any, P extends any[] = any[]>(
  asyncFunction: (...args: P) => Promise<T>,
  config: AsyncOperationConfig = {}
) => {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso!',
    errorMessage = 'Erro ao executar operação',
    onSuccess,
    onError,
    resetOnSuccess = false
  } = config;

  const { toast } = useToast();

  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    data: null,
    hasExecuted: false
  });

  const execute = useCallback(async (...args: P): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      hasExecuted: true
    }));

    try {
      const result = await asyncFunction(...args);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        data: result,
        error: null
      }));

      if (showSuccessToast) {
        toast({
          title: 'Sucesso',
          description: successMessage,
        });
      }

      onSuccess?.(result);

      if (resetOnSuccess) {
        reset();
      }

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj
      }));

      if (showErrorToast) {
        toast({
          title: 'Erro',
          description: errorObj.message || errorMessage,
          variant: 'destructive'
        });
      }

      onError?.(errorObj);
      return null;
    }
  }, [asyncFunction, showSuccessToast, showErrorToast, successMessage, errorMessage, onSuccess, onError, resetOnSuccess, toast]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      hasExecuted: false
    });
  }, []);

  const retry = useCallback((...args: P) => {
    return execute(...args);
  }, [execute]);

  return {
    // Estado atual
    ...state,

    // Estados derivados
    isIdle: !state.hasExecuted,
    isSuccess: state.hasExecuted && !state.isLoading && !state.error,
    isError: !!state.error,

    // Ações
    execute,
    reset,
    retry,

    // Configuração
    config,
  };
};