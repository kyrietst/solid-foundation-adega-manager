/**
 * @fileoverview Testes para hook de paginação
 * FASE 6: TESTES DE UTILITÁRIOS E HELPERS - Subtarefa 6.2.1
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../use-pagination';

describe('usePagination', () => {
  const mockItems = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

  describe('Subtarefa 6.2.1: Navegação entre páginas', () => {
    it('deve inicializar com página 1 por padrão', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(3); // 25 items / 10 = 3 páginas
      expect(result.current.paginatedItems).toHaveLength(10);
    });

    it('deve navegar para próxima página corretamente', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.nextPage();
      });
      
      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedItems).toHaveLength(10);
      expect(result.current.paginatedItems[0].name).toBe('Item 11'); // Primeiro item da página 2
    });

    it('deve navegar para página anterior corretamente', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10, initialPage: 2 }));
      
      act(() => {
        result.current.prevPage();
      });
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.paginatedItems[0].name).toBe('Item 1');
    });

    it('deve ir para primeira página', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10, initialPage: 3 }));
      
      act(() => {
        result.current.goToFirstPage();
      });
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.paginatedItems[0].name).toBe('Item 1');
    });

    it('deve ir para última página', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.goToLastPage();
      });
      
      expect(result.current.currentPage).toBe(3);
      expect(result.current.paginatedItems).toHaveLength(5); // Última página tem 5 items
      expect(result.current.paginatedItems[0].name).toBe('Item 21');
    });

    it('deve navegar para página específica', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.setCurrentPage(2);
      });
      
      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedItems[0].name).toBe('Item 11');
    });
  });

  describe('Subtarefa 6.2.1: Mudança de items por página', () => {
    it('deve alterar número de items por página', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.setItemsPerPage(5);
      });
      
      expect(result.current.itemsPerPage).toBe(5);
      expect(result.current.totalPages).toBe(5); // 25 items / 5 = 5 páginas
      expect(result.current.paginatedItems).toHaveLength(5);
    });

    it('deve resetar para página 1 ao mudar items por página', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10, initialPage: 3 }));
      
      act(() => {
        result.current.setItemsPerPage(20);
      });
      
      expect(result.current.currentPage).toBe(1);
      expect(result.current.itemsPerPage).toBe(20);
      expect(result.current.totalPages).toBe(2); // 25 items / 20 = 2 páginas
    });

    it('deve lidar com items por página maior que total de items', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 50 }));
      
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedItems).toHaveLength(25);
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('Subtarefa 6.2.1: Reset para página 1 ao filtrar', () => {
    it('deve resetar para página 1 quando dados mudam e página atual é inválida', () => {
      const { result, rerender } = renderHook(
        ({ items }) => usePagination(items, { initialItemsPerPage: 10, resetPageOnDataChange: true }),
        { initialProps: { items: mockItems } }
      );
      
      // Ir para página 3
      act(() => {
        result.current.setCurrentPage(3);
      });
      expect(result.current.currentPage).toBe(3);
      
      // Simular filtro que reduz dados para apenas 5 items
      const filteredItems = mockItems.slice(0, 5);
      rerender({ items: filteredItems });
      
      // Deve resetar para página 1 automaticamente
      expect(result.current.currentPage).toBe(1);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedItems).toHaveLength(5);
    });

    it('não deve resetar página se resetPageOnDataChange for false', () => {
      const { result, rerender } = renderHook(
        ({ items }) => usePagination(items, { initialItemsPerPage: 10, resetPageOnDataChange: false }),
        { initialProps: { items: mockItems } }
      );
      
      act(() => {
        result.current.setCurrentPage(2);
      });
      
      const filteredItems = mockItems.slice(0, 15);
      rerender({ items: filteredItems });
      
      // Página deve permanecer 2
      expect(result.current.currentPage).toBe(2);
    });
  });

  describe('Subtarefa 6.2.1: Comportamento com lista vazia', () => {
    it('deve lidar com array vazio', () => {
      const { result } = renderHook(() => usePagination([], { initialItemsPerPage: 10 }));
      
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.paginatedItems).toHaveLength(0);
      expect(result.current.startIndex).toBe(0);
      expect(result.current.endIndex).toBe(0);
    });

    it('deve lidar com undefined/null items', () => {
      const { result } = renderHook(() => usePagination(undefined as any, { initialItemsPerPage: 10 }));
      
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedItems).toHaveLength(0);
    });

    it('deve navegar corretamente com um único item', () => {
      const singleItem = [{ id: 1, name: 'Only Item' }];
      const { result } = renderHook(() => usePagination(singleItem, { initialItemsPerPage: 10 }));
      
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedItems).toHaveLength(1);
      
      // Tentar ir para próxima página não deve mudar nada
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('Validações e Edge Cases', () => {
    it('não deve permitir página menor que 1', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.setCurrentPage(0);
      });
      
      expect(result.current.currentPage).toBe(1);
      
      act(() => {
        result.current.setCurrentPage(-5);
      });
      
      expect(result.current.currentPage).toBe(1);
    });

    it('não deve permitir página maior que total de páginas', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.setCurrentPage(10);
      });
      
      // Total de páginas é 3
      expect(result.current.currentPage).toBe(3);
    });

    it('não deve ir além da primeira página com prevPage', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      act(() => {
        result.current.prevPage(); // Já está na página 1
      });
      
      expect(result.current.currentPage).toBe(1);
    });

    it('não deve ir além da última página com nextPage', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      // Ir para última página
      act(() => {
        result.current.goToLastPage();
      });
      
      // Tentar ir para próxima
      act(() => {
        result.current.nextPage();
      });
      
      expect(result.current.currentPage).toBe(3);
    });
  });

  describe('Cálculos de índices', () => {
    it('deve calcular startIndex e endIndex corretamente', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      // Página 1
      expect(result.current.startIndex).toBe(0);
      expect(result.current.endIndex).toBe(10);
      
      // Página 2
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.startIndex).toBe(10);
      expect(result.current.endIndex).toBe(20);
      
      // Página 3 (última página com menos items)
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.startIndex).toBe(20);
      expect(result.current.endIndex).toBe(25); // Total de items
    });
  });

  describe('Property-based Tests: Invariantes', () => {
    it('deve manter invariante: paginatedItems.length <= itemsPerPage', () => {
      const testCases = [
        { itemsPerPage: 5, expectedMaxLength: 5 },
        { itemsPerPage: 10, expectedMaxLength: 10 },
        { itemsPerPage: 50, expectedMaxLength: 25 }, // Menos que total
      ];

      testCases.forEach(({ itemsPerPage, expectedMaxLength }) => {
        const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: itemsPerPage }));
        
        expect(result.current.paginatedItems.length).toBeLessThanOrEqual(Math.min(itemsPerPage, expectedMaxLength));
      });
    });

    it('deve manter invariante: totalPages >= 1', () => {
      const testCases = [[], mockItems.slice(0, 1), mockItems];
      
      testCases.forEach(items => {
        const { result } = renderHook(() => usePagination(items, { initialItemsPerPage: 10 }));
        expect(result.current.totalPages).toBeGreaterThanOrEqual(1);
      });
    });

    it('deve manter invariante: currentPage <= totalPages', () => {
      const { result } = renderHook(() => usePagination(mockItems, { initialItemsPerPage: 10 }));
      
      // Tentar navegar para várias páginas
      for (let i = 1; i <= 10; i++) {
        act(() => {
          result.current.setCurrentPage(i);
        });
        expect(result.current.currentPage).toBeLessThanOrEqual(result.current.totalPages);
      }
    });
  });
});