import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock data
const mockCartItems = [
  { 
    id: 'product-1', 
    name: 'Vinho Tinto Premium',
    price: 89.90, 
    quantity: 2,
    maxQuantity: 50,
    category: 'Tintos'
  },
  { 
    id: 'product-2', 
    name: 'Vinho Branco Especial',
    price: 65.50, 
    quantity: 1,
    maxQuantity: 30,
    category: 'Brancos'
  }
];

const mockCustomer = {
  id: 'customer-1',
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '(11) 99999-9999',
  segment: 'high_value'
};

const mockPaymentMethods = [
  { id: 'payment-1', name: 'Dinheiro', is_active: true },
  { id: 'payment-2', name: 'Cartão de Débito', is_active: true },
  { id: 'payment-3', name: 'Cartão de Crédito', is_active: true },
  { id: 'payment-4', name: 'PIX', is_active: true }
];

// Mock implementations
const mockCart = {
  items: mockCartItems,
  updateItemQuantity: vi.fn(),
  removeItem: vi.fn(),
  customerId: 'customer-1',
  setCustomer: vi.fn(),
  clearCart: vi.fn()
};

const mockUpsertSale = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false
};

const mockToast = vi.fn();

// Mocks
vi.mock('../use-cart', () => ({
  useCart: () => mockCart,
  useCartTotal: () => 245.30 // (89.90 * 2) + (65.50 * 1)
}));

vi.mock('@/features/customers/hooks/use-crm', () => ({
  useCustomer: (id: string) => ({ 
    data: id === 'customer-1' ? mockCustomer : null,
    isLoading: false 
  })
}));

vi.mock('../use-sales', () => ({
  usePaymentMethods: () => ({ 
    data: mockPaymentMethods, 
    isLoading: false 
  }),
  useUpsertSale: () => mockUpsertSale
}));

vi.mock('@/shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Test wrapper
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useCheckout - Fluxo Multi-Step', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false }
      }
    });
    
    // Reset cart mock state
    mockCart.items = mockCartItems;
    mockCart.customerId = 'customer-1';
    mockUpsertSale.isPending = false;
    mockUpsertSale.isSuccess = false;
    mockUpsertSale.isError = false;
  });

  describe('Inicialização e Estado Básico', () => {
    it('deve inicializar com estado padrão correto', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      expect(result.current.items).toEqual(mockCartItems);
      expect(result.current.selectedCustomer).toEqual(mockCustomer);
      expect(result.current.paymentMethods).toEqual(mockPaymentMethods);
      expect(result.current.paymentMethodId).toBe('');
      expect(result.current.discount).toBe(0);
      expect(result.current.isCustomerModalOpen).toBe(false);
    });

    it('deve calcular resumo do carrinho corretamente', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      const { cartSummary } = result.current;
      
      expect(cartSummary.subtotal).toBe(245.30); // (89.90 * 2) + (65.50 * 1)
      expect(cartSummary.discount).toBe(0);
      expect(cartSummary.total).toBe(245.30);
      expect(cartSummary.totalItems).toBe(3); // 2 + 1
      expect(cartSummary.itemCount).toBe(2); // 2 produtos diferentes
    });
  });

  describe('Validações de Checkout', () => {
    it('deve validar carrinho vazio', async () => {
      // Arrange: Mock empty cart
      mockCart.items = [];
      
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      const { validation } = result.current;
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Adicione produtos para iniciar uma venda');
      expect(validation.fieldErrors.items).toBe('Carrinho vazio');
    });

    it('deve validar cliente obrigatório', async () => {
      // Arrange: Mock no customer
      mockCart.customerId = null;
      
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ requireCustomer: true }), {
        wrapper: createWrapper(queryClient)
      });

      const { validation } = result.current;
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Selecione um cliente antes de finalizar a venda');
      expect(validation.fieldErrors.customer).toBe('Cliente obrigatório');
    });

    it('deve validar método de pagamento obrigatório', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      const { validation } = result.current;
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Selecione uma forma de pagamento');
      expect(validation.fieldErrors.paymentMethod).toBe('Forma de pagamento obrigatória');
    });

    it('deve validar quantidades inválidas', async () => {
      // Arrange: Mock invalid quantities
      mockCart.items = [
        { ...mockCartItems[0], quantity: 0 }, // Quantidade inválida
        { ...mockCartItems[1], quantity: 100 } // Acima do máximo
      ];

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      const { validation } = result.current;
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Algumas quantidades são inválidas');
      expect(validation.fieldErrors[`quantity_${mockCartItems[0].id}`]).toContain('Quantidade inválida');
      expect(validation.fieldErrors[`quantity_${mockCartItems[1].id}`]).toContain('Quantidade inválida');
    });

    it('deve validar desconto negativo', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Act: Apply negative discount
      act(() => {
        result.current.handleDiscountChange(-10);
      });

      // Assert: Should reset to 0
      expect(result.current.discount).toBe(0);
    });

    it('deve validar total positivo', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Act: Apply discount greater than subtotal
      act(() => {
        result.current.handleDiscountChange(300); // Greater than 245.30
      });

      // Should cap at max allowed discount (95% of subtotal)
      const maxDiscount = 245.30 * 0.95; // 233.035
      expect(result.current.discount).toBeCloseTo(maxDiscount, 2);
    });
  });

  describe('Gerenciamento de Desconto', () => {
    it('deve aplicar desconto válido', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Act: Apply valid discount
      act(() => {
        result.current.handleDiscountChange(50);
      });

      // Assert
      expect(result.current.discount).toBe(50);
      expect(result.current.cartSummary.total).toBe(195.30); // 245.30 - 50
    });

    it('deve limitar desconto ao máximo permitido', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      const maxDiscount = 245.30 * 0.95; // 233.035

      // Act: Try to apply discount higher than max
      act(() => {
        result.current.handleDiscountChange(250);
      });

      // Assert: Should be capped at max
      expect(result.current.discount).toBeCloseTo(maxDiscount, 2);
    });

    it('deve limpar desconto', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Arrange: Set initial discount
      act(() => {
        result.current.handleDiscountChange(25);
      });
      expect(result.current.discount).toBe(25);

      // Act: Clear discount
      act(() => {
        result.current.clearDiscount();
      });

      // Assert
      expect(result.current.discount).toBe(0);
      expect(result.current.cartSummary.total).toBe(245.30);
    });

    it('deve verificar se desconto pode ser aplicado', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ allowDiscounts: false }), {
        wrapper: createWrapper(queryClient)
      });

      // Act & Assert: Should not allow discount when disabled
      expect(result.current.canApplyDiscount(50)).toBe(false);
    });
  });

  describe('Seleção de Método de Pagamento', () => {
    it('deve permitir selecionar método de pagamento', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Act
      act(() => {
        result.current.setPaymentMethodId('payment-2');
      });

      // Assert
      expect(result.current.paymentMethodId).toBe('payment-2');
    });

    it('deve carregar métodos de pagamento disponíveis', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      expect(result.current.paymentMethods).toEqual(mockPaymentMethods);
      expect(result.current.isLoadingPaymentMethods).toBe(false);
    });
  });

  describe('Modal de Cliente', () => {
    it('deve controlar abertura e fechamento do modal de cliente', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Initially closed
      expect(result.current.isCustomerModalOpen).toBe(false);

      // Act: Open modal
      act(() => {
        result.current.openCustomerModal();
      });

      // Assert: Modal opened
      expect(result.current.isCustomerModalOpen).toBe(true);

      // Act: Close modal
      act(() => {
        result.current.closeCustomerModal();
      });

      // Assert: Modal closed
      expect(result.current.isCustomerModalOpen).toBe(false);
    });
  });

  describe('Finalização de Venda', () => {
    it('deve finalizar venda com sucesso', async () => {
      // Arrange: Mock successful sale
      const mockSaleResult = { id: 'sale-123' };
      const mockOnSaleComplete = vi.fn();
      
      mockUpsertSale.mutate = vi.fn((data, callbacks) => {
        // Simulate async success
        setTimeout(() => callbacks?.onSuccess?.(mockSaleResult), 0);
      });

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ 
        onSaleComplete: mockOnSaleComplete 
      }), {
        wrapper: createWrapper(queryClient)
      });

      // Arrange: Set valid payment method
      act(() => {
        result.current.setPaymentMethodId('payment-1');
      });

      // Act: Finish sale
      await act(async () => {
        await result.current.handleFinishSale();
      });

      // Wait for async operations
      await waitFor(() => {
        expect(mockUpsertSale.mutate).toHaveBeenCalledWith(
          expect.objectContaining({
            customer_id: 'customer-1',
            payment_method_id: 'payment-1',
            total_amount: 245.30,
            items: expect.arrayContaining([
              expect.objectContaining({
                product_id: 'product-1',
                quantity: 2,
                unit_price: 89.90
              }),
              expect.objectContaining({
                product_id: 'product-2', 
                quantity: 1,
                unit_price: 65.50
              })
            ])
          }),
          expect.any(Object)
        );
      });
    });

    it('deve impedir finalização com validação inválida', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Act: Try to finish sale without payment method
      await act(async () => {
        await result.current.handleFinishSale();
      });

      // Assert: Should show validation error
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro na validação',
          description: 'Selecione uma forma de pagamento',
          variant: 'destructive'
        })
      );
      
      // Should not call mutate
      expect(mockUpsertSale.mutate).not.toHaveBeenCalled();
    });

    it('deve exibir erro em caso de falha na venda', async () => {
      // Arrange: Mock failed sale
      const mockError = new Error('Erro no processamento da venda');
      
      mockUpsertSale.mutate = vi.fn((data, callbacks) => {
        setTimeout(() => callbacks?.onError?.(mockError), 0);
      });

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      // Arrange: Set valid payment method
      act(() => {
        result.current.setPaymentMethodId('payment-1');
      });

      // Act: Try to finish sale
      await act(async () => {
        await result.current.handleFinishSale();
      });

      // Wait for error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Erro ao finalizar a venda',
            description: 'Erro no processamento da venda',
            variant: 'destructive'
          })
        );
      });
    });

    it('deve resetar estado após venda bem-sucedida', async () => {
      // Arrange: Mock successful sale
      const mockSaleResult = { id: 'sale-456' };
      const mockOnSaleComplete = vi.fn();
      
      mockUpsertSale.mutate = vi.fn((data, callbacks) => {
        setTimeout(() => callbacks?.onSuccess?.(mockSaleResult), 0);
      });

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ 
        onSaleComplete: mockOnSaleComplete 
      }), {
        wrapper: createWrapper(queryClient)
      });

      // Arrange: Set initial state
      act(() => {
        result.current.setPaymentMethodId('payment-2');
        result.current.handleDiscountChange(25);
      });

      // Act: Finish sale
      await act(async () => {
        await result.current.handleFinishSale();
      });

      // Wait for success handling
      await waitFor(() => {
        expect(mockCart.clearCart).toHaveBeenCalled();
        expect(mockOnSaleComplete).toHaveBeenCalledWith('sale-456');
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Venda finalizada!',
            description: 'A venda foi registrada com sucesso.'
          })
        );
      });

      // State should be reset
      expect(result.current.discount).toBe(0);
      expect(result.current.paymentMethodId).toBe('');
    });
  });

  describe('Configurações e Personalização', () => {
    it('deve respeitar configuração de cliente não obrigatório', async () => {
      // Arrange: Mock no customer
      mockCart.customerId = null;
      
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ 
        requireCustomer: false 
      }), {
        wrapper: createWrapper(queryClient)
      });

      // Act: Set payment method (other validations should pass)
      act(() => {
        result.current.setPaymentMethodId('payment-1');
      });

      const { validation } = result.current;
      
      // Should not require customer
      expect(validation.errors).not.toContain('Selecione um cliente antes de finalizar a venda');
    });

    it('deve respeitar configuração de desconto não permitido', async () => {
      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ 
        allowDiscounts: false 
      }), {
        wrapper: createWrapper(queryClient)
      });

      // Should not allow discount
      expect(result.current.canApplyDiscount(50)).toBe(false);
      expect(result.current.config.maxAllowedDiscount).toBe(0);
    });

    it('deve respeitar limite máximo de itens', async () => {
      // Arrange: Mock many items
      const manyItems = Array.from({ length: 6 }, (_, i) => ({
        id: `product-${i}`,
        name: `Produto ${i}`,
        price: 10,
        quantity: 1,
        maxQuantity: 100,
        category: 'Test'
      }));
      mockCart.items = manyItems;

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout({ 
        maxItems: 5 // Limit to 5 items
      }), {
        wrapper: createWrapper(queryClient)
      });

      const { validation } = result.current;
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Máximo de 5 itens permitidos no carrinho');
      expect(validation.fieldErrors.items).toContain('Muitos itens (6/5)');
    });
  });

  describe('Estados de Loading', () => {
    it('deve indicar quando venda está sendo processada', async () => {
      // Arrange: Mock processing state
      mockUpsertSale.isPending = true;

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      expect(result.current.isProcessingSale).toBe(true);
    });

    it('deve indicar quando métodos de pagamento estão carregando', async () => {
      // Reset and re-mock with loading state
      vi.resetModules();
      
      vi.doMock('../use-sales', () => ({
        usePaymentMethods: vi.fn(() => ({ 
          data: [], 
          isLoading: true 
        })),
        useUpsertSale: vi.fn(() => mockUpsertSale)
      }));
      
      vi.doMock('../use-cart', () => ({
        useCart: vi.fn(() => mockCart),
        useCartTotal: vi.fn(() => 245.30)
      }));
      
      vi.doMock('@/features/customers/hooks/use-crm', () => ({
        useCustomer: vi.fn((id: string) => ({ 
          data: id === 'customer-1' ? mockCustomer : null,
          isLoading: false 
        }))
      }));

      const { useCheckout } = await import('../useCheckout');
      const { result } = renderHook(() => useCheckout(), {
        wrapper: createWrapper(queryClient)
      });

      expect(result.current.isLoadingPaymentMethods).toBe(true);
    });
  });
});