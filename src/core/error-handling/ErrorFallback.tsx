/**
 * ErrorFallback.tsx - Componentes de fallback para erros (IMPLEMENTADO)
 * Context7 Pattern: Feedback visual consistente durante falhas
 * Substitui error states genéricos por UX informativa e acionável
 *
 * IMPLEMENTAÇÃO BASEADA NA ANÁLISE:
 * - Error states específicos por contexto
 * - Ações de retry visíveis
 * - Informações técnicas em desenvolvimento
 * - Degradação graciosa da UX
 * - Navegação alternativa
 *
 * @version 1.0.0 - Error Fallback Implementation (Context7)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import {
  AlertTriangle,
  XCircle,
  Wifi,
  Shield,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Brain,
  TrendingUp,
  Package,
  Users,
  BarChart3,
} from 'lucide-react';

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  className?: string;
  isDevelopment?: boolean;
}

export interface ErrorCardProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onNavigateAway?: () => void;
  canRetry?: boolean;
  severity?: 'error' | 'warning' | 'info';
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  alternativeActions?: React.ReactNode;
}

/**
 * Componente base para exibição de erros
 * Substitui pattern problemático identificado: error state genérico sem ação
 */
export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  message,
  onRetry,
  onNavigateAway,
  canRetry = true,
  severity = 'error',
  className,
  icon: Icon = AlertTriangle,
  alternativeActions,
}) => {
  const severityStyles = {
    error: 'border-red-500/40 bg-red-500/5',
    warning: 'border-yellow-500/40 bg-yellow-500/5',
    info: 'border-blue-500/40 bg-blue-500/5',
  };

  const severityColors = {
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300',
  };

  return (
    <Card className={cn(
      'backdrop-blur-xl shadow-lg',
      severityStyles[severity],
      className
    )}>
      <CardHeader>
        <CardTitle className={cn(
          'flex items-center gap-2 font-bold',
          severityColors[severity]
        )}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>

          <div className="flex gap-2 flex-wrap">
            {canRetry && onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}

            {onNavigateAway && (
              <Button
                onClick={onNavigateAway}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}

            {alternativeActions}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Error fallback para problemas de rede
 * Aborda pattern identificado: sem diferenciação entre tipos de erro
 */
export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  className,
}) => (
  <ErrorCard
    title="Problema de Conectividade"
    message="Não foi possível estabelecer conexão com o servidor. Verifique sua conexão com a internet e tente novamente."
    onRetry={resetErrorBoundary}
    severity="warning"
    icon={Wifi}
    className={className}
    alternativeActions={
      <Button
        onClick={() => window.location.reload()}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Recarregar Página
      </Button>
    }
  />
);

/**
 * Error fallback para problemas de autenticação
 */
export const AuthErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  className,
}) => (
  <ErrorCard
    title="Sessão Expirada"
    message="Sua sessão expirou ou você não tem permissão para acessar este recurso. Faça login novamente para continuar."
    onRetry={() => window.location.href = '/login'}
    canRetry={true}
    severity="error"
    icon={Shield}
    className={className}
    alternativeActions={
      <Button
        onClick={() => window.location.href = '/'}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Ir para Início
      </Button>
    }
  />
);

/**
 * Error fallback para Dashboard
 * Implementa strategy de degradação graciosa sugerida na análise
 */
export const DashboardErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  className,
  isDevelopment = false,
}) => (
  <div className={cn('space-y-6', className)}>
    <ErrorCard
      title="Dashboard Temporariamente Indisponível"
      message="Ocorreu um erro ao carregar os dados do dashboard. Você pode tentar novamente ou acessar outras funcionalidades do sistema."
      onRetry={resetErrorBoundary}
      severity="warning"
      icon={BarChart3}
      alternativeActions={
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => window.location.href = '/reports'}
            variant="outline"
            size="sm"
            className="border-accent-blue/40 text-accent-blue/70 hover:bg-accent-blue/10"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Relatórios
          </Button>
          <Button
            onClick={() => window.location.href = '/sales'}
            variant="outline"
            size="sm"
            className="border-accent-green/40 text-accent-green/70 hover:bg-accent-green/10"
          >
            <Package className="h-4 w-4 mr-2" />
            Ir para Vendas
          </Button>
          <Button
            onClick={() => window.location.href = '/customers'}
            variant="outline"
            size="sm"
            className="border-accent-purple/40 text-accent-purple/70 hover:bg-accent-purple/10"
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Clientes
          </Button>
        </div>
      }
    />

    {/* Detalhes técnicos em desenvolvimento */}
    {isDevelopment && error && (
      <Card className="border-gray-600/40 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-gray-300 text-sm">
            Detalhes Técnicos (Desenvolvimento)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
              Stack Trace
            </summary>
            <pre className="bg-black/50 p-3 rounded text-accent-red/70 whitespace-pre-wrap text-xs overflow-x-auto">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        </CardContent>
      </Card>
    )}
  </div>
);

/**
 * Error fallback para sistema de vendas (POS)
 * Implementa warning sobre vendas perdidas conforme análise
 */
export const SalesErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  className,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
    <div className="max-w-md space-y-4">
      <ErrorCard
        title="Sistema de Vendas Indisponível"
        message="O sistema de vendas encontrou um erro crítico. Vendas em andamento podem ter sido perdidas."
        onRetry={() => {
          // Limpar estado de vendas pendentes
          localStorage.removeItem('pending-sale');
          localStorage.removeItem('cart-items');
          resetErrorBoundary?.();
        }}
        severity="error"
        icon={XCircle}
        className={className}
        alternativeActions={
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => window.location.href = '/sales?mode=recovery'}
              variant="outline"
              size="sm"
              className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Modo Recuperação
            </Button>
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir para Dashboard
            </Button>
          </div>
        }
      />

      {/* Aviso importante sobre dados */}
      <Card className="border-yellow-500/40 bg-yellow-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-200 text-sm font-medium mb-2">
                ⚠️ Atenção: Dados de Venda
              </p>
              <p className="text-yellow-100 text-xs leading-relaxed">
                Verifique o último registro de vendas antes de continuar.
                Confirme se a última transação foi processada corretamente no sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

/**
 * Error fallback raiz (aplicação inteira)
 */
export const RootErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  isDevelopment = false,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
    <div className="max-w-lg space-y-6">
      <ErrorCard
        title="Sistema Temporariamente Indisponível"
        message="O Adega Manager encontrou um erro inesperado. Nossa equipe foi notificada automaticamente. Você pode tentar recarregar a página ou entrar em contato conosco."
        onRetry={resetErrorBoundary}
        severity="error"
        icon={XCircle}
        alternativeActions={
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="border-accent-blue/40 text-accent-blue/70 hover:bg-accent-blue/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar Página
            </Button>
            <Button
              onClick={() => window.open('/feedback?type=error', '_blank')}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Reportar Problema
            </Button>
          </div>
        }
      />

      {/* Informações de contato */}
      <Card className="border-blue-500/40 bg-blue-500/5">
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-blue-200 text-sm font-medium mb-2">
              Precisa de ajuda urgente?
            </p>
            <p className="text-blue-100 text-xs">
              Entre em contato conosco pelo WhatsApp ou email de suporte.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Debug info em desenvolvimento */}
      {isDevelopment && error && (
        <Card className="border-gray-600/40 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-gray-300 text-sm">
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-red-200 whitespace-pre-wrap overflow-x-auto">
              {error.name}: {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);