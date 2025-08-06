import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockSaleData = {
  customer_id: 'customer-1',
  payment_method_id: 'payment-1', 
  total_amount: 75.40,
  items: [
    { product_id: 'product-1', quantity: 1, unit_price: 29.90 },
    { product_id: 'product-2', quantity: 1, unit_price: 45.50 }
  ]
};

// Mock implementations
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'admin-user-id', email: 'admin@test.com' } },
      error: null
    })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null
        })
      }),
      in: vi.fn().mockReturnValue({
        then: vi.fn().mockResolvedValue({
          data: [{ id: 'product-1', stock_quantity: 100 }],
          error: null
        })
      }),
      order: vi.fn().mockReturnValue({
        then: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'sale-123', ...mockSaleData },
          error: null
        })
      })
    })
  }),
  rpc: vi.fn().mockResolvedValue({ data: true, error: null })
};

const mockToast = vi.fn();
const mockRecordCustomerEvent = vi.fn().mockResolvedValue({ success: true });

// Mocks
vi.mock('@/core/api/supabase/client', () => ({
  supabase: mockSupabase
}));

vi.mock('@/shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

vi.mock('@/features/customers/hooks/use-crm', () => ({
  recordCustomerEvent: mockRecordCustomerEvent
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useSales - Testes de Processamento de Venda', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false }
      }
    });
  });

  describe('useUpsertSale - Criação de Vendas', () => {
    it('deve processar venda completa com validações básicas', async () => {
      // Arrange: Mock successful responses
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn()
              .mockResolvedValueOnce({ data: { role: 'admin' }, error: null }) // profile
              .mockResolvedValueOnce({ data: { name: 'Dinheiro' }, error: null }) // payment method
          }),
          in: vi.fn().mockResolvedValue({
            data: [
              { id: 'product-1', stock_quantity: 100 },
              { id: 'product-2', stock_quantity: 50 }
            ],
            error: null
          })
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'sale-123', total_amount: 75.40 },
              error: null
            })
          })
        })
      });

      // Dynamic import to ensure mocks are applied
      const { useUpsertSale } = await import('../use-sales');
      const { result } = renderHook(() => useUpsertSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act
      let saleResult;
      await act(async () => {
        saleResult = await result.current.mutateAsync(mockSaleData);
      });

      // Assert
      expect(saleResult).toBeDefined();
      expect(saleResult.id).toBe('sale-123');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Venda registrada com sucesso!"
        })
      );
    });

    it('deve falhar quando usuário não tem permissão', async () => {
      // Arrange: Mock unauthorized user
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'delivery' }, // Não tem permissão
              error: null
            })
          })
        })
      });

      const { useUpsertSale } = await import('../use-sales');
      const { result } = renderHook(() => useUpsertSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.mutateAsync(mockSaleData))
          .rejects.toThrow('Você não tem permissão para criar vendas');
      });
    });

    it('deve falhar quando não há estoque suficiente', async () => {
      // Arrange: Create different mock function chains for different calls
      const mockFrom = vi.fn();
      const mockSelect = vi.fn();
      const mockEq = vi.fn();
      const mockSingle = vi.fn();
      const mockIn = vi.fn();

      // Setup for profiles table (role check)
      mockSingle
        .mockResolvedValueOnce({ data: { role: 'admin' }, error: null }) // profile check
        .mockResolvedValueOnce({ data: { name: 'Dinheiro' }, error: null }) // payment method

      // Setup for products table (stock check)
      mockIn.mockResolvedValue({
        data: [
          { id: 'product-1', stock_quantity: 0 }, // Sem estoque
          { id: 'product-2', stock_quantity: 50 }
        ],
        error: null
      });

      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ 
        eq: mockEq,
        in: mockIn
      });
      mockFrom.mockReturnValue({ 
        select: mockSelect,
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      });

      mockSupabase.from = mockFrom;

      const { useUpsertSale } = await import('../use-sales');
      const { result } = renderHook(() => useUpsertSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.mutateAsync(mockSaleData))
          .rejects.toThrow('não têm estoque suficiente');
      });
    });
  });

  describe('useDeleteSale - Exclusão de Vendas', () => {
    it('deve permitir exclusão por administrador', async () => {
      // Arrange: Mock admin user and successful deletion
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'admin' },
              error: null
            })
          })
        })
      });

      mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

      const { useDeleteSale } = await import('../use-sales');
      const { result } = renderHook(() => useDeleteSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act
      await act(async () => {
        await result.current.mutateAsync('sale-123');
      });

      // Assert
      expect(mockSupabase.rpc).toHaveBeenCalledWith('delete_sale_with_items', {
        p_sale_id: 'sale-123'
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Venda excluída com sucesso!"
        })
      );
    });

    it('deve negar exclusão por funcionário', async () => {
      // Arrange: Mock employee user (not admin)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'employee' },
              error: null
            })
          })
        })
      });

      const { useDeleteSale } = await import('../use-sales');
      const { result } = renderHook(() => useDeleteSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.mutateAsync('sale-123'))
          .rejects.toThrow('Apenas administradores podem excluir vendas');
      });
    });
  });

  describe('useSales - Consulta de Vendas', () => {
    it('deve buscar vendas com dados formatados', async () => {
      // Arrange: Mock comprehensive sales query chain
      const mockOrder = vi.fn().mockResolvedValue({
        data: [
          {
            id: 'sale-1',
            customer_id: 'customer-1',
            user_id: 'user-1',
            seller_id: 'user-1',
            total_amount: 59.80,
            discount_amount: 0,
            final_amount: 59.80,
            payment_method: 'Dinheiro',
            payment_status: 'paid',
            status: 'completed',
            delivery: false,
            delivery_address: null,
            delivery_user_id: null,
            notes: null,
            created_at: '2024-08-01T10:00:00Z',
            updated_at: '2024-08-01T10:00:00Z'
          }
        ],
        error: null
      });

      const mockSelect = vi.fn().mockReturnValue({
        order: mockOrder
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'sales') {
          return { select: mockSelect };
        }
        // Mock for other tables that might be queried
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        };
      });

      const { useSales } = await import('../use-sales');
      const { result } = renderHook(() => useSales(), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 5000 });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });

  describe('usePaymentMethods - Métodos de Pagamento', () => {
    it('deve buscar métodos de pagamento ativos', async () => {
      // Arrange: Mock payment methods
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                { id: '1', name: 'Dinheiro', is_active: true },
                { id: '2', name: 'Cartão', is_active: true }
              ],
              error: null
            })
          })
        })
      });

      const { usePaymentMethods } = await import('../use-sales');
      const { result } = renderHook(() => usePaymentMethods(), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].name).toBe('Dinheiro');
    });
  });

  describe('Validações de Negócio', () => {
    it('deve rejeitar venda sem itens', async () => {
      // Arrange: Mock successful auth/permission checks
      const mockFrom = vi.fn();
      const mockSelect = vi.fn();
      const mockEq = vi.fn();
      const mockSingle = vi.fn();
      const mockInsert = vi.fn();

      // Setup successful auth checks
      mockSingle
        .mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
        .mockResolvedValueOnce({ data: { name: 'Dinheiro' }, error: null });

      mockInsert.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'sale-123' },
            error: null
          })
        })
      });

      mockEq.mockReturnValue({ single: mockSingle });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ 
        select: mockSelect,
        insert: mockInsert
      });

      mockSupabase.from = mockFrom;

      const saleWithoutItems = {
        customer_id: 'customer-1',
        payment_method_id: 'payment-1',
        total_amount: 0,
        items: [] // Sem itens
      };

      const { useUpsertSale } = await import('../use-sales');
      const { result } = renderHook(() => useUpsertSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert
      await act(async () => {
        await expect(result.current.mutateAsync(saleWithoutItems))
          .rejects.toThrow('A venda deve conter pelo menos um item');
      });
    });

    it('deve permitir venda sem cliente (balcão)', async () => {
      // Arrange: Mock successful responses
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn()
              .mockResolvedValueOnce({ data: { role: 'admin' }, error: null })
              .mockResolvedValueOnce({ data: { name: 'Dinheiro' }, error: null })
          }),
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'product-1', stock_quantity: 100 }],
            error: null
          })
        }),
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'sale-balcao', customer_id: null },
              error: null
            })
          })
        })
      });

      const balcaoSale = {
        customer_id: null, // Venda sem cliente
        payment_method_id: 'payment-1',
        total_amount: 29.90,
        items: [{ product_id: 'product-1', quantity: 1, unit_price: 29.90 }]
      };

      const { useUpsertSale } = await import('../use-sales');
      const { result } = renderHook(() => useUpsertSale(), {
        wrapper: createWrapper(queryClient)
      });

      // Act
      let saleResult;
      await act(async () => {
        saleResult = await result.current.mutateAsync(balcaoSale);
      });

      // Assert
      expect(saleResult).toBeDefined();
      expect(saleResult.customer_id).toBeNull();
    });
  });
});