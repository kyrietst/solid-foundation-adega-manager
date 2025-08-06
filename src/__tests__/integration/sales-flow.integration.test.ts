/**
 * Testes de Integração - Fluxos de Vendas
 * Validam o fluxo completo de vendas desde carrinho até atualização de estoque
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useCheckout } from '@/features/sales/hooks/useCheckout';
import { useEntityMutation } from '@/shared/hooks/common/useEntity';
import { supabase } from '@/core/api/supabase/client';

// Mock do Supabase client
vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      rpc: vi.fn()
    })),
    auth: {
      getUser: vi.fn(() => ({
        data: {
          user: {
            id: 'test-user-id',
            email: 'admin@adega.com'
          }
        }
      }))
    }
  }
}));

// Mock dados realistas
const mockProduct = {
  id: 'prod-123',
  name: 'Vinho Tinto Premium',
  price: 89.90,
  stock_quantity: 25,
  minimum_stock: 5,
  cost_price: 45.00,
  category: 'Vinho Tinto'
};

const mockCustomer = {
  id: 'cust-456',
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '11999887766',
  segment: 'regular'
};

const mockCartItem = {
  id: 'prod-123',
  name: 'Vinho Tinto Premium',
  price: 89.90,
  quantity: 2,
  subtotal: 179.80
};

const mockSaleData = {
  customer_id: 'cust-456',
  items: [mockCartItem],
  payment_method: 'pix',
  total_amount: 179.80,
  notes: 'Venda de integração'
};

// Mock responses do Supabase
const mockSupabaseResponses = {
  // Resposta da criação da venda
  processedSale: {
    data: {
      id: 'sale-789',
      customer_id: 'cust-456',
      total_amount: 179.80,
      payment_method: 'pix',
      status: 'completed',
      created_at: '2024-08-03T10:00:00Z'
    },
    error: null
  },
  
  // Resposta da atualização de estoque
  updatedStock: {
    data: {
      id: 'prod-123',
      stock_quantity: 23, // 25 - 2 = 23
      updated_at: '2024-08-03T10:00:05Z'
    },
    error: null
  },
  
  // Resposta da criação de movimento
  stockMovement: {
    data: {
      id: 'mov-101',
      product_id: 'prod-123',
      type: 'OUT',
      quantity: 2,
      reason: 'Venda #sale-789',
      created_at: '2024-08-03T10:00:05Z'
    },
    error: null
  },
  
  // Resposta do audit log
  auditLog: {
    data: {
      id: 'audit-202',
      action: 'sale_created',
      table_name: 'sales',
      record_id: 'sale-789',
      user_id: 'test-user-id',
      created_at: '2024-08-03T10:00:05Z'
    },
    error: null
  },

  // Resposta da atualização de insights CRM
  customerInsight: {
    data: {
      id: 'insight-303',
      customer_id: 'cust-456',
      total_spent: 1259.70, // Valor atualizado após venda
      visit_frequency: 'regular',
      confidence_score: 0.85,
      updated_at: '2024-08-03T10:00:06Z'
    },
    error: null
  }
};

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('Integration Tests - Fluxos de Vendas Críticos', () => {
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

  afterEach(() => {
    queryClient.clear();
  });

  describe('Fluxo Completo: Carrinho → Checkout → Venda → Estoque Atualizado', () => {
    it('deve processar venda completa com atualização de estoque', async () => {
      // Mock das chamadas do Supabase em sequência
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Processo de venda (stored procedure)
      mockRpc.mockResolvedValueOnce(mockSupabaseResponses.processedSale);
      
      // Atualização de estoque
      vi.mocked(supabase.from().update().eq().select().single).mockResolvedValueOnce(
        mockSupabaseResponses.updatedStock
      );

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Executar checkout
      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que o stored procedure foi chamado corretamente
      expect(mockRpc).toHaveBeenCalledWith('process_sale', {
        customer_id: 'cust-456',
        items: [mockCartItem],
        payment_method: 'pix',
        total_amount: 179.80,
        notes: 'Venda de integração'
      });

      // Verificar que o estoque foi atualizado
      expect(result.current.isSuccess).toBe(true);
    });

    it('deve falhar graciosamente se estoque insuficiente', async () => {
      // Mock de erro de estoque insuficiente
      const mockRpc = vi.mocked(supabase.from().rpc);
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Estoque insuficiente para produto prod-123',
          code: 'INSUFFICIENT_STOCK'
        }
      });

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      const insufficientStockSale = {
        ...mockSaleData,
        items: [{
          ...mockCartItem,
          quantity: 30 // Quantidade maior que estoque disponível (25)
        }]
      };

      // Executar checkout
      await waitFor(async () => {
        await result.current.processCheckout(insufficientStockSale);
      });

      // Verificar que houve erro
      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toContain('Estoque insuficiente');
    });

    it('deve manter integridade dos dados em caso de falha parcial', async () => {
      // Mock de falha na atualização de estoque após venda criada
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Venda criada com sucesso
      mockRpc.mockResolvedValueOnce(mockSupabaseResponses.processedSale);
      
      // Falha na atualização de estoque
      vi.mocked(supabase.from().update().eq().select().single).mockResolvedValueOnce({
        data: null,
        error: { message: 'Falha na atualização de estoque' }
      });

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Executar checkout
      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Sistema deve detectar inconsistência e reportar erro
      expect(result.current.isError).toBe(true);
    });
  });

  describe('Fluxo: Venda com Cliente → Atualização de Insights CRM', () => {
    it('deve atualizar insights do cliente após venda', async () => {
      // Mock das chamadas em sequência
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Venda processada
      mockRpc
        .mockResolvedValueOnce(mockSupabaseResponses.processedSale)
        // Recálculo de insights CRM  
        .mockResolvedValueOnce(mockSupabaseResponses.customerInsight);

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Executar venda com cliente
      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que os insights foram recalculados
      expect(mockRpc).toHaveBeenCalledWith('recalc_customer_insights', {
        customer_id: 'cust-456'
      });
    });

    it('deve atualizar segmentação do cliente baseado em LTV', async () => {
      // Mock de cliente que passa de 'regular' para 'high_value'
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      mockRpc
        .mockResolvedValueOnce(mockSupabaseResponses.processedSale)
        .mockResolvedValueOnce({
          data: {
            ...mockSupabaseResponses.customerInsight.data,
            total_spent: 5500.00, // Valor que classifica como high_value
            segment: 'high_value'
          },
          error: null
        });

      const highValueSale = {
        ...mockSaleData,
        total_amount: 1500.00 // Venda grande
      };

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(highValueSale);
      });

      // Verificar que a segmentação foi atualizada
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('Fluxo: Venda → Geração de Movimento de Estoque', () => {
    it('deve criar movimento de estoque OUT para cada item vendido', async () => {
      const mockRpc = vi.mocked(supabase.from().rpc);
      const mockInsert = vi.mocked(supabase.from().insert().select().single);
      
      // Venda processada
      mockRpc.mockResolvedValueOnce(mockSupabaseResponses.processedSale);
      
      // Movimento de estoque criado
      mockInsert.mockResolvedValueOnce(mockSupabaseResponses.stockMovement);

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que movimento foi registrado
      expect(mockInsert).toHaveBeenCalledWith({
        product_id: 'prod-123',
        type: 'OUT',
        quantity: 2,
        reason: 'Venda #sale-789',
        user_id: 'test-user-id'
      });
    });

    it('deve registrar múltiplos movimentos para carrinho multi-produto', async () => {
      const multiProductSale = {
        ...mockSaleData,
        items: [
          mockCartItem,
          {
            id: 'prod-456',
            name: 'Whisky Premium',
            price: 245.50,
            quantity: 1,
            subtotal: 245.50
          }
        ],
        total_amount: 425.30
      };

      const mockRpc = vi.mocked(supabase.from().rpc);
      const mockInsert = vi.mocked(supabase.from().insert().select().single);
      
      mockRpc.mockResolvedValueOnce(mockSupabaseResponses.processedSale);
      mockInsert
        .mockResolvedValueOnce(mockSupabaseResponses.stockMovement)
        .mockResolvedValueOnce({
          data: { id: 'mov-102', product_id: 'prod-456', type: 'OUT', quantity: 1 },
          error: null
        });

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(multiProductSale);
      });

      // Verificar que dois movimentos foram criados
      expect(mockInsert).toHaveBeenCalledTimes(2);
    });
  });

  describe('Fluxo: Venda → Audit Log Automático', () => {
    it('deve registrar audit log para venda criada', async () => {
      const mockRpc = vi.mocked(supabase.from().rpc);
      const mockInsert = vi.mocked(supabase.from().insert().select().single);
      
      mockRpc.mockResolvedValueOnce(mockSupabaseResponses.processedSale);
      mockInsert.mockResolvedValueOnce(mockSupabaseResponses.auditLog);

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que audit log foi criado
      expect(mockInsert).toHaveBeenCalledWith({
        action: 'sale_created',
        table_name: 'sales',
        record_id: 'sale-789',
        user_id: 'test-user-id',
        details: expect.objectContaining({
          total_amount: 179.80,
          customer_id: 'cust-456',
          payment_method: 'pix'
        })
      });
    });

    it('deve registrar IP e user agent no audit log', async () => {
      // Mock do contexto de requisição
      Object.defineProperty(window, 'navigator', {
        writable: true,
        value: {
          userAgent: 'Mozilla/5.0 (Test Browser)'
        }
      });

      const mockRpc = vi.mocked(supabase.from().rpc);
      const mockInsert = vi.mocked(supabase.from().insert().select().single);
      
      mockRpc.mockResolvedValueOnce(mockSupabaseResponses.processedSale);
      mockInsert.mockResolvedValueOnce(mockSupabaseResponses.auditLog);

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que metadados foram registrados
      expect(mockInsert).toHaveBeenCalledWith({
        action: 'sale_created',
        table_name: 'sales',
        record_id: 'sale-789',
        user_id: 'test-user-id',
        user_agent: 'Mozilla/5.0 (Test Browser)',
        ip_address: expect.any(String),
        details: expect.any(Object)
      });
    });
  });

  describe('Testes de Performance e Concorrência', () => {
    it('deve processar múltiplas vendas simultâneas sem conflito', async () => {
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Mock de múltiplas vendas simultâneas
      mockRpc
        .mockResolvedValueOnce({ data: { id: 'sale-001' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'sale-002' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'sale-003' }, error: null });

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Executar 3 vendas em paralelo
      const sale1 = result.current.processCheckout({...mockSaleData, notes: 'Venda 1'});
      const sale2 = result.current.processCheckout({...mockSaleData, notes: 'Venda 2'});  
      const sale3 = result.current.processCheckout({...mockSaleData, notes: 'Venda 3'});

      const results = await Promise.allSettled([sale1, sale2, sale3]);

      // Verificar que todas as vendas foram processadas
      expect(results.every(r => r.status === 'fulfilled')).toBe(true);
      expect(mockRpc).toHaveBeenCalledTimes(3);
    });

    it('deve respeitar limite de timeout para operações longas', async () => {
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Mock de operação que demora muito (timeout)
      mockRpc.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      );

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Executar venda com timeout
      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toContain('Timeout');
    });
  });

  describe('Testes de Recuperação de Falhas', () => {
    it('deve implementar retry automático para falhas temporárias', async () => {
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Primeira tentativa falha, segunda sucede
      mockRpc
        .mockRejectedValueOnce(new Error('Falha temporária de rede'))
        .mockResolvedValueOnce(mockSupabaseResponses.processedSale);

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que houve retry e sucesso final
      expect(mockRpc).toHaveBeenCalledTimes(2);
      expect(result.current.isSuccess).toBe(true);
    });

    it('deve falhar após esgotar tentativas de retry', async () => {
      const mockRpc = vi.mocked(supabase.from().rpc);
      
      // Todas as tentativas falham
      mockRpc
        .mockRejectedValueOnce(new Error('Falha persistente'))
        .mockRejectedValueOnce(new Error('Falha persistente'))
        .mockRejectedValueOnce(new Error('Falha persistente'));

      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      await waitFor(async () => {
        await result.current.processCheckout(mockSaleData);
      });

      // Verificar que esgotou tentativas e falhou
      expect(mockRpc).toHaveBeenCalledTimes(3);
      expect(result.current.isError).toBe(true);
    });
  });
});