/**
 * usePerformanceMonitor.ts - Hook para monitoramento de performance (IMPLEMENTADO)
 * Context7 Pattern: Performance monitoring e debugging em desenvolvimento
 * Monitora re-renderizações, timing e oferece insights para otimização
 *
 * IMPLEMENTAÇÃO BASEADA NA ANÁLISE:
 * - Contador de renderizações
 * - Medição de tempo entre renders
 * - Logging estruturado para desenvolvimento
 * - Performance warnings automáticos
 * - Integration com React DevTools Profiler
 *
 * @version 1.0.0 - Performance Monitor Implementation (Context7)
 */

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  timeSinceLastRender: number;
  averageRenderTime: number;
  slowRenderWarnings: number;
}

interface UsePerformanceMonitorReturn {
  renderCount: number;
  averageRenderTime: number;
  logPerformance: (operation: string, startTime: number) => void;
  measureRender: <T>(fn: () => T) => T;
}

interface PerformanceMonitorOptions {
  slowRenderThreshold?: number; // ms
  enableWarnings?: boolean;
  enableLogging?: boolean;
  logSlowRenders?: boolean;
}

/**
 * Hook para monitoramento de performance de componentes
 * Implementa pattern de performance monitoring identificado como necessário na análise
 */
export const usePerformanceMonitor = (
  componentName: string,
  options: PerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn => {
  const {
    slowRenderThreshold = 16, // 60 FPS = ~16ms per frame
    enableWarnings = true,
    enableLogging = process.env.NODE_ENV === 'development',
    logSlowRenders = true
  } = options;

  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderTime = useRef(Date.now());
  const componentMountTime = useRef(Date.now());
  const slowRenderWarnings = useRef(0);

  // ✅ Context7 Pattern: Tracking de render performance
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    // Armazenar tempo de render (mantém apenas últimos 10)
    renderTimes.current.push(timeSinceLastRender);
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    // Calcular média de tempo de render
    const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;

    // Detectar renders lentos
    const isSlowRender = timeSinceLastRender > slowRenderThreshold;
    if (isSlowRender && renderCount.current > 1) { // Skip first render
      slowRenderWarnings.current += 1;

      if (enableWarnings && logSlowRenders) {
        console.warn(`⚠️ [Performance] Slow render detected in ${componentName}:`, {
          renderTime: `${timeSinceLastRender}ms`,
          threshold: `${slowRenderThreshold}ms`,
          renderCount: renderCount.current,
          averageRenderTime: `${averageRenderTime.toFixed(1)}ms`,
          timestamp: new Date(now).toISOString()
        });
      }
    }

    // Logging estruturado para desenvolvimento
    if (enableLogging && renderCount.current % 5 === 0) { // Log every 5 renders
      console.log(`📊 [Performance] ${componentName} metrics:`, {
        renderCount: renderCount.current,
        averageRenderTime: `${averageRenderTime.toFixed(1)}ms`,
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        slowRenderWarnings: slowRenderWarnings.current,
        componentAge: `${((now - componentMountTime.current) / 1000).toFixed(1)}s`,
        isSlowRender,
        timestamp: new Date(now).toISOString()
      });
    }

    lastRenderTime.current = now;
  });

  // ✅ Context7 Pattern: Logging de operações customizadas
  const logPerformance = useCallback((operation: string, startTime: number) => {
    if (!enableLogging) return;

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️ [Performance] ${componentName}.${operation}:`, {
      duration: `${duration}ms`,
      operation,
      componentName,
      renderCount: renderCount.current,
      timestamp: new Date(endTime).toISOString()
    });

    if (duration > slowRenderThreshold && enableWarnings) {
      console.warn(`⚠️ [Performance] Slow operation in ${componentName}.${operation}: ${duration}ms`);
    }
  }, [componentName, enableLogging, enableWarnings, slowRenderThreshold]);

  // ✅ Context7 Pattern: Medição automática de renders
  const measureRender = useCallback(<T>(fn: () => T): T => {
    const startTime = Date.now();
    const result = fn();
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (enableLogging) {
      console.log(`⏱️ [Performance] ${componentName} render function:`, {
        duration: `${duration}ms`,
        renderCount: renderCount.current,
        timestamp: new Date(endTime).toISOString()
      });
    }

    return result;
  }, [componentName, enableLogging]);

  // Calcular média de tempo de render
  const averageRenderTime = renderTimes.current.length > 0
    ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
    : 0;

  return {
    renderCount: renderCount.current,
    averageRenderTime,
    logPerformance,
    measureRender
  };
};

/**
 * Hook avançado para performance com profiling automático
 * Integra com React DevTools Profiler quando disponível
 */
export const useAdvancedPerformanceMonitor = (
  componentName: string,
  options: PerformanceMonitorOptions & {
    enableProfiling?: boolean;
    profileSampleRate?: number;
  } = {}
) => {
  const {
    enableProfiling = process.env.NODE_ENV === 'development',
    profileSampleRate = 0.1, // 10% das renderizações
    ...baseOptions
  } = options;

  const baseMonitor = usePerformanceMonitor(componentName, baseOptions);
  const profilingData = useRef<Array<{
    phase: 'mount' | 'update';
    actualDuration: number;
    baseDuration: number;
    startTime: number;
    commitTime: number;
  }>>([]);

  // Profiling callback para React Profiler
  const onRenderCallback = useCallback(
    (
      id: string,
      phase: 'mount' | 'update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      if (!enableProfiling || Math.random() > profileSampleRate) return;

      const profileData = {
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime
      };

      profilingData.current.push(profileData);

      // Manter apenas últimos 20 registros
      if (profilingData.current.length > 20) {
        profilingData.current.shift();
      }

      console.log(`🔍 [Profiler] ${componentName} (${phase}):`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        efficiency: `${((baseDuration / actualDuration) * 100).toFixed(1)}%`,
        timestamp: new Date(commitTime).toISOString()
      });
    },
    [componentName, enableProfiling, profileSampleRate]
  );

  return {
    ...baseMonitor,
    onRenderCallback,
    profilingData: profilingData.current
  };
};

/**
 * HOC para adicionar performance monitoring automaticamente
 */
export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  options: PerformanceMonitorOptions & { componentName?: string } = {}
) => {
  const componentName = options.componentName || Component.displayName || Component.name || 'Unknown';

  const WrappedComponent = (props: P) => {
    const { logPerformance, measureRender } = usePerformanceMonitor(componentName, options);

    return measureRender(() => (
      <Component {...props} />
    ));
  };

  WrappedComponent.displayName = `withPerformanceMonitor(${componentName})`;
  return WrappedComponent;
};

export default usePerformanceMonitor;