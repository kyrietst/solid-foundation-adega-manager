/**
 * Testes de Integração - Fluxos de Vendas
 * Validam o fluxo completo de vendas desde carrinho até atualização de estoque
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/dom';
import React from 'react';

import { useCheckout, UseCheckoutProps, CheckoutState } from '@/features/sales/hooks/useCheckout';
// Removed unused import to useEntity
import { supabase } from '@/core/api/supabase/client';

// Mock do Supabase client
vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          range: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        range: vi.fn(() => Promise.resolve({ data: [], error: null }))
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
    })),
    rpc: vi.fn(),
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

// Mock providers hook
vi.mock('@/app/providers/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'admin@adega.com' }
  })
}));

// Mock shared hooks
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

// Mock useUpsertSale since useCheckout delegates to it
const mockMutateAsync = vi.fn();
vi.mock('@/features/sales/hooks/use-sales', () => ({
  useUpsertSale: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  })
}));

// Mock dados realistas
const mockCartItem = {
  id: 'prod-123',
  name: 'Vinho Tinto Premium',
  variant_id: 'prod-123-unit',
  price: 89.90,
  quantity: 2,
  subtotal: 179.80,
  units_sold: 2,
  variant_type: 'unit',
  stock: 25,
  packageUnits: 1
};

const mockSaleData = {
  customer_id: 'cust-456',
  items: [mockCartItem],
  payment_method: 'pix',
  total_amount: 179.80,
  notes: 'Venda de integração'
};

const defaultProps: UseCheckoutProps = {
  items: [mockCartItem as any],
  subtotal: 179.80,
  total: 179.80,
  customerId: 'cust-456',
  saleType: 'presencial', // Fixed: 'counter' was not in SaleType union
  paymentMethodId: 'pix',
  discount: 0,
  allowDiscounts: true,
  deliveryAddress: '',
  deliveryFee: 0,
  deliveryPersonId: '',
  isCashPayment: false,
  cashReceived: 0,
  onSuccess: vi.fn(),
  clearCart: vi.fn(),
  resetState: vi.fn()
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
    mockMutateAsync.mockResolvedValue({ id: 'sale-789' });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Fluxo Completo: Carrinho → Checkout → Venda', () => {
    it('deve iniciar processo de venda', async () => {
      const { result } = renderHook(() => useCheckout(defaultProps), {
        wrapper: createWrapper(queryClient)
      });

      // Executar checkout (agora chamada sem argumentos pois props encapsulam estado)
      await waitFor(async () => {
        await result.current.processSale();
      });

      // Verificar que useUpsertSale foi chamado
      expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
        saleData: expect.objectContaining({
          customer_id: 'cust-456',
          total_amount: 179.80
        })
      }));
    });

    it('deve validar carrinho vazio', async () => {
      const emptyProps = { ...defaultProps, items: [] };
      const { result } = renderHook(() => useCheckout(emptyProps), {
        wrapper: createWrapper(queryClient)
      });

      await result.current.processSale();

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('deve validar pagamento em dinheiro insuficiente', async () => {
      const cashProps = {
        ...defaultProps,
        isCashPayment: true,
        cashReceived: 100.00, // Menor que total 179.80
        total: 179.80
      };

      const { result } = renderHook(() => useCheckout(cashProps), {
        wrapper: createWrapper(queryClient)
      });

      await result.current.processSale();

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('deve validar endereço para delivery', async () => {
        const deliveryProps: UseCheckoutProps = {
            ...defaultProps,
            saleType: 'delivery',
            deliveryAddress: '', // Empty address
            deliveryPersonId: 'driver-1'
        };

        const { result } = renderHook(() => useCheckout(deliveryProps), {
            wrapper: createWrapper(queryClient)
        });

        await result.current.processSale();

        expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
});