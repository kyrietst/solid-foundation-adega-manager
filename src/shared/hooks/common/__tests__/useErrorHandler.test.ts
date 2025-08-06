/**
 * @fileoverview Testes para hook de tratamento de erros
 * FASE 7: COBERTURA, PERFORMANCE E QUALIDADE - Subtarefa 7.1.2
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  useErrorHandler, 
  useDatabaseErrorHandler, 
  useApiErrorHandler, 
  useValidationErrorHandler 
} from '../useErrorHandler';

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Subtarefa 7.1.2: Tratamento Básico de Erros', () => {
    it('deve tratar erro simples com configuração padrão', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('Erro de teste'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro de teste',
        variant: 'destructive'
      });
    });

    it('deve categorizar erro de rede corretamente', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('network timeout'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Problema de conexão. Verifique sua internet.',
        variant: 'destructive'
      });
    });

    it('deve categorizar erro de autorização corretamente', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('unauthorized access'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Sessão expirada. Faça login novamente.',
        variant: 'destructive'
      });
    });

    it('deve categorizar erro de validação corretamente', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('validation failed'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Dados inválidos. Verifique as informações.',
        variant: 'destructive'
      });
    });

    it('deve tratar diferentes tipos de erro', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      // String error
      act(() => {
        result.current.handleError('Erro em string');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro em string',
        variant: 'destructive'
      });

      // Object error
      act(() => {
        result.current.handleError({ message: 'Erro em objeto' });
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro em objeto',
        variant: 'destructive'
      });

      // Unknown error
      act(() => {
        result.current.handleError(null);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro desconhecido',
        variant: 'destructive'
      });
    });
  });

  describe('Subtarefa 7.1.2: Configuração Personalizada', () => {
    it('deve respeitar configuração personalizada', () => {
      const { result } = renderHook(() => useErrorHandler({
        toastTitle: 'Erro Personalizado',
        toastDescription: 'Descrição personalizada',
        showToast: true,
        logError: false
      }));
      
      act(() => {
        result.current.handleError(new Error('Qualquer erro'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro Personalizado',
        description: 'Qualquer erro', // Mensagem do erro tem prioridade
        variant: 'destructive'
      });
    });

    it('deve desabilitar toast quando configurado', () => {
      const { result } = renderHook(() => useErrorHandler({
        showToast: false
      }));
      
      act(() => {
        result.current.handleError(new Error('Erro sem toast'));
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve desabilitar logging quando configurado', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      const { result } = renderHook(() => useErrorHandler({
        logError: false
      }));
      
      act(() => {
        result.current.handleError(new Error('Erro sem log'));
      });

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('Subtarefa 7.1.2: Funções Assíncronas com Retry', () => {
    it('deve executar função assíncrona com sucesso', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockAsyncFn = vi.fn().mockResolvedValue('success');
      
      let returnValue: string | null = null;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(mockAsyncFn);
      });

      expect(returnValue).toBe('success');
      expect(mockAsyncFn).toHaveBeenCalledTimes(1);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve fazer retry em função assíncrona quando habilitado', async () => {
      const { result } = renderHook(() => useErrorHandler({
        retryable: true,
        maxRetries: 2
      }));
      
      const mockAsyncFn = vi.fn()
        .mockRejectedValueOnce(new Error('Erro temporário'))
        .mockRejectedValueOnce(new Error('Erro temporário'))
        .mockResolvedValueOnce('success');
      
      let returnValue: string | null = null;
      await act(async () => {
        returnValue = await result.current.handleAsyncError(mockAsyncFn);
      });

      expect(returnValue).toBe('success');
      expect(mockAsyncFn).toHaveBeenCalledTimes(3);
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve falhar após esgotar tentativas de retry', async () => {
      const { result } = renderHook(() => useErrorHandler({
        retryable: true,
        maxRetries: 2
      }));
      
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Erro persistente'));
      
      let returnValue: string | null = 'initial';
      await act(async () => {
        returnValue = await result.current.handleAsyncError(mockAsyncFn);
      });

      expect(returnValue).toBeNull();
      expect(mockAsyncFn).toHaveBeenCalledTimes(3); // 1 tentativa inicial + 2 retries
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro persistente',
        variant: 'destructive'
      });
    });

    it('deve respeitar delay exponencial entre retries', async () => {
      const { result } = renderHook(() => useErrorHandler({
        retryable: true,
        maxRetries: 1
      }));
      
      const mockAsyncFn = vi.fn().mockRejectedValue(new Error('Erro'));
      const startTime = Date.now();
      
      await act(async () => {
        await result.current.handleAsyncError(mockAsyncFn);
      });

      const endTime = Date.now();
      const elapsed = endTime - startTime;
      
      // Deve ter esperado pelo menos 2 segundos (delay exponencial)
      expect(elapsed).toBeGreaterThan(1900); // Margem para variações
      expect(mockAsyncFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Subtarefa 7.1.2: Higher-Order Function com Error Handling', () => {
    it('deve wrappear função síncrona com error handling', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockFn = vi.fn().mockReturnValue('success');
      
      const wrappedFn = result.current.withErrorHandling(mockFn);
      const returnValue = await wrappedFn('arg1', 'arg2');

      expect(returnValue).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve wrappear função assíncrona com error handling', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockAsyncFn = vi.fn().mockResolvedValue('async success');
      
      const wrappedFn = result.current.withErrorHandling(mockAsyncFn);
      const returnValue = await wrappedFn('arg1');

      expect(returnValue).toBe('async success');
      expect(mockAsyncFn).toHaveBeenCalledWith('arg1');
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('deve capturar erro em função wrapeada', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Erro na função');
      });
      
      const wrappedFn = result.current.withErrorHandling(mockFn);
      const returnValue = await wrappedFn();

      expect(returnValue).toBeNull();
      expect(mockFn).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro',
        description: 'Erro na função',
        variant: 'destructive'
      });
    });
  });

  describe('Subtarefa 7.1.2: Contexto de Erro', () => {
    it('deve incluir contexto no log de erro', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const { result } = renderHook(() => useErrorHandler());
      
      const context = {
        operation: 'test_operation',
        data: { id: 123 },
        retryCount: 1
      };
      
      act(() => {
        result.current.handleError(new Error('Erro com contexto'), context);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Error Handler:', expect.objectContaining({
        error: expect.any(Error),
        context,
        category: 'unknown',
        timestamp: expect.any(String)
      }));
    });
  });

  describe('Subtarefa 7.1.2: Categorização Específica de Erros', () => {
    const errorCategories = [
      { input: 'fetch failed', expected: 'Problema de conexão. Verifique sua internet.' },
      { input: 'request timeout', expected: 'Operação demorou muito. Tente novamente.' },
      { input: '401 unauthorized', expected: 'Sessão expirada. Faça login novamente.' },
      { input: '403 forbidden', expected: 'Você não tem permissão para esta operação.' },
      { input: '404 not found', expected: 'Recurso não encontrado.' },
      { input: 'invalid data', expected: 'Dados inválidos. Verifique as informações.' }
    ];

    errorCategories.forEach(({ input, expected }) => {
      it(`deve categorizar "${input}" corretamente`, () => {
        const { result } = renderHook(() => useErrorHandler());
        
        act(() => {
          result.current.handleError(new Error(input));
        });

        expect(mockToast).toHaveBeenCalledWith({
          title: 'Erro',
          description: expected,
          variant: 'destructive'
        });
      });
    });
  });
});

describe('Hooks Especializados de Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDatabaseErrorHandler', () => {
    it('deve usar configuração específica para banco de dados', () => {
      const { result } = renderHook(() => useDatabaseErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('Database connection failed'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro de Banco de Dados',
        description: 'Database connection failed',
        variant: 'destructive'
      });
    });
  });

  describe('useApiErrorHandler', () => {
    it('deve usar configuração específica para API', () => {
      const { result } = renderHook(() => useApiErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('API request failed'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Erro de Conexão',
        description: 'API request failed',
        variant: 'destructive'
      });
    });
  });

  describe('useValidationErrorHandler', () => {
    it('deve usar configuração específica para validação', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const { result } = renderHook(() => useValidationErrorHandler());
      
      act(() => {
        result.current.handleError(new Error('Validation error'));
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Dados Inválidos',
        description: 'Validation error',
        variant: 'destructive'
      });
      
      // Não deve fazer log de erros de validação
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });
});

describe('Edge Cases e Robustez', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve lidar com erro durante o próprio error handling', () => {
    const { result } = renderHook(() => useErrorHandler({
      showToast: false,  // Desabilitar toast para testar robustez de logging
      logError: true
    }));
    
    // Mock console.error para falhar
    const originalConsoleError = console.error;
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {
      throw new Error('Logging failed');
    });
    
    // Não deve quebrar o sistema mesmo se logging falhar
    expect(() => {
      act(() => {
        result.current.handleError(new Error('Original error'));
      });
    }).not.toThrow();
    
    mockConsoleError.mockRestore();
  });

  it('deve funcionar com função que retorna undefined', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockFn = vi.fn().mockReturnValue(undefined);
    
    const wrappedFn = result.current.withErrorHandling(mockFn);
    const returnValue = await wrappedFn();

    expect(returnValue).toBeUndefined();
    expect(mockFn).toHaveBeenCalled();
  });

  it('deve lidar com função assíncrona que resolve undefined', async () => {
    const { result } = renderHook(() => useErrorHandler());
    const mockAsyncFn = vi.fn().mockResolvedValue(undefined);
    
    const returnValue = await act(async () => {
      return await result.current.handleAsyncError(mockAsyncFn);
    });

    expect(returnValue).toBeUndefined();
    expect(mockAsyncFn).toHaveBeenCalled();
  });
});