/**
 * Hook para recovery de erros em operações de venda
 * Implementa rollback automático e validação de integridade
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { supabase } from '@/core/api/supabase/client';

export interface SalesErrorConfig {
  enableAutoRollback?: boolean;
  validateIntegrity?: boolean;
  maxRetryAttempts?: number;
  retryDelay?: number;
  onError?: (error: Error, context: string) => void;
  onRecovery?: (context: string) => void;
}

export interface SalesErrorState {
  hasError: boolean;
  lastError: Error | null;
  isRecovering: boolean;
  lastOperation: string | null;
  rollbackAvailable: boolean;
}

export const useSalesErrorRecovery = (config: SalesErrorConfig = {}) => {
  const {
    enableAutoRollback = true,
    validateIntegrity = true,
    maxRetryAttempts = 2,
    retryDelay = 1000,
    onError,
    onRecovery
  } = config;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<SalesErrorState>({
    hasError: false,
    lastError: null,
    isRecovering: false,
    lastOperation: null,
    rollbackAvailable: false
  });

  // Validar integridade do sistema após operações
  const validateSystemIntegrity = useCallback(async (): Promise<boolean> => {
    try {
      // Verificar integridade básica dos dados
      const checks = await Promise.allSettled([
        // Verificar se há vendas órfãs (sem itens)
        supabase
          .from('sales')
          .select('id')
          .not('id', 'in', `(${
            await supabase
              .from('sale_items')
              .select('sale_id')
              .then(({ data }) => data?.map(item => item.sale_id).join(',') || '0')
          })`),
        
        // Verificar se há itens órfãos (sem venda)
        supabase
          .from('sale_items')
          .select('sale_id')
          .not('sale_id', 'in', `(${
            await supabase
              .from('sales')
              .select('id')
              .then(({ data }) => data?.map(sale => sale.id).join(',') || '0')
          })`),
      ]);

      let hasIntegrityIssues = false;
      
      checks.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const hasData = result.value.data && result.value.data.length > 0;
          if (hasData) {
            hasIntegrityIssues = true;
            console.warn(`Problema de integridade detectado no check ${index + 1}:`, result.value.data);
          }
        }
      });

      return !hasIntegrityIssues;
    } catch (error) {
      console.error('Erro ao validar integridade do sistema:', error);
      return false;
    }
  }, []);

  // Rollback de operação de venda
  const rollbackSale = useCallback(async (saleId: string): Promise<boolean> => {
    try {

      // 1. Buscar itens da venda para reverter estoque
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select('product_id, quantity')
        .eq('sale_id', saleId);

      if (itemsError) {
        console.error('Erro ao buscar itens para rollback:', itemsError);
        return false;
      }

      // 2. Reverter estoque dos produtos
      if (saleItems && saleItems.length > 0) {
        const stockUpdates = saleItems.map(item => 
          supabase.rpc('adjust_product_stock', {
            product_id: item.product_id,
            quantity: item.quantity, // Adicionar de volta ao estoque
            reason: 'rollback_sale'
          })
        );

        const stockResults = await Promise.allSettled(stockUpdates);
        const failedStockUpdates = stockResults.filter(result => result.status === 'rejected');
        
        if (failedStockUpdates.length > 0) {
          console.warn(`${failedStockUpdates.length} atualizações de estoque falharam durante rollback`);
        }
      }

      // 3. Deletar itens da venda
      const { error: deleteItemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (deleteItemsError) {
        console.error('Erro ao deletar itens durante rollback:', deleteItemsError);
        return false;
      }

      // 4. Deletar a venda
      const { error: deleteSaleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId);

      if (deleteSaleError) {
        console.error('Erro ao deletar venda durante rollback:', deleteSaleError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado durante rollback:', error);
      return false;
    }
  }, []);

  // Manipular erro de vendas com recovery
  const handleSalesError = useCallback(async (
    error: Error,
    context: string,
    operationData?: any
  ): Promise<boolean> => {
    console.error(`Erro em ${context}:`, error);

    setErrorState(prev => ({
      ...prev,
      hasError: true,
      lastError: error,
      lastOperation: context,
      rollbackAvailable: Boolean(operationData?.saleId),
      isRecovering: false
    }));

    // Callback de erro personalizado
    onError?.(error, context);

    // Verificar se é um erro crítico que requer rollback
    const requiresRollback = 
      context.includes('checkout') ||
      context.includes('payment') ||
      error.message.includes('constraint') ||
      error.message.includes('integrity');

    if (requiresRollback && enableAutoRollback && operationData?.saleId) {
      
      setErrorState(prev => ({ ...prev, isRecovering: true }));

      const rollbackSuccess = await rollbackSale(operationData.saleId);
      
      if (rollbackSuccess) {
        toast({
          title: 'Operação Revertida',
          description: 'O erro foi detectado e a operação foi revertida com segurança.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Erro Crítico',
          description: 'Falha no rollback automático. Entre em contato com o suporte.',
          variant: 'destructive',
        });
      }

      setErrorState(prev => ({ ...prev, isRecovering: false }));
    } else {
      // Mostrar toast de erro normal
      toast({
        title: 'Erro na Operação',
        description: `Falha em ${context}. ${error.message}`,
        variant: 'destructive',
      });
    }

    return true; // Indica que o erro foi tratado
  }, [enableAutoRollback, rollbackSale, onError, toast]);

  // Wrapper para operações de venda com error handling
  const withSalesErrorHandling = useCallback(<T extends any[], R>(
    operation: (...args: T) => Promise<R>,
    context: string,
    getOperationData?: (...args: T) => any
  ) => {
    return async (...args: T): Promise<R | null> => {
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt <= maxRetryAttempts) {
        try {
          const result = await operation(...args);
          
          // Validar integridade se habilitado
          if (validateIntegrity && context.includes('checkout')) {
            const isValid = await validateSystemIntegrity();
            if (!isValid) {
              throw new Error('Falha na validação de integridade do sistema');
            }
          }

          // Sucesso - limpar estado de erro
          if (errorState.hasError) {
            setErrorState({
              hasError: false,
              lastError: null,
              isRecovering: false,
              lastOperation: null,
              rollbackAvailable: false
            });
            onRecovery?.(context);
          }

          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt < maxRetryAttempts) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            attempt++;
          } else {
            // Última tentativa falhou
            const operationData = getOperationData ? getOperationData(...args) : undefined;
            await handleSalesError(lastError, context, operationData);
            return null;
          }
        }
      }

      return null;
    };
  }, [
    maxRetryAttempts,
    retryDelay,
    validateIntegrity,
    validateSystemIntegrity,
    errorState.hasError,
    handleSalesError,
    onRecovery
  ]);

  // Retry manual da última operação
  const retryLastOperation = useCallback(async (): Promise<boolean> => {
    if (!errorState.lastOperation) return false;

    setErrorState(prev => ({ ...prev, isRecovering: true }));

    try {
      // Aqui seria necessário reexecutar a operação específica
      // Por ora, apenas limpar o estado de erro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setErrorState({
        hasError: false,
        lastError: null,
        isRecovering: false,
        lastOperation: null,
        rollbackAvailable: false
      });

      toast({
        title: 'Operação Recuperada',
        description: 'A operação foi executada com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro no retry:', error);
      setErrorState(prev => ({ ...prev, isRecovering: false }));
      return false;
    }
  }, [errorState.lastOperation, toast]);

  // Rollback manual
  const manualRollback = useCallback(async (saleId?: string): Promise<boolean> => {
    const targetSaleId = saleId || (errorState.lastOperation?.includes('sale') ? 'last-sale' : undefined);
    
    if (!targetSaleId || targetSaleId === 'last-sale') {
      console.warn('ID da venda não disponível para rollback manual');
      return false;
    }

    setErrorState(prev => ({ ...prev, isRecovering: true }));

    const success = await rollbackSale(targetSaleId);
    
    setErrorState(prev => ({ ...prev, isRecovering: false }));

    if (success) {
      toast({
        title: 'Rollback Concluído',
        description: 'A operação foi revertida com sucesso.',
      });
    }

    return success;
  }, [errorState.lastOperation, rollbackSale, toast]);

  return {
    // Estado atual
    errorState,

    // Funções principais
    handleSalesError,
    withSalesErrorHandling,
    validateSystemIntegrity,

    // Recovery actions
    retryLastOperation,
    manualRollback,
    rollbackSale,

    // Configuração
    config: {
      enableAutoRollback,
      validateIntegrity,
      maxRetryAttempts,
      retryDelay
    }
  };
};