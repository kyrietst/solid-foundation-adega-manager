/**
 * Componentes de fallback para erros de inventário
 * Estados de erro específicos para operações de estoque
 */

import React from 'react';
import { AlertTriangle, Package, RefreshCw, Settings, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { InventoryErrorState } from '@/hooks/inventory/useInventoryErrorHandler';

interface InventoryErrorProps {
  errorState: InventoryErrorState;
  onRetry: (operation?: string) => void;
  onValidateStock: () => void;
  onAutoCorrect: (productId?: string) => void;
  isLoading?: boolean;
}

export const InventoryError: React.FC<InventoryErrorProps> = ({
  errorState,
  onRetry,
  onValidateStock,
  onAutoCorrect,
  isLoading = false
}) => {
  const errorOperations = Object.keys(errorState.errorsByOperation);
  const totalErrors = Object.values(errorState.errorsByOperation).flat().length;

  return (
    <div className="space-y-4">
      {/* Header com resumo dos erros */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Problemas no Inventário</AlertTitle>
        <AlertDescription>
          {totalErrors} erro(s) detectado(s) em {errorOperations.length} operação(ões) de estoque.
          {errorState.stockValidationErrors.length > 0 && 
            ` ${errorState.stockValidationErrors.length} problema(s) de integridade encontrado(s).`
          }
        </AlertDescription>
      </Alert>

      {/* Erros por operação */}
      <div className="grid gap-4">
        {errorOperations.map(operation => {
          const errors = errorState.errorsByOperation[operation];
          const operationNames: Record<string, string> = {
            'product_create': 'Criar Produto',
            'product_update': 'Atualizar Produto',
            'product_delete': 'Excluir Produto',
            'stock_movement': 'Movimentar Estoque',
            'stock_adjustment': 'Ajustar Estoque',
            'low_stock_check': 'Verificar Estoque Baixo'
          };

          return (
            <Card key={operation} className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <CardTitle className="text-base">
                      {operationNames[operation] || operation}
                    </CardTitle>
                    <Badge variant="destructive">
                      {errors.length} erro(s)
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(operation)}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Tentar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errors.slice(0, 3).map((error, index) => (
                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {error.message}
                    </div>
                  ))}
                  {errors.length > 3 && (
                    <div className="text-xs text-gray-500">
                      ... e mais {errors.length - 3} erro(s)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Problemas de integridade de estoque */}
      {errorState.stockValidationErrors.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-base">Problemas de Integridade</CardTitle>
              <Badge variant="secondary">
                {errorState.stockValidationErrors.length}
              </Badge>
            </div>
            <CardDescription>
              Inconsistências detectadas nos dados de estoque que podem afetar operações futuras.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {errorState.stockValidationErrors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <XCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{error}</span>
                </div>
              ))}
              {errorState.stockValidationErrors.length > 5 && (
                <div className="text-xs text-gray-500 ml-6">
                  ... e mais {errorState.stockValidationErrors.length - 5} problema(s)
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onValidateStock}
                disabled={isLoading}
              >
                <Settings className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Revalidar
              </Button>
              <Button
                size="sm"
                onClick={() => onAutoCorrect()}
                disabled={isLoading}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Corrigir Automaticamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações globais */}
      <div className="flex justify-center space-x-4 pt-4">
        <Button onClick={() => onRetry()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Tentar Todas Novamente
        </Button>
        <Button variant="outline" onClick={onValidateStock} disabled={isLoading}>
          <Settings className="w-4 h-4 mr-2" />
          Executar Validação Completa
        </Button>
      </div>
    </div>
  );
};

// Componente para erro em lista de produtos vazia
export const EmptyProductsError: React.FC<{
  error: Error;
  onRetry: () => void;
  isLoading?: boolean;
}> = ({ error, onRetry, isLoading = false }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <Package className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Erro ao Carregar Produtos
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
        Não foi possível carregar a lista de produtos do estoque. Verifique sua conexão e tente novamente.
      </p>
      <Button onClick={onRetry} disabled={isLoading}>
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Tentar Novamente
      </Button>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 w-full max-w-md">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Detalhes do Erro (Dev)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      )}
    </div>
  );
};

// Componente para seção de estoque baixo com erro
export const LowStockError: React.FC<{
  error: Error;
  onRetry: () => void;
  isLoading?: boolean;
}> = ({ error, onRetry, isLoading = false }) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro ao Verificar Estoque Baixo</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">Não foi possível verificar produtos com estoque baixo.</p>
        <Button size="sm" variant="outline" onClick={onRetry} disabled={isLoading}>
          <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Tentar Novamente
        </Button>
      </AlertDescription>
    </Alert>
  );
};

// Componente para erro em movimentações de estoque
export const MovementError: React.FC<{
  error: Error;
  movementType: string;
  onRetry: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}> = ({ error, movementType, onRetry, onCancel, isLoading = false }) => {
  const movementNames: Record<string, string> = {
    'in': 'entrada',
    'out': 'saída',
    'fiado': 'venda fiada',
    'devolucao': 'devolução'
  };

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-300 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Erro na Movimentação
        </CardTitle>
        <CardDescription>
          Falha ao processar {movementNames[movementType] || movementType} de estoque.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            {error.message}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onRetry} disabled={isLoading} size="sm">
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};