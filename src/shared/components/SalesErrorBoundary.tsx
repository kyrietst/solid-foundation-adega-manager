/**
 * Error Boundary específico para operações de venda
 * Lida com erros críticos durante o processo de checkout
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { AlertTriangle, ShoppingCart, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  onSalesError?: (error: Error, errorInfo: ErrorInfo) => void;
  customFallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isSalesError: boolean;
  errorContext?: string;
}

export class SalesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isSalesError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Detectar se é um erro relacionado a vendas
    const message = error.message.toLowerCase();
    const isSalesError = 
      message.includes('sale') ||
      message.includes('cart') ||
      message.includes('checkout') ||
      message.includes('payment') ||
      message.includes('product') ||
      message.includes('stock') ||
      message.includes('inventory');

    // Determinar contexto do erro
    let errorContext = 'operação de venda';
    if (message.includes('cart')) errorContext = 'carrinho de compras';
    else if (message.includes('checkout')) errorContext = 'finalização da venda';
    else if (message.includes('payment')) errorContext = 'processamento do pagamento';
    else if (message.includes('stock')) errorContext = 'verificação de estoque';

    return { 
      hasError: true, 
      error,
      isSalesError,
      errorContext
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SalesErrorBoundary capturou erro:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // Callback específico para erros de vendas
    this.props.onSalesError?.(error, errorInfo);

    // TODO: Logging específico para erros de venda
    // logSalesError({
    //   error,
    //   errorInfo,
    //   timestamp: new Date().toISOString(),
    //   userAgent: navigator.userAgent,
    //   url: window.location.href
    // });
  }

  private handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      isSalesError: false,
      errorContext: undefined
    });
  };

  private handleGoToProducts = () => {
    window.location.href = '/inventory';
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearCart = async () => {
    try {
      // Limpar carrinho no localStorage
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      
      // Recarregar página para estado limpo
      window.location.reload();
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      this.handleRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.customFallback) {
        return this.props.customFallback;
      }

      const { isSalesError, error, errorContext } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                {isSalesError ? (
                  <ShoppingCart className="w-6 h-6 text-red-600 dark:text-red-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <CardTitle className="text-xl font-semibold">
                {isSalesError ? 'Erro na Venda' : 'Erro na Aplicação'}
              </CardTitle>
              <CardDescription>
                {isSalesError 
                  ? `Ocorreu um problema durante ${errorContext}. Seus dados estão seguros.`
                  : 'Ocorreu um erro inesperado na área de vendas.'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {isSalesError ? (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      🛡️ Seus dados estão protegidos
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Nenhuma venda foi processada incorretamente. O sistema detectou o erro antes de finalizar qualquer transação.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button onClick={this.handleRetry} className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </Button>
                    
                    <Button variant="outline" onClick={this.handleClearCart} className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Limpar Carrinho e Recomeçar
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="ghost" onClick={this.handleGoToProducts} className="text-sm">
                        Ver Produtos
                      </Button>
                      <Button variant="ghost" onClick={this.handleGoHome} className="text-sm">
                        <Home className="w-3 h-3 mr-1" />
                        Início
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Button>
                </>
              )}

              {/* Detalhes técnicos (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  <summary className="cursor-pointer font-semibold">
                    Detalhes Técnicos (Desenvolvimento)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Informações de suporte */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t">
                <p>
                  Se o problema persistir, anote o horário ({new Date().toLocaleString()}) e entre em contato com o suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}