/**
 * Hook especializado para tratamento de erros de estoque
 * Lida com falhas em operações de inventário e movimentações
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface InventoryErrorConfig {
  showToast?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  validateStock?: boolean;
  onError?: (error: Error, context: string) => void;
  onRecovery?: (context: string) => void;
}

export interface InventoryErrorState {
  hasError: boolean;
  errorsByOperation: Record<string, Error[]>;
  isRecovering: boolean;
  lastFailedOperation: string | null;
  stockValidationErrors: string[];
}

export const useInventoryErrorHandler = (config: InventoryErrorConfig = {}) => {
  const {
    showToast = true,
    retryAttempts = 2,
    retryDelay = 1000,
    validateStock = true,
    onError,
    onRecovery
  } = config;

  const { toast } = useToast();
  const [errorState, setErrorState] = useState<InventoryErrorState>({
    hasError: false,
    errorsByOperation: {},
    isRecovering: false,
    lastFailedOperation: null,
    stockValidationErrors: []
  });

  // Validar integridade do estoque
  const validateStockIntegrity = useCallback(async (): Promise<{
    isValid: boolean;
    errors: string[];
  }> => {
    try {
      const errors: string[] = [];

      // 1. Verificar produtos com estoque negativo
      const { data: negativeStock, error: negativeError } = await supabase
        .from('products')
        .select('id, name, stock')
        .lt('stock', 0);

      if (negativeError) {
        errors.push(`Erro ao verificar estoque negativo: ${negativeError.message}`);
      } else if (negativeStock && negativeStock.length > 0) {
        errors.push(`${negativeStock.length} produto(s) com estoque negativo detectado(s)`);
      }

      // 2. Verificar movimentos órfãos (produto não existe)
      const { data: orphanMovements, error: orphanError } = await supabase
        .from('inventory_movements')
        .select('id, product_id')
        .not('product_id', 'in', `(${
          await supabase
            .from('products')
            .select('id')
            .then(({ data }) => data?.map(p => p.id).join(',') || '0')
        })`);

      if (orphanError) {
        errors.push(`Erro ao verificar movimentos órfãos: ${orphanError.message}`);
      } else if (orphanMovements && orphanMovements.length > 0) {
        errors.push(`${orphanMovements.length} movimento(s) órfão(s) detectado(s)`);
      }

      // 3. Verificar inconsistências entre estoque calculado e atual
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          stock,
          inventory_movements (
            movement_type,
            quantity
          )
        `);

      if (productsError) {
        errors.push(`Erro ao verificar consistência de estoque: ${productsError.message}`);
      } else if (products) {
        products.forEach(product => {
          const movements = product.inventory_movements || [];
          let calculatedStock = 0;

          movements.forEach((movement: any) => {
            if (movement.movement_type === 'in' || movement.movement_type === 'devolucao') {
              calculatedStock += movement.quantity;
            } else if (movement.movement_type === 'out' || movement.movement_type === 'fiado') {
              calculatedStock -= movement.quantity;
            }
          });

          const difference = Math.abs(calculatedStock - product.stock);
          if (difference > 0.001) { // Tolerância para arredondamentos
            errors.push(`Inconsistência no produto ${product.name}: estoque atual ${product.stock}, calculado ${calculatedStock}`);
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        isValid: false,
        errors: [`Erro inesperado na validação: ${errorMessage}`]
      };
    }
  }, []);

  // Corrigir estoque automaticamente quando possível
  const autoCorrectStock = useCallback(async (productId: string): Promise<boolean> => {
    try {
      console.log(`Tentando correção automática de estoque para produto ${productId}...`);

      // Recalcular estoque baseado nos movimentos
      const { data: movements, error: movementsError } = await supabase
        .from('inventory_movements')
        .select('movement_type, quantity')
        .eq('product_id', productId)
        .order('created_at', { ascending: true });

      if (movementsError) {
        console.error('Erro ao buscar movimentos para correção:', movementsError);
        return false;
      }

      let calculatedStock = 0;
      movements?.forEach(movement => {
        if (movement.movement_type === 'in' || movement.movement_type === 'devolucao') {
          calculatedStock += movement.quantity;
        } else if (movement.movement_type === 'out' || movement.movement_type === 'fiado') {
          calculatedStock -= movement.quantity;
        }
      });

      // Atualizar estoque com valor calculado
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: calculatedStock })
        .eq('id', productId);

      if (updateError) {
        console.error('Erro ao atualizar estoque corrigido:', updateError);
        return false;
      }

      console.log(`Estoque do produto ${productId} corrigido para ${calculatedStock}`);
      return true;
    } catch (error) {
      console.error('Erro na correção automática de estoque:', error);
      return false;
    }
  }, []);

  // Adicionar erro ao estado
  const addError = useCallback((operation: string, error: Error) => {
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      lastFailedOperation: operation,
      errorsByOperation: {
        ...prev.errorsByOperation,
        [operation]: [...(prev.errorsByOperation[operation] || []), error]
      }
    }));
  }, []);

  // Limpar erros de uma operação
  const clearErrors = useCallback((operation?: string) => {
    if (operation) {
      setErrorState(prev => {
        const newErrors = { ...prev.errorsByOperation };
        delete newErrors[operation];
        return {
          ...prev,
          errorsByOperation: newErrors,
          hasError: Object.keys(newErrors).length > 0
        };
      });
    } else {
      setErrorState({
        hasError: false,
        errorsByOperation: {},
        isRecovering: false,
        lastFailedOperation: null,
        stockValidationErrors: []
      });
    }
  }, []);

  // Manipular erro de inventário
  const handleInventoryError = useCallback(async (
    error: Error,
    operation: string,
    context?: string
  ): Promise<boolean> => {
    console.error(`Erro de inventário em ${operation}:`, error);

    addError(operation, error);
    
    // Callback personalizado
    onError?.(error, `${operation}${context ? ` - ${context}` : ''}`);

    // Verificar se precisa de validação de estoque
    if (validateStock && (
      operation.includes('movement') ||
      operation.includes('stock') ||
      operation.includes('product')
    )) {
      const validation = await validateStockIntegrity();
      
      setErrorState(prev => ({
        ...prev,
        stockValidationErrors: validation.errors
      }));

      if (!validation.isValid) {
        console.warn('Problemas de integridade detectados:', validation.errors);
      }
    }

    // Mostrar toast se habilitado
    if (showToast) {
      const operationNames: Record<string, string> = {
        'product_create': 'criar produto',
        'product_update': 'atualizar produto',
        'product_delete': 'excluir produto',
        'stock_movement': 'movimentar estoque',
        'stock_adjustment': 'ajustar estoque',
        'low_stock_check': 'verificar estoque baixo'
      };

      const operationName = operationNames[operation] || operation;
      
      toast({
        title: 'Erro no Estoque',
        description: `Falha ao ${operationName}. ${error.message}`,
        variant: 'destructive',
      });
    }

    return true;
  }, [addError, onError, validateStock, validateStockIntegrity, showToast, toast]);

  // Wrapper para operações de inventário com error handling
  const withInventoryErrorHandling = useCallback(<T extends any[], R>(
    operation: (...args: T) => Promise<R>,
    operationName: string,
    context?: string
  ) => {
    return async (...args: T): Promise<R | null> => {
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt <= retryAttempts) {
        try {
          const result = await operation(...args);
          
          // Sucesso - limpar erros desta operação
          clearErrors(operationName);
          
          if (attempt > 0) {
            console.log(`Operação ${operationName} recuperada após ${attempt} tentativas`);
            onRecovery?.(`${operationName}${context ? ` - ${context}` : ''}`);
            
            if (showToast) {
              toast({
                title: 'Operação Recuperada',
                description: `${operationName} executada com sucesso após ${attempt} tentativa(s).`,
              });
            }
          }

          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          if (attempt < retryAttempts) {
            console.log(`Tentativa ${attempt + 1} falhou para ${operationName}, tentando novamente...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            attempt++;
          }
        }
      }

      // Todas as tentativas falharam
      if (lastError) {
        await handleInventoryError(lastError, operationName, context);
      }

      return null;
    };
  }, [
    retryAttempts,
    retryDelay,
    clearErrors,
    onRecovery,
    showToast,
    toast,
    handleInventoryError
  ]);

  // Retry de operação específica
  const retryOperation = useCallback(async (
    operation: string,
    operationFn: () => Promise<any>
  ): Promise<boolean> => {
    setErrorState(prev => ({ ...prev, isRecovering: true }));

    try {
      await operationFn();
      clearErrors(operation);
      
      toast({
        title: 'Operação Recuperada',
        description: `${operation} executada com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error(`Retry falhou para ${operation}:`, error);
      return false;
    } finally {
      setErrorState(prev => ({ ...prev, isRecovering: false }));
    }
  }, [clearErrors, toast]);

  // Executar validação manual de estoque
  const runStockValidation = useCallback(async (): Promise<boolean> => {
    setErrorState(prev => ({ ...prev, isRecovering: true }));

    try {
      const validation = await validateStockIntegrity();
      
      setErrorState(prev => ({
        ...prev,
        stockValidationErrors: validation.errors,
        isRecovering: false
      }));

      if (validation.isValid) {
        toast({
          title: 'Validação Concluída',
          description: 'Não foram encontrados problemas de integridade no estoque.',
        });
      } else {
        toast({
          title: 'Problemas Detectados',
          description: `${validation.errors.length} problema(s) de integridade encontrado(s).`,
          variant: 'destructive',
        });
      }

      return validation.isValid;
    } catch (error) {
      setErrorState(prev => ({ ...prev, isRecovering: false }));
      console.error('Erro na validação manual:', error);
      return false;
    }
  }, [validateStockIntegrity, toast]);

  return {
    // Estado atual
    errorState,

    // Funções principais
    handleInventoryError,
    withInventoryErrorHandling,
    
    // Validação e correção
    validateStockIntegrity,
    runStockValidation,
    autoCorrectStock,

    // Gestão de erros
    addError,
    clearErrors,
    retryOperation,

    // Configuração
    config: {
      showToast,
      retryAttempts,
      retryDelay,
      validateStock
    }
  };
};