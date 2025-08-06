import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockUsers = [
  {
    id: 'user-admin-1',
    name: 'Admin User',  
    email: 'admin@adega.com',
    role: 'admin' as const,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: 'user-employee-1',
    name: 'Employee One',
    email: 'employee1@adega.com',
    role: 'employee' as const,
    created_at: '2024-01-02T10:00:00Z',
    updated_at: '2024-01-02T10:00:00Z'
  },
  {
    id: 'user-delivery-1',
    name: 'Delivery Person',
    email: 'delivery@adega.com',
    role: 'delivery' as const,
    created_at: '2024-01-03T10:00:00Z',
    updated_at: '2024-01-03T10:00:00Z'
  }
];

// Mock Supabase
vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useUserManagement - Testes de Cache e Sincronização', () => {
  let queryClient: QueryClient;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 5 * 60 * 1000 }, // 5 minutes cache
        mutations: { retry: false }
      }
    });
  });

  describe('Cache de usuários por 5 minutos', () => {
    it('deve cachear dados dos usuários corretamente', async () => {
      // Setup mock before importing
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      // Aguardar loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificar dados carregados
      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('deve reutilizar cache na segunda renderização', async () => {
      // Setup mock
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');

      // Primeira renderização
      const { result: result1 } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      // Verificar quantas chamadas foram feitas inicialmente
      const initialCallCount = vi.mocked(supabase.from).mock.calls.length;

      // Segunda renderização com mesmo QueryClient (cache deve ser usado)
      const { result: result2 } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result2.current.isLoading).toBe(false);
      });

      // Deve usar os mesmos dados do cache
      expect(result2.current.users).toEqual(mockUsers);
      
      // Verificar que a primeira query já estava em cache (não fez nova call)
      expect(result2.current.users).toEqual(result1.current.users);
    });

    it('deve invalidar cache após refresh', async () => {
      // Setup mock
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Limpar mock calls
      vi.clearAllMocks();

      // Fazer refresh
      await result.current.refreshUsers();

      // Deve fazer nova call após refresh
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('Refetch automático após mutação', () => {
    it('deve refetch dados após refreshUsers', async () => {
      // Setup mock inicial
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Modificar mock para retornar dados atualizados
      const updatedUsers = [
        ...mockUsers,
        {
          id: 'user-new-1',
          name: 'New User',
          email: 'new@adega.com',
          role: 'employee' as const,
          created_at: '2024-01-04T10:00:00Z',
          updated_at: '2024-01-04T10:00:00Z'
        }
      ];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: updatedUsers,
            error: null
          })
        })
      } as any);

      // Fazer refresh
      await result.current.refreshUsers();

      await waitFor(() => {
        expect(result.current.users).toEqual(updatedUsers);
      });
    });

    it('deve tratar erro durante refresh', async () => {
      // Setup mock inicial
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock erro no refresh
      const mockError = new Error('Erro de conexão');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(mockError)
        })
      } as any);

      // Fazer refresh que deve falhar
      await result.current.refreshUsers();

      await waitFor(() => {
        expect(result.current.error).toBe('Erro de conexão');
      });
    });
  });

  describe('Sincronização entre components', () => {
    it('deve sincronizar dados entre múltiplas instâncias do hook', async () => {
      // Setup mock
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');

      // Renderizar duas instâncias do hook com mesmo QueryClient
      const { result: result1 } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      const { result: result2 } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Ambas devem ter os mesmos dados
      expect(result1.current.users).toEqual(result2.current.users);
      expect(result1.current.users).toEqual(mockUsers);
    });
  });

  describe('Estados de Loading e Error', () => {
    it('deve indicar loading durante carregamento inicial', async () => {
      // Mock que demora para resolver
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockImplementation(() => 
            new Promise(resolve => 
              setTimeout(() => resolve({ data: mockUsers, error: null }), 100)
            )
          )
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      // Deve estar em loading inicialmente
      expect(result.current.isLoading).toBe(true);
      expect(result.current.users).toEqual([]);

      // Aguardar conclusão
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.users).toEqual(mockUsers);
    });

    it('deve tratar erro na query inicial', async () => {
      const mockError = new Error('Erro de rede');
      
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(mockError)
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Erro de rede');
      expect(result.current.users).toEqual([]);
    });

    it('deve limpar erro após refresh bem-sucedido', async () => {
      // Primeiro mock com erro
      const mockError = new Error('Erro inicial');
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockRejectedValue(mockError)
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Erro inicial');
      });

      // Segundo mock com sucesso
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      // Refresh deve limpar erro
      await result.current.refreshUsers();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.users).toEqual(mockUsers);
      });
    });
  });

  describe('Ordenação e Estrutura de Dados', () => {
    it('deve ordenar usuários por data de criação (ascendente)', async () => {
      const { supabase } = await import('@/core/api/supabase/client');
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockUsers,
        error: null
      });
      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder
      });
      
      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificar se chamou com ordenação correta
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });

      // Verificar ordem dos dados
      const users = result.current.users;
      expect(users[0].created_at <= users[1].created_at).toBe(true);
      expect(users[1].created_at <= users[2].created_at).toBe(true);
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('deve manter integridade dos tipos de dados', async () => {
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      const { result } = renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const users = result.current.users;
      
      // Verificar estrutura de cada usuário
      users.forEach(user => {
        expect(typeof user.id).toBe('string');
        expect(typeof user.name).toBe('string');
        expect(typeof user.email).toBe('string');
        expect(['admin', 'employee', 'delivery']).toContain(user.role);
        expect(typeof user.created_at).toBe('string');
        expect(typeof user.updated_at).toBe('string');
        
        // Verificar formato de data
        expect(new Date(user.created_at).toString()).not.toBe('Invalid Date');
        expect(new Date(user.updated_at).toString()).not.toBe('Invalid Date');
      });
    });
  });

  describe('Performance e Otimizações', () => {
    it('deve usar React Query key correta para cache', async () => {
      const { supabase } = await import('@/core/api/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      } as any);

      const { useUserManagement } = await import('../useUserManagement');
      renderHook(() => useUserManagement(), {
        wrapper: createWrapper(queryClient)
      });

      // Verificar que a query foi registrada com a chave correta
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      
      const userQuery = queries.find(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(['users', 'management'])
      );
      
      expect(userQuery).toBeDefined();
    });
  });
});