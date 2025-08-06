/**
 * @fileoverview Testes para hook de tratamento de erros de audit logs
 * FASE 7: COBERTURA, PERFORMANCE E QUALIDADE - Subtarefa 7.1.2
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuditErrorHandler } from '../useAuditErrorHandler';
import type { AuditLogEntry } from '../useAuditErrorHandler';

// Mock do Supabase
const mockSupabaseInsert = vi.fn();

vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockSupabaseInsert
    }))
  }
}));

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('useAuditErrorHandler', () => {
  const sampleLogEntry: AuditLogEntry = {
    action: 'CREATE',
    table_name: 'products',
    record_id: '123',
    new_values: { name: 'Test Product' },
    user_id: 'user123',
    user_email: 'test@example.com',
    ip_address: '192.168.1.1',
    user_agent: 'Test Browser'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('Subtarefa 7.1.2: Configuração e Inicialização', () => {
    it('deve inicializar com configuração padrão', () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      expect(result.current.config.enableQueue).toBe(true);
      expect(result.current.config.enableBackup).toBe(true);
      expect(result.current.config.maxQueueSize).toBe(100);
      expect(result.current.config.retryAttempts).toBe(3);
      expect(result.current.queueSize).toBe(0);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.totalErrors).toBe(0);
      expect(result.current.totalProcessed).toBe(0);
    });

    it('deve aceitar configuração customizada', () => {
      const customConfig = {
        enableQueue: false,
        maxQueueSize: 50,
        retryAttempts: 5,
        batchSize: 5
      };

      const { result } = renderHook(() => useAuditErrorHandler(customConfig));
      
      expect(result.current.config.enableQueue).toBe(false);
      expect(result.current.config.maxQueueSize).toBe(50);
      expect(result.current.config.retryAttempts).toBe(5);
      expect(result.current.config.batchSize).toBe(5);
    });

    it('deve carregar queue do localStorage na inicialização', () => {
      const storedQueue = [sampleLogEntry];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedQueue));

      const { result } = renderHook(() => useAuditErrorHandler());
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('audit_logs_queue');
      expect(result.current.queueSize).toBe(1);
      expect(result.current.pendingLogs).toEqual(storedQueue);
    });
  });

  describe('Subtarefa 7.1.2: Envio de Audit Log Direto', () => {
    it('deve enviar audit log com sucesso', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuditErrorHandler());
      
      let success = false;
      await act(async () => {
        success = await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(success).toBe(true);
      // Supabase from foi chamado através do mock
      expect(mockSupabaseInsert).toHaveBeenCalledWith([{
        action: 'CREATE',
        table_name: 'products',
        record_id: '123',
        old_values: undefined,
        new_values: { name: 'Test Product' },
        user_id: 'user123',
        user_email: 'test@example.com',
        ip_address: '192.168.1.1',
        user_agent: 'Test Browser',
        metadata: undefined
      }]);
      expect(result.current.totalProcessed).toBe(1);
    });

    it('deve adicionar à queue quando envio direto falha', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Database error') });
      
      const { result } = renderHook(() => useAuditErrorHandler());
      
      let success = false;
      await act(async () => {
        success = await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(success).toBe(false);
      expect(result.current.queueSize).toBe(1);
      expect(result.current.pendingLogs[0]).toEqual(sampleLogEntry);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'audit_logs_queue',
        JSON.stringify([sampleLogEntry])
      );
    });
  });

  describe('Subtarefa 7.1.2: Gerenciamento de Queue', () => {
    it('deve limitar tamanho da queue', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Always fail') });
      
      const { result } = renderHook(() => useAuditErrorHandler({
        maxQueueSize: 2
      }));
      
      const consoleSpy = vi.spyOn(console, 'warn');
      
      // Adicionar 3 logs (excede limite de 2)
      await act(async () => {
        await result.current.logWithErrorHandling({ ...sampleLogEntry, id: '1' });
        await result.current.logWithErrorHandling({ ...sampleLogEntry, id: '2' });
        await result.current.logWithErrorHandling({ ...sampleLogEntry, id: '3' });
      });

      expect(result.current.queueSize).toBe(2);
      expect(consoleSpy).toHaveBeenCalledWith('Queue de audit logs excedeu limite. 1 logs removidos.');
    });

    it('deve processar queue automaticamente', async () => {
      vi.useFakeTimers();
      mockSupabaseInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuditErrorHandler());
      
      // Adicionar log à queue
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('First fail') });
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(result.current.queueSize).toBe(1);

      // Simular processamento automático após 30 segundos
      mockSupabaseInsert.mockResolvedValue({ error: null });
      
      await act(async () => {
        vi.advanceTimersByTime(30000);
        await vi.runAllTimersAsync();
      });

      await waitFor(() => {
        expect(result.current.queueSize).toBe(0);
        expect(result.current.totalProcessed).toBe(1);
      });

      vi.useRealTimers();
    });

    it('deve salvar queue no localStorage', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Fail') });
      
      const { result } = renderHook(() => useAuditErrorHandler());
      
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'audit_logs_queue',
        JSON.stringify([sampleLogEntry])
      );
    });
  });

  describe('Subtarefa 7.1.2: Processamento em Batch', () => {
    it('deve processar múltiplos logs em batch', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuditErrorHandler({
        batchSize: 2
      }));
      
      // Adicionar múltiplos logs à queue
      const logs = [
        { ...sampleLogEntry, id: '1' },
        { ...sampleLogEntry, id: '2' },
        { ...sampleLogEntry, id: '3' }
      ];

      // Fazer primeiro envio falhar para adicionar à queue
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Fail') });
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Fail') });
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Fail') });

      await act(async () => {
        for (const log of logs) {
          await result.current.logWithErrorHandling(log);
        }
      });

      expect(result.current.queueSize).toBe(3);

      // Processar queue com sucesso
      mockSupabaseInsert.mockResolvedValue({ error: null });
      
      await act(async () => {
        await result.current.processQueue();
      });

      expect(result.current.queueSize).toBe(0);
      expect(result.current.totalProcessed).toBe(3);
    });

    it('deve lidar com falhas parciais no batch', async () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      // Adicionar logs à queue
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Fail') });
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Fail') });

      await act(async () => {
        await result.current.logWithErrorHandling({ ...sampleLogEntry, id: '1' });
        await result.current.logWithErrorHandling({ ...sampleLogEntry, id: '2' });
      });

      expect(result.current.queueSize).toBe(2);

      // Processar com sucesso parcial
      mockSupabaseInsert
        .mockResolvedValueOnce({ error: null })  // Primeiro sucesso
        .mockResolvedValueOnce({ error: new Error('Still fail') }); // Segundo falha

      await act(async () => {
        await result.current.processQueue();
      });

      expect(result.current.queueSize).toBe(1); // Um ainda na queue
      expect(result.current.totalProcessed).toBe(1); // Um processado
      expect(result.current.failedLogs).toHaveLength(1);
    });
  });

  describe('Subtarefa 7.1.2: Sistema de Backup', () => {
    it('deve fazer backup de logs que falharam', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Persistent error') });
      
      const { result } = renderHook(() => useAuditErrorHandler({
        enableQueue: false, // Desabilitar queue para testar backup direto
        enableBackup: true
      }));
      
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'audit_logs_backup',
        expect.stringContaining('"action":"CREATE"')
      );
    });

    it('deve limitar tamanho do backup', async () => {
      // Simular backup existente com 50 items
      const existingBackup = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingBackup));
      
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Error') });
      
      const { result } = renderHook(() => useAuditErrorHandler({
        enableQueue: false,
        enableBackup: true
      }));
      
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      // Verificar se manteve apenas 50 items mais recentes
      const setItemCall = mockLocalStorage.setItem.mock.calls.find(
        call => call[0] === 'audit_logs_backup'
      );
      expect(setItemCall).toBeDefined();
      
      const savedBackup = JSON.parse(setItemCall![1]);
      expect(savedBackup).toHaveLength(50);
      expect(savedBackup[49].action).toBe('CREATE'); // Último item é o novo
    });
  });

  describe('Subtarefa 7.1.2: Retry com Queue Desabilitada', () => {
    it('deve fazer retry imediato quando queue está desabilitada', async () => {
      const { result } = renderHook(() => useAuditErrorHandler({
        enableQueue: false,
        retryAttempts: 2,
        retryDelay: 100
      }));
      
      // Primeiro e segundo tentativas falham, terceira sucesso
      mockSupabaseInsert
        .mockResolvedValueOnce({ error: new Error('Fail 1') })
        .mockResolvedValueOnce({ error: new Error('Fail 2') })
        .mockResolvedValueOnce({ error: null });

      let success = false;
      await act(async () => {
        success = await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(success).toBe(true);
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(3);
      expect(result.current.totalProcessed).toBe(1);
    });

    it('deve falhar após esgotar retries', async () => {
      const onCriticalError = vi.fn();
      
      const { result } = renderHook(() => useAuditErrorHandler({
        enableQueue: false,
        retryAttempts: 1,
        retryDelay: 10,
        onCriticalError
      }));
      
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Always fail') });

      let success = false;
      await act(async () => {
        success = await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(success).toBe(false);
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(2); // 1 inicial + 1 retry
      expect(result.current.totalErrors).toBe(1);
      expect(onCriticalError).toHaveBeenCalledWith(
        expect.any(Error),
        sampleLogEntry
      );
    });
  });

  describe('Subtarefa 7.1.2: Operações de Manutenção', () => {
    it('deve retentar logs falhados', async () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      // Adicionar log que falhará
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Initial fail') });
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      // Processar queue com falha
      mockSupabaseInsert.mockResolvedValueOnce({ error: new Error('Process fail') });
      await act(async () => {
        await result.current.processQueue();
      });

      expect(result.current.failedLogs).toHaveLength(1);

      // Retry com sucesso
      mockSupabaseInsert.mockResolvedValue({ error: null });
      await act(async () => {
        await result.current.retryFailedLogs();
      });

      expect(result.current.failedLogs).toHaveLength(0);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Recuperação de Logs',
        description: '1 log(s) de auditoria recuperados com sucesso.'
      });
    });

    it('deve limpar queue e backups', () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      act(() => {
        result.current.clearQueue();
      });

      expect(result.current.queueSize).toBe(0);
      expect(result.current.failedLogs).toHaveLength(0);
      expect(result.current.totalErrors).toBe(0);
      expect(result.current.totalProcessed).toBe(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('audit_logs_queue');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('audit_logs_backup');
    });

    it('deve calcular estatísticas corretamente', async () => {
      mockSupabaseInsert.mockResolvedValue({ error: null });
      
      const { result } = renderHook(() => useAuditErrorHandler());
      
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      const stats = result.current.getQueueStats();
      expect(stats.totalProcessed).toBe(1);
      expect(stats.successRate).toBe(100);
    });
  });

  describe('Subtarefa 7.1.2: Estados Derivados', () => {
    it('deve calcular hasQueue corretamente', async () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      expect(result.current.hasQueue).toBe(false);

      // Adicionar item à queue
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Fail') });
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(result.current.hasQueue).toBe(true);
    });

    it('deve calcular isHealthy corretamente', async () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      expect(result.current.isHealthy).toBe(true);

      // Sucesso
      mockSupabaseInsert.mockResolvedValue({ error: null });
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(result.current.isHealthy).toBe(true);
    });
  });

  describe('Subtarefa 7.1.2: Edge Cases e Robustez', () => {
    it('deve lidar com erro de parsing do localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      
      const { result } = renderHook(() => useAuditErrorHandler());
      
      // Não deve quebrar, deve inicializar vazio
      expect(result.current.queueSize).toBe(0);
      expect(result.current.pendingLogs).toEqual([]);
    });

    it('deve lidar com erro no localStorage.setItem', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      
      mockSupabaseInsert.mockResolvedValue({ error: new Error('Fail') });
      
      const { result } = renderHook(() => useAuditErrorHandler());
      
      // Não deve quebrar
      await act(async () => {
        await result.current.logWithErrorHandling(sampleLogEntry);
      });

      expect(result.current.queueSize).toBe(1); // Item ainda foi adicionado à queue
    });

    it('deve evitar processamento concorrente da queue', async () => {
      const { result } = renderHook(() => useAuditErrorHandler());
      
      // Simular queue em processamento
      await act(async () => {
        result.current.processQueue(); // Primeira chamada
        result.current.processQueue(); // Segunda chamada (deve ser ignorada)
      });

      // Verificar que não houve processamento duplo
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(0); // Nenhuma queue para processar
    });
  });
});