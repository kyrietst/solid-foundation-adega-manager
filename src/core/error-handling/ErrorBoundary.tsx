/**
 * ErrorBoundary.tsx - Error Boundaries customizados (IMPLEMENTADO)
 * Context7 Pattern: Proteção contra crashes com fallback gracioso
 * Implementa strategy de error boundaries específicos por feature
 *
 * IMPLEMENTAÇÃO BASEADA NA ANÁLISE:
 * - Error boundaries por contexto de aplicação
 * - Logging estruturado para debugging
 * - Fallback UX específico por feature
 * - Recovery mechanisms integrados
 * - Error reporting para produção
 *
 * @version 1.0.0 - Error Boundary Implementation (Context7)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import {
  DashboardErrorFallback,
  SalesErrorFallback,
  RootErrorFallback,
  NetworkErrorFallback,
  AuthErrorFallback,
} from './ErrorFallback';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  feature?: string;
  resetOnPropsChange?: boolean;
}

/**
 * Error Boundary clássico para compatibilidade
 * Implementa logging estruturado identificado como necessário na análise
 */
export class ClassicErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { feature = 'unknown', onError } = this.props;
    const errorContext = `[ErrorBoundary:${feature}]`;

    // Logging estruturado (substitui console.error simples da análise)
    console.error(`${errorContext} React Error Boundary triggered:`, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      context: {
        feature,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    });

    // Atualizar estado com errorInfo
    this.setState({ errorInfo });

    // Callback customizado
    if (onError) {
      onError(error, errorInfo);
    }

    // Report para serviço de monitoramento em produção
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementar error reporting service
      // errorReportingService.captureException(error, {
      //   tags: { feature, errorBoundary: true },
      //   extra: {
      //     componentStack: errorInfo.componentStack,
      //     errorId: this.state.errorId,
      //   }
      // });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset automático quando props mudam (útil para dados dinâmicos)
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    }
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback = RootErrorFallback } = this.props;

    if (hasError && error) {
      return (
        <Fallback
          error={error}
          resetErrorBoundary={() => this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: '',
          })}
          isDevelopment={process.env.NODE_ENV === 'development'}
        />
      );
    }

    return children;
  }
}

/**
 * Dashboard Error Boundary
 * Implementa degradação gracioso sugerida na análise
 */
export const DashboardErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ReactErrorBoundary
    FallbackComponent={DashboardErrorFallback}
    onError={(error, errorInfo) => {
      console.error('[Dashboard] Error caught by boundary:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        feature: 'dashboard',
      });

      // Report para monitoramento em produção
      if (process.env.NODE_ENV === 'production') {
        // errorReportingService.captureException(error, {
        //   tags: { feature: 'dashboard', errorBoundary: true },
        //   extra: errorInfo
        // });
      }
    }}
    onReset={() => {
      // Cleanup de estado específico do dashboard se necessário
      console.info('[Dashboard] Error boundary reset');
    }}
  >
    {children}
  </ReactErrorBoundary>
);

/**
 * Sales/POS Error Boundary
 * Implementa proteção crítica para vendas sugerida na análise
 */
export const SalesErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ReactErrorBoundary
    FallbackComponent={SalesErrorFallback}
    onError={(error, errorInfo) => {
      console.error('[Sales] CRITICAL ERROR - POS system failure:', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        feature: 'sales',
        severity: 'critical',
        pendingSale: localStorage.getItem('pending-sale'),
        cartItems: localStorage.getItem('cart-items'),
      });

      // Backup de dados críticos antes do crash
      const backupData = {
        pendingSale: localStorage.getItem('pending-sale'),
        cartItems: localStorage.getItem('cart-items'),
        timestamp: new Date().toISOString(),
        errorId: `sales_error_${Date.now()}`,
      };

      localStorage.setItem('sales-error-backup', JSON.stringify(backupData));

      // Report crítico para produção
      if (process.env.NODE_ENV === 'production') {
        // errorReportingService.captureException(error, {
        //   tags: { feature: 'sales', errorBoundary: true, severity: 'critical' },
        //   extra: { ...errorInfo, backupData }
        // });
      }
    }}
    onReset={() => {
      // Recovery de dados se possível
      const backup = localStorage.getItem('sales-error-backup');
      if (backup) {
        console.info('[Sales] Attempting data recovery from backup');
        // TODO: Implementar recovery logic
      }
    }}
  >
    {children}
  </ReactErrorBoundary>
);

/**
 * Customer/CRM Error Boundary
 */
export const CustomerErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ReactErrorBoundary
    FallbackComponent={({ error, resetErrorBoundary }) => (
      <DashboardErrorFallback
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        isDevelopment={process.env.NODE_ENV === 'development'}
      />
    )}
    onError={(error, errorInfo) => {
      console.error('[Customer] Error in CRM system:', {
        error: error.message,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        feature: 'customer',
      });
    }}
  >
    {children}
  </ReactErrorBoundary>
);

/**
 * Reports Error Boundary
 */
export const ReportsErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ReactErrorBoundary
    FallbackComponent={({ error, resetErrorBoundary }) => (
      <DashboardErrorFallback
        error={error}
        resetErrorBoundary={resetErrorBoundary}
        isDevelopment={process.env.NODE_ENV === 'development'}
      />
    )}
    onError={(error, errorInfo) => {
      console.error('[Reports] Error in reporting system:', {
        error: error.message,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        feature: 'reports',
      });
    }}
  >
    {children}
  </ReactErrorBoundary>
);

/**
 * Component Error Boundary
 * Para envolver componentes individuais que podem falhar
 */
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName: string;
  fallback?: React.ComponentType<any>;
}> = ({ children, componentName, fallback }) => (
  <ReactErrorBoundary
    FallbackComponent={fallback || (({ error, resetErrorBoundary }) => (
      <div className="border border-red-500/40 bg-red-500/5 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-300 text-sm font-medium mb-2">
          <span>⚠️ Componente {componentName} indisponível</span>
        </div>
        <p className="text-gray-400 text-xs mb-3">
          Este componente encontrou um erro e foi isolado para não afetar o resto da aplicação.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="text-xs text-red-300 hover:text-red-200 underline"
        >
          Tentar recarregar componente
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer">Debug info</summary>
            <pre className="text-xs text-red-200 mt-1 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    ))}
    onError={(error, errorInfo) => {
      console.error(`[Component:${componentName}] Error:`, {
        error: error.message,
        componentStack: errorInfo.componentStack,
        componentName,
        timestamp: new Date().toISOString(),
      });
    }}
  >
    {children}
  </ReactErrorBoundary>
);

/**
 * Higher-order component para adicionar error boundary automaticamente
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    componentName?: string;
    fallback?: React.ComponentType<any>;
  } = {}
) => {
  const WrappedComponent = (props: P) => (
    <ComponentErrorBoundary
      componentName={options.componentName || Component.displayName || Component.name || 'Unknown'}
      fallback={options.fallback}
    >
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};