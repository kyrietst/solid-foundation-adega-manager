/**
 * Hook para monitoramento de status de rede
 * Detecta mudanças de conectividade e implementa queue offline
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/shared/hooks/common/use-toast';
import { criticalDataCache } from '@/lib/critical-data-cache';

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps estimado
  rtt: number; // Round trip time em ms
  saveData: boolean; // Modo de economia de dados
}

export interface QueuedOperation {
  id: string;
  operation: () => Promise<any>;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  context?: string;
}

export interface NetworkConfig {
  enableQueue?: boolean;
  maxQueueSize?: number;
  maxRetries?: number;
  syncInterval?: number; // ms
  showToasts?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
  onQueueProcessed?: (processed: number, failed: number) => void;
}

const STORAGE_KEY = 'network_queue';

export const useNetworkStatus = (config: NetworkConfig = {}) => {
  const {
    enableQueue = true,
    maxQueueSize = 100,
    maxRetries = 3,
    syncInterval = 5000,
    showToasts = true,
    onOnline,
    onOffline,
    onQueueProcessed
  } = config;

  const { toast } = useToast();
  
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  });

  const [operationQueue, setOperationQueue] = useState<QueuedOperation[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState(0);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const offlineStartRef = useRef<Date | null>(null);

  // Obter informações de conexão detalhadas
  const getConnectionInfo = useCallback((): Partial<NetworkStatus> => {
    // @ts-ignore - navigator.connection pode não estar disponível em todos os browsers
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
      return {
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
        saveData: false
      };
    }

    return {
      connectionType: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }, []);

  // Carregar queue do localStorage
  const loadQueueFromStorage = useCallback(() => {
    if (!enableQueue) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const queue: QueuedOperation[] = JSON.parse(stored);
        setOperationQueue(queue);
      }
    } catch (error) {
      console.error('Error loading network queue from storage:', error);
    }
  }, [enableQueue]);

  // Salvar queue no localStorage
  const saveQueueToStorage = useCallback((queue: QueuedOperation[]) => {
    if (!enableQueue) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving network queue to storage:', error);
    }
  }, [enableQueue]);

  // Atualizar status da rede
  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    const connectionInfo = getConnectionInfo();

    setNetworkStatus(prev => ({
      ...prev,
      isOnline,
      ...connectionInfo
    }));

    // Callbacks de mudança
    if (isOnline && !networkStatus.isOnline) {
      setLastOnlineTime(new Date());
      if (offlineStartRef.current) {
        const duration = Date.now() - offlineStartRef.current.getTime();
        setOfflineDuration(duration);
        offlineStartRef.current = null;
      }
      onOnline?.();
    } else if (!isOnline && networkStatus.isOnline) {
      offlineStartRef.current = new Date();
      onOffline?.();
    }

    return isOnline;
  }, [networkStatus.isOnline, getConnectionInfo, onOnline, onOffline]);

  // Configurar listeners de rede
  useEffect(() => {
    const handleOnline = () => {
      const isOnline = updateNetworkStatus();
      
      if (isOnline && showToasts) {
        toast({
          title: 'Conectado',
          description: 'Conexão com a internet restaurada.',
          variant: 'default',
        });
      }

      // Processar queue quando volta online
      if (isOnline && enableQueue && operationQueue.length > 0) {
        processQueue();
      }
    };

    const handleOffline = () => {
      updateNetworkStatus();
      
      if (showToasts) {
        toast({
          title: 'Sem Conexão',
          description: 'Você está offline. Operações serão sincronizadas quando a conexão for restaurada.',
          variant: 'destructive',
        });
      }
    };

    const handleConnectionChange = () => {
      updateNetworkStatus();
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // @ts-ignore - navigator.connection pode não estar disponível
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Carregar queue e status inicial
    loadQueueFromStorage();
    updateNetworkStatus();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus, showToasts, toast, enableQueue, operationQueue.length, loadQueueFromStorage]);

  // Configurar intervalo de sync
  useEffect(() => {
    if (enableQueue && networkStatus.isOnline && operationQueue.length > 0) {
      syncIntervalRef.current = setInterval(() => {
        if (!isProcessingQueue) {
          processQueue();
        }
      }, syncInterval);
    } else if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [enableQueue, networkStatus.isOnline, operationQueue.length, isProcessingQueue, syncInterval]);

  // Adicionar operação à queue
  const addToQueue = useCallback((
    operation: () => Promise<any>,
    data: any,
    options: {
      priority?: QueuedOperation['priority'];
      maxRetries?: number;
      context?: string;
    } = {}
  ): string => {
    const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const queuedOp: QueuedOperation = {
      id,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? maxRetries,
      priority: options.priority ?? 'medium',
      context: options.context
    };

    setOperationQueue(prev => {
      const newQueue = [...prev, queuedOp];
      
      // Ordenar por prioridade
      newQueue.sort((a, b) => {
        const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityMap[b.priority] - priorityMap[a.priority];
      });

      // Limitar tamanho da queue
      if (newQueue.length > maxQueueSize) {
        newQueue.splice(maxQueueSize);
      }

      saveQueueToStorage(newQueue);
      return newQueue;
    });

    return id;
  }, [maxRetries, maxQueueSize, saveQueueToStorage]);

  // Processar queue de operações
  const processQueue = useCallback(async () => {
    if (!networkStatus.isOnline || operationQueue.length === 0 || isProcessingQueue) {
      return;
    }

    setIsProcessingQueue(true);
    
    let processed = 0;
    let failed = 0;
    const remainingQueue: QueuedOperation[] = [];

    for (const queuedOp of operationQueue) {
      try {
        await queuedOp.operation();
        processed++;
        console.log(`✅ Operação ${queuedOp.id} processada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao processar operação ${queuedOp.id}:`, error);
        
        if (queuedOp.retryCount < queuedOp.maxRetries) {
          // Adicionar de volta à queue com contador incrementado
          remainingQueue.push({
            ...queuedOp,
            retryCount: queuedOp.retryCount + 1
          });
        } else {
          failed++;
          console.error(`🚫 Operação ${queuedOp.id} falhou após ${queuedOp.maxRetries} tentativas`);
        }
      }
    }

    setOperationQueue(remainingQueue);
    saveQueueToStorage(remainingQueue);
    setIsProcessingQueue(false);

    // Callback de conclusão
    onQueueProcessed?.(processed, failed);

    // Toast de resultado
    if (showToasts && (processed > 0 || failed > 0)) {
      toast({
        title: 'Sincronização Concluída',
        description: `${processed} operação(ões) sincronizada(s)${failed > 0 ? `, ${failed} falharam` : ''}.`,
        variant: failed > 0 ? 'destructive' : 'default',
      });
    }
  }, [
    networkStatus.isOnline,
    operationQueue,
    isProcessingQueue,
    saveQueueToStorage,
    onQueueProcessed,
    showToasts,
    toast
  ]);

  // Executar operação com fallback offline
  const executeWithFallback = useCallback(async <T>(
    operation: () => Promise<T>,
    data?: any,
    options: {
      priority?: QueuedOperation['priority'];
      maxRetries?: number;
      context?: string;
      fallbackToQueue?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { fallbackToQueue = true } = options;

    // Se está online, tentar executar diretamente
    if (networkStatus.isOnline) {
      try {
        return await operation();
      } catch (error) {
        console.error('Operação falhou mesmo estando online:', error);
        
        // Se falhou e permite queue, adicionar à queue
        if (fallbackToQueue && enableQueue) {
          addToQueue(operation, data, options);
          
          if (showToasts) {
            toast({
              title: 'Operação na Fila',
              description: 'A operação foi adicionada à fila e será executada quando possível.',
              variant: 'default',
            });
          }
        }
        
        throw error;
      }
    }

    // Se está offline e permite queue, adicionar à queue
    if (fallbackToQueue && enableQueue) {
      addToQueue(operation, data, options);
      
      if (showToasts) {
        toast({
          title: 'Sem Conexão',
          description: 'A operação foi salva e será executada quando a conexão for restaurada.',
          variant: 'default',
        });
      }
      
      return null;
    }

    // Se não permite queue, lançar erro
    throw new Error('Operação não pode ser executada offline');
  }, [
    networkStatus.isOnline,
    enableQueue,
    addToQueue,
    showToasts,
    toast
  ]);

  // Limpar queue
  const clearQueue = useCallback(() => {
    setOperationQueue([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Remover operação específica da queue
  const removeFromQueue = useCallback((operationId: string) => {
    setOperationQueue(prev => {
      const newQueue = prev.filter(op => op.id !== operationId);
      saveQueueToStorage(newQueue);
      return newQueue;
    });
  }, [saveQueueToStorage]);

  // Forçar sync
  const forceSync = useCallback(() => {
    if (networkStatus.isOnline && !isProcessingQueue) {
      processQueue();
    }
  }, [networkStatus.isOnline, isProcessingQueue, processQueue]);

  // Cache inteligente para dados críticos
  const cacheWithFallback = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      priority?: 'low' | 'medium' | 'high' | 'critical';
      category?: 'products' | 'customers' | 'sales' | 'settings' | 'user' | 'system';
      ttl?: number;
      useStaleWhileRevalidate?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { priority = 'medium', category = 'system', ttl, useStaleWhileRevalidate = true } = options;

    // Tentar obter do cache primeiro
    const cachedData = criticalDataCache.get<T>(key);
    
    // Se está offline, retornar dados do cache se disponível
    if (!networkStatus.isOnline) {
      if (cachedData) {
        console.log(`📦 Dados obtidos do cache (offline): ${key}`);
        return cachedData;
      }
      console.warn(`❌ Dados não disponíveis offline: ${key}`);
      return null;
    }

    // Se está online e tem dados no cache, retornar cache e revalidar em background
    if (cachedData && useStaleWhileRevalidate) {
      // Revalidar em background
      fetcher()
        .then(freshData => {
          criticalDataCache.set(key, freshData, { priority, category, ttl });
          console.log(`🔄 Cache atualizado em background: ${key}`);
        })
        .catch(error => {
          console.warn(`⚠️ Falha na revalidação em background: ${key}`, error);
        });
      
      return cachedData;
    }

    // Tentar buscar dados frescos
    try {
      const freshData = await fetcher();
      criticalDataCache.set(key, freshData, { priority, category, ttl });
      console.log(`✅ Dados frescos obtidos e cachados: ${key}`);
      return freshData;
    } catch (error) {
      console.error(`❌ Erro ao buscar dados frescos: ${key}`, error);
      
      // Fallback para cache se disponível
      if (cachedData) {
        console.log(`📦 Fallback para cache devido a erro: ${key}`);
        return cachedData;
      }
      
      throw error;
    }
  }, [networkStatus.isOnline]);

  // Pré-cache de dados críticos
  const precacheData = useCallback(async (dataLoaders: Array<{
    key: string;
    fetcher: () => Promise<any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'products' | 'customers' | 'sales' | 'settings' | 'user' | 'system';
  }>) => {
    if (!networkStatus.isOnline) {
      console.warn('⚠️ Não é possível fazer precache offline');
      return;
    }

    console.log(`🚀 Iniciando precache de ${dataLoaders.length} datasets`);
    
    const results = await Promise.allSettled(
      dataLoaders.map(async ({ key, fetcher, priority, category }) => {
        try {
          const data = await fetcher();
          criticalDataCache.set(key, data, { priority, category });
          return { key, success: true };
        } catch (error) {
          console.error(`❌ Erro no precache: ${key}`, error);
          return { key, success: false, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`✅ Precache concluído: ${successful}/${dataLoaders.length} successful`);
  }, [networkStatus.isOnline]);

  return {
    // Status da rede
    ...networkStatus,
    lastOnlineTime,
    offlineDuration,

    // Queue de operações
    queueSize: operationQueue.length,
    isProcessingQueue,
    operationQueue,

    // Ações principais
    executeWithFallback,
    addToQueue,
    processQueue: forceSync,
    clearQueue,
    removeFromQueue,

    // Cache inteligente
    cacheWithFallback,
    precacheData,
    getCacheStats: () => criticalDataCache.getStats(),
    clearCache: () => criticalDataCache.clear(),

    // Estado derivado
    hasQueuedOperations: operationQueue.length > 0,
    isConnectionSlow: networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g',
    shouldSaveData: networkStatus.saveData || networkStatus.effectiveType === 'slow-2g',
    connectionQuality: 
      networkStatus.downlink > 10 ? 'excellent' :
      networkStatus.downlink > 5 ? 'good' :
      networkStatus.downlink > 1 ? 'fair' : 'poor',

    // Configuração
    config: {
      enableQueue,
      maxQueueSize,
      maxRetries,
      syncInterval,
      showToasts
    }
  };
};