/**
 * Error Boundary específico para rotas
 * Fornece contexto adicional sobre a rota que falhou
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  routePath?: string;
}

class RouteErrorBoundaryClass extends Component<Props & { routePath: string }, State> {
  constructor(props: Props & { routePath: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { routeName, routePath } = this.props;
    
    console.error(`Erro na rota ${routeName || routePath}:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      routePath
    });

    // TODO: Logging específico para rotas
    // logRouteError({
    //   route: routePath,
    //   routeName,
    //   error,
    //   errorInfo,
    //   timestamp: new Date().toISOString()
    // });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
              Erro na página: {this.props.routeName || this.state.routePath}
            </h2>
          </div>
          <ErrorFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para injetar informações da rota
export const RouteErrorBoundary: React.FC<Props> = ({ children, routeName }) => {
  const location = useLocation();
  
  return (
    <RouteErrorBoundaryClass routeName={routeName} routePath={location.pathname}>
      {children}
    </RouteErrorBoundaryClass>
  );
};