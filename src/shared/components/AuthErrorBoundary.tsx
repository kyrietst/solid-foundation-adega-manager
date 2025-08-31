/**
 * Error Boundary específico para componentes de autenticação
 * Lida com erros relacionados à auth de forma especializada
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { AlertTriangle, LogIn, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onAuthError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  isAuthError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isAuthError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Detectar se é um erro de autenticação
    const isAuthError = 
      error.message.includes('auth') ||
      error.message.includes('unauthorized') ||
      error.message.includes('forbidden') ||
      error.message.includes('token') ||
      error.message.includes('session');

    return { 
      hasError: true, 
      error,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 AuthErrorBoundary capturou erro:', error, errorInfo);
    console.error('💥 Auth erro detalhado:', error.message, error.stack);
    console.error('💥 Auth Component Stack:', errorInfo.componentStack);
    
    // Callback específico para erros de auth
    if (this.state.isAuthError) {
      this.props.onAuthError?.(error);
    }

    // TODO: Logging específico para auth errors
    // logAuthError({
    //   error,
    //   errorInfo,
    //   userAgent: navigator.userAgent,
    //   timestamp: new Date().toISOString()
    // });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isAuthError: false });
  };

  private handleLogin = () => {
    // Limpar storage e redirecionar para login
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth';
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { isAuthError, error } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-xl font-semibold">
                {isAuthError ? 'Erro de Autenticação' : 'Erro na Aplicação'}
              </CardTitle>
              <CardDescription>
                {isAuthError 
                  ? 'Sua sessão expirou ou há um problema com suas credenciais.'
                  : 'Ocorreu um erro inesperado na área de autenticação.'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isAuthError ? (
                <>
                  <Button onClick={this.handleLogin} className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Fazer Login Novamente
                  </Button>
                  <Button variant="outline" onClick={this.handleRefresh} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recarregar Página
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={this.handleRetry} className="w-full">
                    Tentar Novamente
                  </Button>
                  <Button variant="outline" onClick={this.handleLogin} className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Ir para Login
                  </Button>
                </>
              )}

              {process.env.NODE_ENV === 'development' && error && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <strong>Debug Info:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}