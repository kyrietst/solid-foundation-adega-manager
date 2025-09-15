/**
 * useLoading - Hook centralizado para gerenciamento de estados de loading
 * Context7 Pattern: DRY principle aplicado para eliminar duplicação
 * Elimina duplicação identificada na análise (121 useState em 56 arquivos)
 *
 * REFATORAÇÃO APLICADA:
 * - Estado consolidado de loading
 * - Múltiplos loading states simultâneos
 * - Auto-cleanup em unmount
 * - Debounce opcional para UX
 * - Loading states nomeados
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingOptions {
  initialStates?: LoadingState;
  debounceMs?: number;
}

interface UseLoadingReturn {
  // Estado atual
  loadingStates: LoadingState;
  isLoading: (key?: string) => boolean;
  isAnyLoading: boolean;

  // Actions
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  clearAllLoading: () => void;

  // Utility functions
  withLoading: <T extends any[], R>(
    key: string,
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R>;

  // Batch operations
  setMultipleLoading: (states: Record<string, boolean>) => void;
}

export const useLoading = (options: UseLoadingOptions = {}): UseLoadingReturn => {
  const { initialStates = {}, debounceMs = 0 } = options;

  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialStates);
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Set loading with optional debounce
  const setLoading = useCallback((key: string, loading: boolean) => {
    // Clear existing timeout for this key
    if (timeoutsRef.current[key]) {
      clearTimeout(timeoutsRef.current[key]);
      delete timeoutsRef.current[key];
    }

    const updateState = () => {
      setLoadingStates(prev => ({
        ...prev,
        [key]: loading
      }));
    };

    if (debounceMs > 0 && !loading) {
      // Debounce only when setting to false (stopping loading)
      timeoutsRef.current[key] = setTimeout(updateState, debounceMs);
    } else {
      updateState();
    }
  }, [debounceMs]);

  // Convenience methods
  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const clearAllLoading = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = {};

    setLoadingStates({});
  }, []);

  // Check if specific key is loading
  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] || false;
    }
    // If no key provided, check if any loading
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  // Check if any loading state is active
  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  // Higher-order function to wrap async functions with loading state
  const withLoading = useCallback(<T extends any[], R>(
    key: string,
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        startLoading(key);
        const result = await fn(...args);
        return result;
      } finally {
        stopLoading(key);
      }
    };
  }, [startLoading, stopLoading]);

  // Set multiple loading states at once
  const setMultipleLoading = useCallback((states: Record<string, boolean>) => {
    setLoadingStates(prev => ({
      ...prev,
      ...states
    }));
  }, []);

  return {
    // State
    loadingStates,
    isLoading,
    isAnyLoading,

    // Actions
    setLoading,
    startLoading,
    stopLoading,
    clearAllLoading,

    // Utilities
    withLoading,
    setMultipleLoading,
  };
};

// Hook especializado para loading simples (substitui useState(false) comum)
export const useSimpleLoading = (initialLoading = false) => {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading({
    initialStates: { main: initialLoading }
  });

  return {
    isLoading: isLoading('main'),
    startLoading: () => startLoading('main'),
    stopLoading: () => stopLoading('main'),
    setLoading: (loading: boolean) => loading ? startLoading('main') : stopLoading('main'),
    withLoading: <T extends any[], R>(fn: (...args: T) => Promise<R>) =>
      withLoading('main', fn),
  };
};

export default useLoading;