/**
 * Componente de fallback para Error Boundaries
 * Fornece UI amigável quando erros JavaScript ocorrem
 */

import React, { ErrorInfo } from 'react';
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/primitives/collapsible';

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  onRetry?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onRetry
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Oops! Algo deu errado
          </CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada automaticamente.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Ações principais */}
          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            <Button variant="outline" onClick={handleGoHome} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Ir para Início
            </Button>
          </div>

          <Button variant="ghost" onClick={handleReload} className="w-full">
            Recarregar Página
          </Button>

          {/* Detalhes técnicos (apenas em desenvolvimento) */}
          {isDevelopment && (error || errorInfo) && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full">
                  <Bug className="w-4 h-4 mr-2" />
                  Ver Detalhes Técnicos
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-sm">
                  {error && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Erro:
                      </h4>
                      <pre className="whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300">
                        {error.name}: {error.message}
                      </pre>
                      {error.stack && (
                        <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 mt-2">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  )}
                  
                  {errorInfo && (
                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Component Stack:
                      </h4>
                      <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Informações de suporte */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t">
            <p>
              Se o problema persistir, entre em contato com o suporte técnico.
            </p>
            {error && (
              <p className="mt-1">
                ID do Erro: {Date.now().toString(36)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};