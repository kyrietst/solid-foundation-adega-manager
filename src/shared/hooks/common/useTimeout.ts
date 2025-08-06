/**
 * Hook genérico para gerenciamento de timeouts
 * Implementa timeouts configuráveis com warnings e retry automático
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { 
  TimeoutConfig, 
  getTimeoutConfig, 
  adjustTimeoutForNetwork, 
  detectNetworkSpeed 
} from '@/lib/timeout-config';

export interface TimeoutState {
  isRunning: boolean;
  isWarning: boolean;
  isTimeout: boolean;
  remainingTime: number;
  warningShown: boolean;
  attempt: number;
}

export interface UseTimeoutOptions {
  operation?: string;
  customConfig?: Partial<TimeoutConfig>;
  showToast?: boolean;
  adaptToNetwork?: boolean;
  onWarning?: (remainingTime: number) => void;
  onTimeout?: (attempt: number) => void;
  onComplete?: () => void;
  onRetry?: (attempt: number) => void;
}

export const useTimeout = (options: UseTimeoutOptions = {}) => {
  const {
    operation = 'api_request',
    customConfig,
    showToast = true,
    adaptToNetwork = true,
    onWarning,
    onTimeout,
    onComplete,
    onRetry
  } = options;

  const { toast } = useToast();
  
  const [state, setState] = useState<TimeoutState>({
    isRunning: false,
    isWarning: false,
    isTimeout: false,
    remainingTime: 0,
    warningShown: false,
    attempt: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<TimeoutConfig | null>(null);

  // Obter configuração de timeout
  const getConfig = useCallback((): TimeoutConfig => {
    let config = getTimeoutConfig(operation);
    
    if (customConfig) {
      config = { ...config, ...customConfig };
    }
    
    if (adaptToNetwork) {
      const networkSpeed = detectNetworkSpeed();
      config = adjustTimeoutForNetwork(config, networkSpeed);
    }
    
    return config;
  }, [operation, customConfig, adaptToNetwork]);

  // Limpar todos os timers
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Limpar timers ao desmontar componente
  useEffect(() => {
    return clearAllTimers;
  }, [clearAllTimers]);

  // Iniciar timeout
  const startTimeout = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const config = getConfig();
      configRef.current = config;
      
      const startTime = Date.now();
      
      setState(prev => ({
        ...prev,
        isRunning: true,
        isWarning: false,
        isTimeout: false,
        remainingTime: config.duration,
        warningShown: false,
        attempt: prev.attempt + 1
      }));

      // Timer principal de timeout
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isRunning: false,
          isTimeout: true,
          remainingTime: 0
        }));

        if (showToast) {
          toast({
            title: 'Timeout',
            description: `${config.description} demorou mais que o esperado (${config.duration / 1000}s).`,
            variant: 'destructive',
          });
        }

        onTimeout?.(state.attempt + 1);
        reject(new Error(`Timeout: ${config.description} exceeded ${config.duration}ms`));
      }, config.duration);

      // Timer de warning se configurado
      if (config.showWarningAt && config.showWarningAt < config.duration) {
        warningTimeoutRef.current = setTimeout(() => {
          setState(prev => ({
            ...prev,
            isWarning: true,
            warningShown: true
          }));

          const remaining = config.duration - config.showWarningAt!;
          
          if (showToast) {
            toast({
              title: 'Operação Demorada',
              description: `${config.description} está demorando mais que o normal. Aguardando mais ${remaining / 1000}s...`,
              variant: 'default',
            });
          }

          onWarning?.(remaining);
        }, config.showWarningAt);
      }

      // Interval para atualizar tempo restante
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, config.duration - elapsed);
        
        setState(prev => ({
          ...prev,
          remainingTime: remaining
        }));

        if (remaining <= 0) {
          clearInterval(intervalRef.current!);
        }
      }, 100);

      // Resolver promise externamente será feito via complete()
      (window as any).__timeoutResolve = resolve;
    });
  }, [getConfig, showToast, toast, onWarning, onTimeout, state.attempt]);

  // Completar operação com sucesso
  const complete = useCallback(() => {
    clearAllTimers();
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isWarning: false,
      isTimeout: false,
      remainingTime: 0
    }));

    onComplete?.();
    
    // Resolver promise se existir
    const resolve = (window as any).__timeoutResolve;
    if (resolve) {
      resolve();
      delete (window as any).__timeoutResolve;
    }
  }, [clearAllTimers, onComplete]);

  // Cancelar timeout
  const cancel = useCallback(() => {
    clearAllTimers();
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isWarning: false,
      remainingTime: 0
    }));

    // Rejeitar promise se existir
    const resolve = (window as any).__timeoutResolve;
    if (resolve) {
      delete (window as any).__timeoutResolve;
    }
  }, [clearAllTimers]);

  // Reset do estado
  const reset = useCallback(() => {
    clearAllTimers();
    setState({
      isRunning: false,
      isWarning: false,
      isTimeout: false,
      remainingTime: 0,
      warningShown: false,
      attempt: 0
    });
  }, [clearAllTimers]);

  // Retry da operação
  const retry = useCallback(async (): Promise<void> => {
    const config = configRef.current || getConfig();
    
    if (state.attempt >= config.retryAttempts + 1) {
      throw new Error(`Max retry attempts (${config.retryAttempts}) exceeded`);
    }

    // Delay antes do retry
    if (config.retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, config.retryDelay));
    }

    setState(prev => ({
      ...prev,
      isTimeout: false,
      isWarning: false,
      warningShown: false
    }));

    onRetry?.(state.attempt);
    
    return startTimeout();
  }, [state.attempt, getConfig, onRetry, startTimeout]);

  // Wrapper para executar operação com timeout
  const withTimeout = useCallback(<T extends any[], R>(
    operation: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      const timeoutPromise = startTimeout();
      const operationPromise = operation(...args);

      try {
        const result = await Promise.race([
          operationPromise,
          timeoutPromise.then(() => {
            throw new Error('Operation timed out');
          })
        ]);

        complete();
        return result;
      } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
          // É um timeout, pode tentar retry se configurado
          const config = configRef.current || getConfig();
          
          if (state.attempt < config.retryAttempts + 1) {
            console.log(`Timeout detectado, tentando retry ${state.attempt + 1}/${config.retryAttempts + 1}...`);
            await retry();
            return withTimeout(operation)(...args);
          }
        }
        
        cancel();
        throw error;
      }
    };
  }, [startTimeout, complete, cancel, retry, getConfig, state.attempt]);

  // Wrapper para executar operação com timeout (versão simplificada)
  const executeWithTimeout = useCallback(async <R>(
    operation: () => Promise<R>
  ): Promise<R> => {
    return withTimeout(operation)();
  }, [withTimeout]);

  return {
    // Estado atual
    ...state,
    
    // Configuração
    config: configRef.current || getConfig(),

    // Ações principais
    startTimeout,
    complete,
    cancel,
    reset,
    retry,

    // Wrappers
    withTimeout,
    executeWithTimeout,

    // Estado derivado
    timeoutPercentage: configRef.current 
      ? ((configRef.current.duration - state.remainingTime) / configRef.current.duration) * 100
      : 0,
    formattedRemainingTime: Math.ceil(state.remainingTime / 1000),
    shouldShowWarning: state.isWarning && !state.warningShown,
    canRetry: state.isTimeout && state.attempt < (configRef.current?.retryAttempts || 0) + 1
  };
};