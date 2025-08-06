/**
 * @fileoverview Testes para hook de filtros
 * FASE 6: TESTES DE UTILITÁRIOS E HELPERS - Subtarefa 6.2.2
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilters, useProductFilters, useCustomerFilters } from '../useFilters';

describe('useFilters', () => {
  const mockProducts = [
    { id: 1, name: 'Vinho Tinto A', category: 'Tintos', supplier: 'Fornecedor A', stock: 10, min_stock: 5, barcode: '123' },
    { id: 2, name: 'Vinho Branco B', category: 'Brancos', supplier: 'Fornecedor B', stock: 3, min_stock: 5, barcode: '456' },
    { id: 3, name: 'Espumante C', category: 'Espumantes', supplier: 'Fornecedor A', stock: 0, min_stock: 2, barcode: '789' },
    { id: 4, name: 'Rosé D', category: 'Rosés', supplier: 'Fornecedor C', stock: 15, min_stock: 3, barcode: '101' }
  ];

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  describe('Subtarefa 6.2.2: Aplicação de múltiplos filtros', () => {
    it('deve filtrar por termo de busca', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name', 'category']
        })
      );

      act(() => {
        result.current.setSearchTerm('Vinho');
      });

      expect(result.current.filteredItems).toHaveLength(2);
      expect(result.current.filteredItems.map(p => p.name)).toEqual(['Vinho Tinto A', 'Vinho Branco B']);
    });

    it('deve filtrar por categoria', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name'],
          filterFunctions: {
            category: (product, category) => category === 'all' || product.category === category
          }
        })
      );

      act(() => {
        result.current.updateFilter('category', 'Tintos');
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].name).toBe('Vinho Tinto A');
    });

    it('deve aplicar múltiplos filtros simultaneamente', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name', 'supplier'],
          filterFunctions: {
            supplier: (product, supplier) => supplier === 'all' || product.supplier === supplier
          }
        })
      );

      act(() => {
        result.current.setSearchTerm('Vinho Tinto A'); // Buscar termo mais específico
      });

      act(() => {
        result.current.updateFilter('supplier', 'Fornecedor A');
      });

      expect(result.current.filteredItems).toHaveLength(1);
      expect(result.current.filteredItems[0].name).toBe('Vinho Tinto A');
    });

    it('deve filtrar case-insensitive', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name']
        })
      );

      act(() => {
        result.current.setSearchTerm('VINHO');
      });

      expect(result.current.filteredItems).toHaveLength(2);
    });
  });

  describe('Subtarefa 6.2.2: Reset de filtros', () => {
    it('deve resetar todos os filtros', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name'],
          initialFilters: { category: 'Tintos' },
          filterFunctions: {
            category: (product, category) => category === 'all' || product.category === category
          }
        })
      );

      // Aplicar filtros em ações separadas
      act(() => {
        result.current.setSearchTerm('teste');
      });
      
      act(() => {
        result.current.updateFilter('supplier', 'Fornecedor A');
      });

      expect(result.current.filters.searchTerm).toBe('teste');
      expect(result.current.filters.supplier).toBe('Fornecedor A');

      // Resetar
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.searchTerm).toBe('');
      expect(result.current.filters.category).toBe('Tintos'); // Valor inicial mantido
      expect(result.current.filters.supplier).toBeUndefined();
      expect(result.current.filteredItems).toHaveLength(1); // Apenas produtos da categoria 'Tintos'
    });

    it('deve detectar filtros ativos corretamente', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name']
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);

      act(() => {
        result.current.updateFilter('category', 'Tintos');
      });

      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.updateFilter('category', 'all');
      });

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('Subtarefa 6.2.2: Persistência de filtros', () => {
    it('deve salvar filtros no localStorage', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name'],
          persistKey: 'test'
        })
      );

      act(() => {
        result.current.updateFilter('category', 'Tintos');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'filters_test',
        JSON.stringify({ searchTerm: '', category: 'Tintos' })
      );
    });

    it('deve recuperar filtros do localStorage', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ searchTerm: 'saved', category: 'Brancos' })
      );

      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name'],
          persistKey: 'test'
        })
      );

      expect(result.current.filters.searchTerm).toBe('saved');
      expect(result.current.filters.category).toBe('Brancos');
    });

    it('deve lidar com erro no localStorage graciosamente', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name'],
          persistKey: 'test'
        })
      );

      act(() => {
        result.current.updateFilter('category', 'Tintos');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao salvar filtros no localStorage:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('deve remover filtros do localStorage ao resetar', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name'],
          persistKey: 'test'
        })
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('filters_test');
    });
  });

  describe('Utilitários', () => {
    it('deve extrair valores únicos para campos', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name']
        })
      );

      const categories = result.current.getUniqueValues('category');
      expect(categories).toEqual(['Brancos', 'Espumantes', 'Rosés', 'Tintos']);

      const suppliers = result.current.getUniqueValues('supplier');
      expect(suppliers).toEqual(['Fornecedor A', 'Fornecedor B', 'Fornecedor C']);
    });

    it('deve contar total de itens filtrados vs originais', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name']
        })
      );

      expect(result.current.totalOriginal).toBe(4);
      expect(result.current.totalFiltered).toBe(4);

      act(() => {
        result.current.setSearchTerm('Vinho');
      });

      expect(result.current.totalOriginal).toBe(4);
      expect(result.current.totalFiltered).toBe(2);
    });
  });

  describe('Estado de exibição de filtros', () => {
    it('deve controlar visibilidade dos filtros', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name']
        })
      );

      expect(result.current.showFilters).toBe(false);

      act(() => {
        result.current.setShowFilters(true);
      });

      expect(result.current.showFilters).toBe(true);
    });
  });

  describe('Filtros com valores especiais', () => {
    it('deve ignorar filtros com valores "all" e string vazia', () => {
      const { result } = renderHook(() => 
        useFilters(mockProducts, {
          searchFields: ['name']
        })
      );

      act(() => {
        result.current.updateFilter('category', 'all');
        result.current.updateFilter('supplier', '');
      });

      expect(result.current.filteredItems).toHaveLength(4); // Nenhum filtro aplicado
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });
});

describe('useProductFilters', () => {
  const mockProducts = [
    { id: 1, name: 'Vinho A', category: 'Tintos', supplier: 'Fornecedor A', stock: 10, min_stock: 5, barcode: '123' },
    { id: 2, name: 'Vinho B', category: 'Brancos', supplier: 'Fornecedor B', stock: 3, min_stock: 5, barcode: '456' }, // stock <= min_stock (low stock)
    { id: 3, name: 'Vinho C', category: 'Tintos', supplier: 'Fornecedor A', stock: 0, min_stock: 2, barcode: '789' }, // stock = 0 (out of stock) 
    { id: 4, name: 'Vinho D', category: 'Rosés', supplier: 'Fornecedor C', stock: 2, min_stock: 5, barcode: '111' } // stock <= min_stock (low stock)
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
      writable: true
    });
  });

  it('deve filtrar produtos por status de estoque', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    // Filtrar produtos com estoque baixo (stock <= min_stock && stock > 0)
    act(() => {
      result.current.updateFilter('status', 'low_stock');
    });

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.map(p => p.name)).toEqual(['Vinho B', 'Vinho D']);

    // Filtrar produtos sem estoque
    act(() => {
      result.current.updateFilter('status', 'out_of_stock');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Vinho C');
  });

  it('deve buscar em todos os campos de produto', () => {
    const { result } = renderHook(() => useProductFilters(mockProducts));

    // Buscar por código de barras
    act(() => {
      result.current.setSearchTerm('456');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Vinho B');
  });
});

describe('useCustomerFilters', () => {
  const mockCustomers = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', phone: '123456789', segment: 'VIP' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', phone: '987654321', segment: 'Regular' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '555666777', segment: 'VIP' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
      writable: true
    });
  });

  it('deve filtrar clientes por segmento', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));

    act(() => {
      result.current.updateFilter('segment', 'VIP');
    });

    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.filteredItems.map(c => c.name)).toEqual(['João Silva', 'Pedro Oliveira']);
  });

  it('deve buscar em campos de cliente', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));

    // Buscar por email
    act(() => {
      result.current.setSearchTerm('maria@email.com');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Maria Santos');

    // Buscar por telefone
    act(() => {
      result.current.setSearchTerm('555666777');
    });

    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].name).toBe('Pedro Oliveira');
  });
});