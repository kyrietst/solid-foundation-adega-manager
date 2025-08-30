/**
 * Hook simplificado para monitoramento de status de rede
 * Versão mais estável para evitar erros de listener
 */

import { useState, useEffect, useCallback } from 'react';

export interface SimpleNetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
}

export const useNetworkStatusSimple = () => {
  const [networkStatus, setNetworkStatus] = useState<SimpleNetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false
  });

  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    
    // Verificar se é conexão lenta
    let isSlowConnection = false;
    try {
      // @ts-expect-error - connection API pode não estar disponível
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        // Considerar lento se effectiveType é 2g ou slow-2g
        isSlowConnection = connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
      }
    } catch (error) {
      // Silently ignore connection API errors
      console.debug('Connection API not available:', error);
    }

    setNetworkStatus({
      isOnline,
      isSlowConnection
    });

    return isOnline;
  }, []);

  // Configurar listeners de rede de forma segura
  useEffect(() => {
    let mounted = true;

    const handleOnline = () => {
      if (mounted) {
        updateNetworkStatus();
      }
    };

    const handleOffline = () => {
      if (mounted) {
        updateNetworkStatus();
      }
    };

    const handleConnectionChange = () => {
      if (mounted) {
        updateNetworkStatus();
      }
    };

    // Adicionar listeners
    try {
      window.addEventListener('online', handleOnline, { passive: true });
      window.addEventListener('offline', handleOffline, { passive: true });
      
      // @ts-expect-error - connection API pode não estar disponível
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', handleConnectionChange, { passive: true });
      }
    } catch (error) {
      console.warn('Failed to setup network listeners:', error);
    }

    // Status inicial
    updateNetworkStatus();

    // Cleanup
    return () => {
      mounted = false;
      
      try {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        
        // @ts-expect-error - connection API pode não estar disponível
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection && typeof connection.removeEventListener === 'function') {
          connection.removeEventListener('change', handleConnectionChange);
        }
      } catch (error) {
        console.warn('Failed to cleanup network listeners:', error);
      }
    };
  }, [updateNetworkStatus]);

  return {
    ...networkStatus,
    refresh: updateNetworkStatus
  };
};