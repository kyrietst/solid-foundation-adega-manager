/**
 * Hook especializado para tratamento de erros do Dashboard
 * Lida com falhas parciais e recuperação granular
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface DashboardErrorState {
  counts: Error | null;
  sales: Error | null;
  lowStock: Error | null;
  deliveries: Error | null;
  hasAnyError: boolean;
  isPartialFailure: boolean;
}

export interface DashboardErrorConfig {
  showToastOnError?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export const useDashboardErrorHandling = (config: DashboardErrorConfig = {}) => {
  const {
    showToastOnError = true,
    retryAttempts = 2,
    retryDelay = 1000
  } = config;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<DashboardErrorState>({
    counts: null,
    sales: null,
    lowStock: null,
    deliveries: null,
    hasAnyError: false,
    isPartialFailure: false
  });

  const setError = useCallback((section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>, error: Error | null) => {
    setErrorState(prev => {
      const newState = { ...prev, [section]: error };
      const errors = [newState.counts, newState.sales, newState.lowStock, newState.deliveries];
      const errorCount = errors.filter(err => err !== null).length;
      
      return {
        ...newState,
        hasAnyError: errorCount > 0,
        isPartialFailure: errorCount > 0 && errorCount < 4
      };
    });
  }, []);

  const clearError = useCallback((section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>) => {
    setError(section, null);
  }, [setError]);

  const clearAllErrors = useCallback(() => {
    setErrorState({
      counts: null,
      sales: null,
      lowStock: null,
      deliveries: null,
      hasAnyError: false,
      isPartialFailure: false
    });
  }, []);

  const handleError = useCallback((section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>, error: Error, context?: string) => {
    console.error(`Erro na seção ${section} do dashboard:`, error);
    
    setError(section, error);

    if (showToastOnError) {
      const sectionNames = {
        counts: 'Contadores',
        sales: 'Vendas',
        lowStock: 'Estoque Baixo',
        deliveries: 'Entregas'
      };

      toast({
        title: `Erro em ${sectionNames[section]}`,
        description: `Não foi possível carregar ${sectionNames[section].toLowerCase()}. ${context || 'Tentando novamente...'}`,
        variant: 'destructive',
      });
    }
  }, [setError, showToastOnError, toast]);

  const withErrorHandling = useCallback(<T>(
    section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>,
    operation: () => Promise<T>,
    context?: string
  ) => {
    return async (): Promise<T | null> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retryAttempts; attempt++) {
        try {
          const result = await operation();
          
          // Sucesso - limpar erro se existia
          clearError(section);
          
          if (attempt > 0) {
            if (showToastOnError) {
              toast({
                title: 'Recuperado',
                description: `Dados de ${section} carregados com sucesso.`,
                variant: 'default',
              });
            }
          }
          
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt < retryAttempts) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          }
        }
      }

      // Todas as tentativas falharam
      if (lastError) {
        handleError(section, lastError, context);
      }

      return null;
    };
  }, [retryAttempts, retryDelay, clearError, handleError, showToastOnError, toast]);

  const executeWithSettled = useCallback(async <T>(
    operations: Array<{
      section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>;
      operation: () => Promise<T>;
      context?: string;
    }>
  ): Promise<{ [K in keyof T]: T[K] | null }> => {
    const results = await Promise.allSettled(
      operations.map(({ section, operation, context }) => 
        withErrorHandling(section, operation, context)()
      )
    );

    const processedResults: any = {};
    
    results.forEach((result, index) => {
      const { section } = operations[index];
      
      if (result.status === 'fulfilled') {
        processedResults[section] = result.value;
      } else {
        processedResults[section] = null;
        console.error(`Falha definitiva na seção ${section}:`, result.reason);
      }
    });

    return processedResults;
  }, [withErrorHandling]);

  const getErrorMessage = useCallback((section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>): string => {
    const error = errorState[section];
    if (!error) return '';

    // Mensagens personalizadas baseadas no tipo de erro
    if (error.message.includes('PGRST')) {
      return 'Erro na consulta ao banco de dados. Tente novamente.';
    } else if (error.message.includes('network')) {
      return 'Erro de conexão. Verifique sua internet.';
    } else if (error.message.includes('timeout')) {
      return 'Timeout na consulta. Tente novamente.';
    } else {
      return 'Erro inesperado. Tente novamente.';
    }
  }, [errorState]);

  const getSectionStatus = useCallback((section: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>) => {
    return {
      hasError: errorState[section] !== null,
      error: errorState[section],
      errorMessage: getErrorMessage(section)
    };
  }, [errorState, getErrorMessage]);

  const getRecoveryActions = useCallback(() => {
    const actions = [];

    if (errorState.counts) {
      actions.push({
        section: 'counts' as const,
        label: 'Recarregar Contadores',
        description: 'Tentar carregar contadores novamente'
      });
    }

    if (errorState.sales) {
      actions.push({
        section: 'sales' as const,
        label: 'Recarregar Vendas',
        description: 'Tentar carregar dados de vendas'
      });
    }

    if (errorState.lowStock) {
      actions.push({
        section: 'lowStock' as const,
        label: 'Recarregar Estoque',
        description: 'Tentar carregar dados de estoque baixo'
      });
    }

    if (errorState.deliveries) {
      actions.push({
        section: 'deliveries' as const,
        label: 'Recarregar Entregas',
        description: 'Tentar carregar dados de entregas'
      });
    }

    return actions;
  }, [errorState]);

  return {
    // Estado atual
    errorState,
    
    // Ações principais
    handleError,
    clearError,
    clearAllErrors,
    withErrorHandling,
    executeWithSettled,

    // Utilitários
    getSectionStatus,
    getErrorMessage,
    getRecoveryActions,

    // Configuração
    config: {
      showToastOnError,
      retryAttempts,
      retryDelay
    }
  };
};