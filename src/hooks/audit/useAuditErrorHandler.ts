/**
 * Hook especializado para tratamento de erros de audit logs
 * Implementa queue local, retry automático e backup de logs
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface AuditErrorConfig {
  enableQueue?: boolean;
  enableBackup?: boolean;
  maxQueueSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  batchSize?: number;
  showToastOnError?: boolean;
  onCriticalError?: (error: Error, entry: AuditLogEntry) => void;
}

export interface AuditErrorState {
  queueSize: number;
  pendingLogs: AuditLogEntry[];
  failedLogs: AuditLogEntry[];
  isProcessing: boolean;
  lastError: Error | null;
  totalErrors: number;
  totalProcessed: number;
}

const STORAGE_KEY = 'audit_logs_queue';
const BACKUP_KEY = 'audit_logs_backup';

export const useAuditErrorHandler = (config: AuditErrorConfig = {}) => {
  const {
    enableQueue = true,
    enableBackup = true,
    maxQueueSize = 100,
    retryAttempts = 3,
    retryDelay = 2000,
    batchSize = 10,
    showToastOnError = false, // Normalmente não mostrar toast para audit logs
    onCriticalError
  } = config;

  const { toast } = useToast();
  const [state, setState] = useState<AuditErrorState>({
    queueSize: 0,
    pendingLogs: [],
    failedLogs: [],
    isProcessing: false,
    lastError: null,
    totalErrors: 0,
    totalProcessed: 0
  });

  const processingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar queue do localStorage ao inicializar
  useEffect(() => {
    if (enableQueue) {
      loadQueueFromStorage();
    }
  }, [enableQueue]);

  // Processar queue periodicamente
  useEffect(() => {
    if (enableQueue && state.queueSize > 0 && !state.isProcessing) {
      const interval = setInterval(() => {
        processQueue();
      }, 30000); // Processar a cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [enableQueue, state.queueSize, state.isProcessing]);

  // Carregar queue do localStorage
  const loadQueueFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const queue: AuditLogEntry[] = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          pendingLogs: queue,
          queueSize: queue.length
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar queue de audit logs:', error);
    }
  }, []);

  // Salvar queue no localStorage
  const saveQueueToStorage = useCallback((queue: AuditLogEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Erro ao salvar queue de audit logs:', error);
    }
  }, []);

  // Backup de logs críticos
  const backupLog = useCallback((entry: AuditLogEntry, error: Error) => {
    if (!enableBackup) return;

    try {
      const stored = localStorage.getItem(BACKUP_KEY);
      const backup = stored ? JSON.parse(stored) : [];
      
      backup.push({
        ...entry,
        error: error.message,
        timestamp: new Date().toISOString(),
        retryCount: 0
      });

      // Manter apenas os últimos 50 logs de backup
      if (backup.length > 50) {
        backup.splice(0, backup.length - 50);
      }

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (backupError) {
      console.error('Erro ao fazer backup de audit log:', backupError);
    }
  }, [enableBackup]);

  // Adicionar log à queue
  const addToQueue = useCallback((entry: AuditLogEntry) => {
    setState(prev => {
      const newQueue = [...prev.pendingLogs, entry];
      
      // Limitar tamanho da queue
      if (newQueue.length > maxQueueSize) {
        const removed = newQueue.splice(0, newQueue.length - maxQueueSize);
        console.warn(`Queue de audit logs excedeu limite. ${removed.length} logs removidos.`);
      }

      if (enableQueue) {
        saveQueueToStorage(newQueue);
      }

      return {
        ...prev,
        pendingLogs: newQueue,
        queueSize: newQueue.length
      };
    });
  }, [maxQueueSize, enableQueue, saveQueueToStorage]);

  // Tentar enviar log individual
  const sendAuditLog = useCallback(async (entry: AuditLogEntry): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert([{
          action: entry.action,
          table_name: entry.table_name,
          record_id: entry.record_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          user_id: entry.user_id,
          user_email: entry.user_email,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          metadata: entry.metadata
        }]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar audit log:', error);
      return false;
    }
  }, []);

  // Processar batch de logs
  const processBatch = useCallback(async (logs: AuditLogEntry[]): Promise<{
    successful: AuditLogEntry[];
    failed: AuditLogEntry[];
  }> => {
    const successful: AuditLogEntry[] = [];
    const failed: AuditLogEntry[] = [];

    // Processar em chunks menores para evitar timeout
    const chunks = [];
    for (let i = 0; i < logs.length; i += batchSize) {
      chunks.push(logs.slice(i, i + batchSize));
    }

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map(log => sendAuditLog(log))
      );

      results.forEach((result, index) => {
        const log = chunk[index];
        if (result.status === 'fulfilled' && result.value) {
          successful.push(log);
        } else {
          failed.push(log);
        }
      });
    }

    return { successful, failed };
  }, [batchSize, sendAuditLog]);

  // Processar queue completa
  const processQueue = useCallback(async () => {
    if (processingRef.current || state.isProcessing || state.pendingLogs.length === 0) {
      return;
    }

    processingRef.current = true;
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const { successful, failed } = await processBatch(state.pendingLogs);

      setState(prev => ({
        ...prev,
        pendingLogs: failed,
        failedLogs: [...prev.failedLogs, ...failed],
        queueSize: failed.length,
        totalProcessed: prev.totalProcessed + successful.length,
        totalErrors: prev.totalErrors + failed.length,
        isProcessing: false
      }));

      if (enableQueue) {
        saveQueueToStorage(failed);
      }

      // Backup de logs que falharam
      failed.forEach(log => {
        backupLog(log, new Error('Failed to send after queue processing'));
      });

      if (successful.length > 0) {
        console.log(`${successful.length} audit logs processados com sucesso`);
      }

      if (failed.length > 0) {
        console.warn(`${failed.length} audit logs falharam no processamento`);
        
        if (showToastOnError) {
          toast({
            title: 'Avisos de Auditoria',
            description: `${failed.length} log(s) de auditoria não puderam ser enviados.`,
            variant: 'default',
          });
        }
      }

    } catch (error) {
      console.error('Erro no processamento da queue de audit logs:', error);
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        lastError: error instanceof Error ? error : new Error(String(error))
      }));
    } finally {
      processingRef.current = false;
    }
  }, [
    state.isProcessing,
    state.pendingLogs,
    processBatch,
    enableQueue,
    saveQueueToStorage,
    backupLog,
    showToastOnError,
    toast
  ]);

  // Tentar reenviar logs com falha
  const retryFailedLogs = useCallback(async () => {
    if (state.failedLogs.length === 0) return;

    const { successful, failed } = await processBatch(state.failedLogs);

    setState(prev => ({
      ...prev,
      failedLogs: failed,
      totalProcessed: prev.totalProcessed + successful.length
    }));

    if (successful.length > 0) {
      toast({
        title: 'Recuperação de Logs',
        description: `${successful.length} log(s) de auditoria recuperados com sucesso.`,
      });
    }
  }, [state.failedLogs, processBatch, toast]);

  // Limpar queue e backups
  const clearQueue = useCallback(() => {
    setState({
      queueSize: 0,
      pendingLogs: [],
      failedLogs: [],
      isProcessing: false,
      lastError: null,
      totalErrors: 0,
      totalProcessed: 0
    });

    if (enableQueue) {
      localStorage.removeItem(STORAGE_KEY);
    }
    
    if (enableBackup) {
      localStorage.removeItem(BACKUP_KEY);
    }
  }, [enableQueue, enableBackup]);

  // Log com error handling robusto
  const logWithErrorHandling = useCallback(async (entry: AuditLogEntry): Promise<boolean> => {
    // Tentar enviar diretamente primeiro
    const directSuccess = await sendAuditLog(entry);
    
    if (directSuccess) {
      setState(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + 1
      }));
      return true;
    }

    // Se falhou, adicionar à queue
    if (enableQueue) {
      addToQueue(entry);
      console.log('Audit log adicionado à queue para retry posterior');
    } else {
      // Se queue está desabilitada, tentar retry imediato
      let attempt = 0;
      while (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        
        const retrySuccess = await sendAuditLog(entry);
        if (retrySuccess) {
          setState(prev => ({
            ...prev,
            totalProcessed: prev.totalProcessed + 1
          }));
          return true;
        }
        
        attempt++;
      }

      // Todos os retries falharam
      backupLog(entry, new Error('Failed after all retry attempts'));
      
      setState(prev => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
        lastError: new Error('Failed to send audit log after retries')
      }));

      onCriticalError?.(new Error('Critical audit log failure'), entry);
    }

    return false;
  }, [
    sendAuditLog,
    enableQueue,
    addToQueue,
    retryAttempts,
    retryDelay,
    backupLog,
    onCriticalError
  ]);

  // Forçar processamento da queue
  const forceProcessQueue = useCallback(() => {
    if (!state.isProcessing) {
      processQueue();
    }
  }, [state.isProcessing, processQueue]);

  // Obter estatísticas da queue
  const getQueueStats = useCallback(() => {
    return {
      pending: state.queueSize,
      failed: state.failedLogs.length,
      totalProcessed: state.totalProcessed,
      totalErrors: state.totalErrors,
      successRate: state.totalProcessed + state.totalErrors > 0 
        ? (state.totalProcessed / (state.totalProcessed + state.totalErrors)) * 100 
        : 100
    };
  }, [state]);

  return {
    // Estado atual
    ...state,

    // Ações principais
    logWithErrorHandling,
    processQueue: forceProcessQueue,
    retryFailedLogs,
    clearQueue,

    // Utilitários
    getQueueStats,
    
    // Estado derivado
    hasQueue: state.queueSize > 0,
    hasFailedLogs: state.failedLogs.length > 0,
    isHealthy: state.totalErrors === 0 || 
      (state.totalProcessed + state.totalErrors > 0 && 
       state.totalProcessed / (state.totalProcessed + state.totalErrors) > 0.9),

    // Configuração
    config: {
      enableQueue,
      enableBackup,
      maxQueueSize,
      retryAttempts,
      retryDelay,
      batchSize
    }
  };
};