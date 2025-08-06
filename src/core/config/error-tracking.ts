/**
 * Sistema centralizado de error tracking
 * Coleta, agrega e reporta erros da aplicação
 */

import { supabase } from '@/core/api/supabase/client';

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action?: string;
  component?: string;
  route?: string;
  timestamp: string;
  sessionId: string;
  userAgent: string;
  url: string;
  ip?: string;
  buildVersion?: string;
  environment: 'development' | 'production' | 'staging';
}

export interface ErrorReport {
  id?: string;
  errorId: string; // Hash único do erro
  name: string;
  message: string;
  stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'javascript' | 'network' | 'auth' | 'business' | 'validation' | 'system';
  count: number;
  firstSeen: string;
  lastSeen: string;
  context: ErrorContext;
  resolved: boolean;
  fingerprint: string; // Para agrupar erros similares
}

export interface ErrorAggregation {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byComponent: Record<string, number>;
  byUser: Record<string, number>;
  trending: Array<{
    errorId: string;
    name: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private sessionId: string;
  private context: Partial<ErrorContext> = {};
  private errorQueue: ErrorReport[] = [];
  private isOnline: boolean = navigator.onLine;
  private retryInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
    this.setupNetworkListeners();
    this.startRetryInterval();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  // Gerar ID único da sessão
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Configurar handlers globais de erro
  private setupGlobalErrorHandlers(): void {
    // Erros JavaScript não capturados
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        component: 'window',
        action: 'unhandled_error'
      });
    });

    // Promises rejeitadas não capturadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          component: 'window',
          action: 'unhandled_promise_rejection'
        }
      );
    });

    // Erros de recursos (imagens, scripts, etc.)
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError(new Error(`Resource loading error: ${(event.target as any)?.src || 'unknown'}`), {
          component: 'resource_loader',
          action: 'resource_load_error'
        });
      }
    }, true);
  }

  // Configurar listeners de rede
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Interval para retry de erros em queue
  private startRetryInterval(): void {
    this.retryInterval = setInterval(() => {
      if (this.isOnline && this.errorQueue.length > 0) {
        this.flushErrorQueue();
      }
    }, 30000); // Tentar a cada 30 segundos
  }

  // Definir contexto global
  public setContext(context: Partial<ErrorContext>): void {
    this.context = { ...this.context, ...context };
  }

  // Limpar contexto
  public clearContext(): void {
    this.context = {};
  }

  // Gerar fingerprint para agrupar erros similares
  private generateFingerprint(error: Error, context: Partial<ErrorContext>): string {
    const key = `${error.name}-${error.message}-${context.component || 'unknown'}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Categorizar erro automaticamente
  private categorizeError(error: Error, context: Partial<ErrorContext>): ErrorReport['category'] {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
      return 'auth';
    }
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return 'validation';
    }
    if (context.action?.includes('business') || message.includes('business')) {
      return 'business';
    }
    if (stack.includes('react') || error.name === 'ChunkLoadError') {
      return 'javascript';
    }
    
    return 'system';
  }

  // Determinar severidade do erro
  private determineSeverity(error: Error, context: Partial<ErrorContext>): ErrorReport['severity'] {
    const message = error.message.toLowerCase();
    
    // Crítico: crashes, auth failures, payment errors
    if (
      error.name === 'ChunkLoadError' ||
      message.includes('payment') ||
      message.includes('crash') ||
      message.includes('critical') ||
      context.action?.includes('payment')
    ) {
      return 'critical';
    }

    // Alto: errors que afetam funcionalidade principal
    if (
      message.includes('database') ||
      message.includes('server') ||
      message.includes('unauthorized') ||
      context.action?.includes('sales') ||
      context.action?.includes('inventory')
    ) {
      return 'high';
    }

    // Médio: errors que afetam UX mas não quebram funcionalidade
    if (
      message.includes('validation') ||
      message.includes('timeout') ||
      message.includes('network')
    ) {
      return 'medium';
    }

    // Baixo: warnings e errors menores
    return 'low';
  }

  // Capturar erro
  public captureError(error: Error, contextOverride: Partial<ErrorContext> = {}): void {
    try {
      const now = new Date().toISOString();
      const fullContext: ErrorContext = {
        ...this.context,
        ...contextOverride,
        timestamp: now,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development'
      };

      const fingerprint = this.generateFingerprint(error, fullContext);
      const category = this.categorizeError(error, fullContext);
      const severity = this.determineSeverity(error, fullContext);

      const errorReport: ErrorReport = {
        errorId: fingerprint + '-' + Date.now(),
        name: error.name || 'UnknownError',
        message: error.message || 'No message provided',
        stack: error.stack,
        severity,
        category,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        context: fullContext,
        resolved: false,
        fingerprint
      };

      // Tentar enviar imediatamente se online
      if (this.isOnline) {
        this.sendErrorReport(errorReport);
      } else {
        this.addToQueue(errorReport);
      }

      // Log local para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.group(`🐛 Error Captured - ${severity.toUpperCase()}`);
        console.error('Error:', error);
        console.log('Context:', fullContext);
        console.log('Fingerprint:', fingerprint);
        console.groupEnd();
      }

    } catch (captureError) {
      console.error('Error capturing error:', captureError);
    }
  }

  // Adicionar erro à queue offline
  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Limitar tamanho da queue
    if (this.errorQueue.length > 50) {
      this.errorQueue.shift();
    }

    // Salvar queue no localStorage
    try {
      localStorage.setItem('error_tracking_queue', JSON.stringify(this.errorQueue));
    } catch (e) {
      console.warn('Failed to save error queue to localStorage');
    }
  }

  // Enviar relatório de erro
  private async sendErrorReport(errorReport: ErrorReport): Promise<boolean> {
    try {
      // Em desenvolvimento, apenas log
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Error Report (Dev Mode):', errorReport);
        return true;
      }

      // TODO: Integrar com Sentry em produção
      // Sentry.captureException(new Error(errorReport.message), {
      //   tags: {
      //     category: errorReport.category,
      //     severity: errorReport.severity,
      //     component: errorReport.context.component
      //   },
      //   contexts: {
      //     errorContext: errorReport.context
      //   }
      // });

      // Salvar no banco local (opcional)
      const { error } = await supabase
        .from('error_reports')
        .upsert([{
          error_id: errorReport.errorId,
          name: errorReport.name,
          message: errorReport.message,
          stack: errorReport.stack,
          severity: errorReport.severity,
          category: errorReport.category,
          fingerprint: errorReport.fingerprint,
          context: errorReport.context,
          resolved: false
        }]);

      if (error) {
        console.warn('Failed to save error report to database:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send error report:', error);
      return false;
    }
  }

  // Flush da queue de erros
  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const queue = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorReport of queue) {
      const success = await this.sendErrorReport(errorReport);
      if (!success) {
        // Re-adicionar à queue se falhar
        this.addToQueue(errorReport);
      }
    }

    // Limpar localStorage se queue foi processada
    if (this.errorQueue.length === 0) {
      localStorage.removeItem('error_tracking_queue');
    }
  }

  // Obter agregação de erros
  public async getErrorAggregation(days: number = 7): Promise<ErrorAggregation> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: errors, error } = await supabase
        .from('error_reports')
        .select('*')
        .gte('created_at', since.toISOString());

      if (error) throw error;

      const aggregation: ErrorAggregation = {
        total: errors?.length || 0,
        byCategory: {},
        bySeverity: {},
        byComponent: {},
        byUser: {},
        trending: []
      };

      errors?.forEach(error => {
        // Por categoria
        aggregation.byCategory[error.category] = (aggregation.byCategory[error.category] || 0) + 1;
        
        // Por severidade
        aggregation.bySeverity[error.severity] = (aggregation.bySeverity[error.severity] || 0) + 1;
        
        // Por componente
        const component = error.context?.component || 'unknown';
        aggregation.byComponent[component] = (aggregation.byComponent[component] || 0) + 1;
        
        // Por usuário
        const user = error.context?.userEmail || 'anonymous';
        aggregation.byUser[user] = (aggregation.byUser[user] || 0) + 1;
      });

      return aggregation;
    } catch (error) {
      console.error('Error fetching error aggregation:', error);
      return {
        total: 0,
        byCategory: {},
        bySeverity: {},
        byComponent: {},
        byUser: {},
        trending: []
      };
    }
  }

  // Marcar erro como resolvido
  public async resolveError(errorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('error_reports')
        .update({ resolved: true })
        .eq('error_id', errorId);

      return !error;
    } catch (error) {
      console.error('Error resolving error:', error);
      return false;
    }
  }

  // Limpar dados antigos
  public async cleanupOldErrors(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);

      await supabase
        .from('error_reports')
        .delete()
        .lt('created_at', cutoff.toISOString());
    } catch (error) {
      console.error('Error cleaning up old errors:', error);
    }
  }

  // Destructor
  public destroy(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
  }
}

// Instância global
export const errorTracker = ErrorTracker.getInstance();

// Função utilitária para capturar erros
export const captureError = (error: Error, context?: Partial<ErrorContext>) => {
  errorTracker.captureError(error, context);
};

// Função utilitária para definir contexto
export const setErrorContext = (context: Partial<ErrorContext>) => {
  errorTracker.setContext(context);
};

// Hook para usar error tracking em componentes React
export const useErrorTracking = () => {
  return {
    captureError,
    setContext: setErrorContext,
    clearContext: () => errorTracker.clearContext(),
    getAggregation: (days?: number) => errorTracker.getErrorAggregation(days),
    resolveError: (errorId: string) => errorTracker.resolveError(errorId)
  };
};