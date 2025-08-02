/**
 * Componente de erro específico para Dashboard
 * Lida com falhas parciais e completas
 */

import React from 'react';
import { AlertTriangle, RefreshCw, TrendingUp, Users, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DashboardErrorState } from '@/hooks/dashboard/useDashboardErrorHandling';

interface DashboardErrorProps {
  errorState: DashboardErrorState;
  onRetry: (section?: keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>) => void;
  onRetryAll: () => void;
  isLoading?: boolean;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  errorState,
  onRetry,
  onRetryAll,
  isLoading = false
}) => {
  const sectionIcons = {
    counts: Users,
    sales: TrendingUp,
    lowStock: Package,
    deliveries: Truck
  };

  const sectionNames = {
    counts: 'Contadores Gerais',
    sales: 'Dados de Vendas',
    lowStock: 'Estoque Baixo',
    deliveries: 'Entregas Pendentes'
  };

  // Se todas as seções falharam
  if (errorState.hasAnyError && !errorState.isPartialFailure) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Erro no Dashboard</CardTitle>
            <CardDescription>
              Não foi possível carregar os dados do dashboard. Verifique sua conexão e tente novamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={onRetryAll} 
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Tentar Novamente
            </Button>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Se o problema persistir, entre em contato com o suporte.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se é uma falha parcial
  if (errorState.isPartialFailure) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alguns dados não puderam ser carregados</AlertTitle>
          <AlertDescription>
            Algumas seções do dashboard estão temporariamente indisponíveis. 
            Você pode tentar recarregá-las individualmente ou tentar novamente tudo de uma vez.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(sectionNames).map(([section, name]) => {
            const hasError = errorState[section as keyof typeof errorState] !== null;
            const Icon = sectionIcons[section as keyof typeof sectionIcons];
            
            if (!hasError) return null;

            return (
              <Card key={section} className="border-red-200 dark:border-red-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{name}</CardTitle>
                      <CardDescription className="text-xs">
                        Falha ao carregar
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRetry(section as keyof Omit<DashboardErrorState, 'hasAnyError' | 'isPartialFailure'>)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Tentar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button onClick={onRetryAll} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Recarregar Tudo
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

// Componente para seções individuais com erro
export const DashboardSectionError: React.FC<{
  section: string;
  error: Error;
  onRetry: () => void;
  isLoading?: boolean;
}> = ({ section, error, onRetry, isLoading = false }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <AlertTriangle className="w-8 h-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
        Erro ao carregar {section}
      </p>
      <Button size="sm" variant="outline" onClick={onRetry} disabled={isLoading}>
        <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        Tentar Novamente
      </Button>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
        </details>
      )}
    </div>
  );
};