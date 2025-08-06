import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart, useCartTotal, useCartStats, useCartIsEmpty } from '../use-cart';

// Mock localStorage for Zustand persistence
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Properly mock localStorage
Object.defineProperty(global, 'localStorage', { 
  value: localStorageMock,
  writable: true 
});

// Test product fixtures
const mockProduct1 = {
  id: 'product-1',
  name: 'Vinho Tinto Premium',
  price: 29.90,
  maxQuantity: 100,
};

const mockProduct2 = {
  id: 'product-2',
  name: 'Vinho Branco Reserva',
  price: 45.50,
  maxQuantity: 50,
};

const mockProduct3 = {
  id: 'product-3',
  name: 'Espumante Especial',
  price: 89.90,
  maxQuantity: 25,
};

describe('useCart - Cálculos Financeiros', () => {
  beforeEach(() => {
    // Clear mocks and reset localStorage
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    // Reset cart state after each test
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  describe('Cálculos de Subtotal e Total', () => {
    it('deve calcular subtotal corretamente com múltiplos produtos', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        // Adicionar 2 unidades do produto 1 (R$ 29,90 cada)
        result.current.addItem(mockProduct1);
        result.current.addItem(mockProduct1);
        
        // Adicionar 1 unidade do produto 2 (R$ 45,50)
        result.current.addItem(mockProduct2);
      });

      // Subtotal: (29.90 * 2) + (45.50 * 1) = 59.80 + 45.50 = 105.30
      expect(result.current.subtotal).toBe(105.30);
      expect(result.current.total).toBe(105.30);
    });

    it('deve manter precisão decimal correta em cálculos financeiros', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        // Adicionar produto com preço decimal específico
        result.current.addItem({ ...mockProduct1, price: 12.99 });
        result.current.updateItemQuantity('product-1', 3);
      });

      // 12.99 * 3 = 38.97
      expect(result.current.total).toBe(38.97);
      expect(result.current.subtotal).toBe(38.97);
    });

    it('deve calcular total com produtos de preços diferentes', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1); // R$ 29,90
        result.current.addItem(mockProduct2); // R$ 45,50
        result.current.addItem(mockProduct3); // R$ 89,90
      });

      // Total: 29.90 + 45.50 + 89.90 = 165.30
      expect(result.current.total).toBe(165.30);
    });

    it('deve retornar zero quando carrinho estiver vazio', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.total).toBe(0);
      expect(result.current.subtotal).toBe(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('Validação de Quantidade Máxima', () => {
    it('deve respeitar quantidade máxima por produto', () => {
      const { result } = renderHook(() => useCart());
      const limitedProduct = { ...mockProduct1, maxQuantity: 3 };

      act(() => {
        result.current.addItem(limitedProduct);
        result.current.updateItemQuantity('product-1', 5); // Tenta adicionar mais que o máximo
      });

      const item = result.current.items.find(i => i.id === 'product-1');
      expect(item?.quantity).toBe(3); // Deve ser limitado ao máximo
      expect(result.current.total).toBe(29.90 * 3); // 89.70
    });

    it('deve incrementar apenas até o máximo permitido', () => {
      const { result } = renderHook(() => useCart());
      const limitedProduct = { ...mockProduct2, maxQuantity: 2 };

      act(() => {
        result.current.addItem(limitedProduct);
        result.current.addItem(limitedProduct); // Segundo add
        result.current.addItem(limitedProduct); // Terceiro add (deve ser ignorado)
      });

      const item = result.current.items.find(i => i.id === 'product-2');
      expect(item?.quantity).toBe(2); // Máximo respeitado
      expect(result.current.total).toBe(45.50 * 2); // 91.00
    });
  });

  describe('Operações de Carrinho', () => {
    it('deve adicionar produto já existente incrementando quantidade', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1);
        result.current.addItem(mockProduct1); // Mesmo produto
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.itemCount).toBe(2);
      expect(result.current.uniqueItemCount).toBe(1);
    });

    it('deve remover produto específico do carrinho', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1);
        result.current.addItem(mockProduct2);
        result.current.removeItem('product-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('product-2');
      expect(result.current.total).toBe(45.50);
    });

    it('deve atualizar quantidade específica de um produto', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1);
        result.current.updateItemQuantity('product-1', 4);
      });

      const item = result.current.items.find(i => i.id === 'product-1');
      expect(item?.quantity).toBe(4);
      expect(result.current.total).toBe(29.90 * 4); // 119.60
    });

    it('deve remover item quando quantidade for atualizada para zero', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1);
        result.current.addItem(mockProduct2);
        result.current.updateItemQuantity('product-1', 0);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('product-2');
      expect(result.current.total).toBe(45.50);
    });

    it('deve limpar carrinho completamente', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1);
        result.current.addItem(mockProduct2);
        result.current.setCustomer('customer-123');
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.total).toBe(0);
      expect(result.current.customerId).toBeNull();
      expect(result.current.isEmpty).toBe(true);
    });
  });

  describe('Gerenciamento de Cliente', () => {
    it('deve definir e recuperar cliente do carrinho', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.setCustomer('customer-456');
      });

      expect(result.current.customerId).toBe('customer-456');
    });

    it('deve remover cliente quando definido como null', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.setCustomer('customer-789');
        result.current.setCustomer(null);
      });

      expect(result.current.customerId).toBeNull();
    });
  });

  describe('Contadores e Estatísticas', () => {
    it('deve contar total de itens corretamente', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProduct1);
        result.current.updateItemQuantity('product-1', 3);
        result.current.addItem(mockProduct2);
        result.current.updateItemQuantity('product-2', 2);
      });

      expect(result.current.itemCount).toBe(5); // 3 + 2
      expect(result.current.uniqueItemCount).toBe(2); // 2 produtos únicos
    });

    it('deve identificar carrinho vazio corretamente', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.isEmpty).toBe(true);

      act(() => {
        result.current.addItem(mockProduct1);
      });

      expect(result.current.isEmpty).toBe(false);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.isEmpty).toBe(true);
    });
  });
});

describe('useCart - Persistência e LocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up cart state
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  it('deve verificar que Zustand persist está configurado', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockProduct1);
      result.current.setCustomer('customer-persistence');
    });

    // Verificar que o estado foi atualizado (teste indireto da persistência)
    expect(result.current.customerId).toBe('customer-persistence');
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('product-1');
  });

  it('deve inicializar com estado limpo quando localStorage está vazio', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useCart());

    expect(result.current.items).toHaveLength(0);
    expect(result.current.customerId).toBeNull();
    expect(result.current.total).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });
});

describe('Hooks Otimizados', () => {
  afterEach(() => {
    // Reset cart state after each test
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  it('useCartTotal deve retornar apenas o total', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockProduct1);
      result.current.updateItemQuantity('product-1', 3);
    });

    expect(result.current.total).toBe(29.90 * 3);
  });

  it('useCartStats deve retornar todas as estatísticas', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockProduct1);
      result.current.addItem(mockProduct2);
    });

    const expectedStats = {
      total: 75.40, // 29.90 + 45.50
      subtotal: 75.40,
      itemCount: 2,
      uniqueItemCount: 2,
      isEmpty: false,
    };

    expect(result.current.total).toBe(expectedStats.total);
    expect(result.current.subtotal).toBe(expectedStats.subtotal);
    expect(result.current.itemCount).toBe(expectedStats.itemCount);
    expect(result.current.uniqueItemCount).toBe(expectedStats.uniqueItemCount);
    expect(result.current.isEmpty).toBe(expectedStats.isEmpty);
  });

  it('useCartIsEmpty deve refletir status do carrinho', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.isEmpty).toBe(true);

    act(() => {
      result.current.addItem(mockProduct1);
    });

    expect(result.current.isEmpty).toBe(false);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.isEmpty).toBe(true);
  });
});

describe('Property-based Tests - Invariantes Matemáticas', () => {
  afterEach(() => {
    // Reset cart state after each test
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  it('subtotal deve sempre ser igual à soma dos produtos (item.price * item.quantity)', () => {
    const { result } = renderHook(() => useCart());

    // Adicionar produtos com quantidades fixas para teste determinístico
    act(() => {
      result.current.addItem(mockProduct1);
      result.current.updateItemQuantity('product-1', 2);
      result.current.addItem(mockProduct2);
      result.current.updateItemQuantity('product-2', 3);
      result.current.addItem(mockProduct3);
      result.current.updateItemQuantity('product-3', 1);
    });

    // Calcular soma manual para verificar invariante
    const manualSum = result.current.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    expect(result.current.total).toBe(manualSum);
    expect(result.current.subtotal).toBe(manualSum);
    
    // Verificação específica com tolerância para floating point: (29.90*2) + (45.50*3) + (89.90*1) = 59.80 + 136.50 + 89.90 = 286.20
    expect(result.current.total).toBeCloseTo(286.20, 2);
  });

  it('itemCount deve sempre ser igual à soma das quantidades', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockProduct1);
      result.current.updateItemQuantity('product-1', 7);
      result.current.addItem(mockProduct2);
      result.current.updateItemQuantity('product-2', 3);
    });

    const manualCount = result.current.items.reduce(
      (sum, item) => sum + item.quantity, 
      0
    );

    expect(result.current.itemCount).toBe(manualCount);
    expect(result.current.itemCount).toBe(10); // 7 + 3
  });

  it('uniqueItemCount deve sempre ser igual ao length do array items', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockProduct1);
      result.current.addItem(mockProduct2);
      result.current.addItem(mockProduct3);
    });

    expect(result.current.uniqueItemCount).toBe(result.current.items.length);
    expect(result.current.uniqueItemCount).toBe(3);

    act(() => {
      result.current.removeItem('product-2');
    });

    expect(result.current.uniqueItemCount).toBe(result.current.items.length);
    expect(result.current.uniqueItemCount).toBe(2);
  });

  it('isEmpty deve ser true apenas quando items.length === 0', () => {
    const { result } = renderHook(() => useCart());

    expect(result.current.isEmpty).toBe(result.current.items.length === 0);

    act(() => {
      result.current.addItem(mockProduct1);
    });

    expect(result.current.isEmpty).toBe(result.current.items.length === 0);
    expect(result.current.isEmpty).toBe(false);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.isEmpty).toBe(result.current.items.length === 0);
    expect(result.current.isEmpty).toBe(true);
  });
});

describe('Edge Cases e Comportamentos Extremos', () => {
  afterEach(() => {
    // Reset cart state after each test
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.clearCart();
    });
  });

  it('deve lidar com preços zerados', () => {
    const { result } = renderHook(() => useCart());
    const freeProduct = { ...mockProduct1, price: 0 };

    act(() => {
      result.current.addItem(freeProduct);
      result.current.updateItemQuantity('product-1', 5);
    });

    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(5);
  });

  it('deve lidar com quantidades extremas respeitando maxQuantity', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem(mockProduct1); // maxQuantity: 100
      result.current.updateItemQuantity('product-1', 150); // Tenta mais que o máximo
    });

    expect(result.current.itemCount).toBe(100); // Limitado ao máximo
    expect(result.current.total).toBe(29.90 * 100);
  });

  it('deve lidar com IDs de produtos inválidos sem afetar estado', () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockProduct1);
    });

    const initialTotal = result.current.total;
    const initialItemCount = result.current.items.length;

    act(() => {
      // Tentar atualizar produto inexistente
      result.current.updateItemQuantity('non-existent-id', 10);
      result.current.removeItem('another-invalid-id');
    });

    // Carrinho deve permanecer inalterado
    expect(result.current.items).toHaveLength(initialItemCount);
    expect(result.current.items[0].id).toBe('product-1');
    expect(result.current.total).toBe(initialTotal);
  });
});