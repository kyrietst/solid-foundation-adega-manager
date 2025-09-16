import React from 'react';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface QueryErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const QueryErrorFallback: React.FC<QueryErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">Erro na Consulta</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Ocorreu um erro ao carregar os dados. Por favor, tente novamente.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-left bg-muted p-3 rounded">
            <summary className="cursor-pointer font-medium mb-2">
              Detalhes do Erro (Desenvolvimento)
            </summary>
            <pre className="whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          </details>
        )}

        <Button
          onClick={resetErrorBoundary}
          className="w-full"
          variant="default"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </CardContent>
    </Card>
  );
};

interface QueryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<QueryErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const QueryErrorBoundary: React.FC<QueryErrorBoundaryProps> = ({
  children,
  fallback: Fallback = QueryErrorFallback,
  onError,
}) => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={onError}
      onReset={reset}
    >
      {children}
    </ErrorBoundary>
  );
};