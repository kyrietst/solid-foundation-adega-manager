/**
 * @fileoverview Testes de performance para hook de carrinho
 * FASE 7: COBERTURA, PERFORMANCE E QUALIDADE - Subtarefa 7.2.1
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../use-cart';

// Mock do Supabase
vi.mock('@/core/api/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => Promise.resolve({ data: [], error: null })),
      delete: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }
}));

// Mock do useToast
vi.mock('@/shared/hooks/common/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() })
}));

describe('use-cart Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Subtarefa 7.2.1: Performance com Muitos Items', () => {
    it('deve adicionar 1000 items ao carrinho em menos de 100ms', async () => {
      const { result } = renderHook(() => useCart());
      
      const startTime = performance.now();
      
      await act(async () => {
        // Adicionar 1000 items diferentes
        for (let i = 1; i <= 1000; i++) {
          result.current.addItem({
            id: i.toString(),
            name: `Product ${i}`,
            price: 10 + (i % 100),
            stock: 100,
            category: `Category ${i % 10}`,
            barcode: `BAR${i.toString().padStart(4, '0')}`,
            supplier: `Supplier ${i % 5}`,
            volume_ml: 750,
            alcohol_content: 12.5,
            package_size: 1,
            cost_price: 5 + (i % 50),
            minimum_stock: 10,
            stock_quantity: 100,
            unit_type: 'un'
          }, 1);
        }
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100); // Menos de 100ms
      expect(result.current.items).toHaveLength(1000);
      expect(result.current.totalItems).toBe(1000);
    });

    it('deve calcular total de 1000 items em menos de 10ms', async () => {
      const { result } = renderHook(() => useCart());
      
      // Primeiro adicionar os items
      await act(async () => {
        for (let i = 1; i <= 1000; i++) {
          result.current.addItem({
            id: i.toString(),
            name: `Product ${i}`,
            price: 10,
            stock: 100,
            category: 'Test',
            barcode: `BAR${i}`,
            supplier: 'Test Supplier',
            volume_ml: 750,
            alcohol_content: 12.5,
            package_size: 1,
            cost_price: 5,
            minimum_stock: 10,
            stock_quantity: 100,
            unit_type: 'un'
          }, 1);
        }
      });

      // Medir tempo de cálculo do total
      const startTime = performance.now();
      
      const total = result.current.totalPrice;
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(10); // Menos de 10ms
      expect(total).toBe(10000); // 1000 items * R$ 10.00
    });

    it('deve remover item específico de 1000 items em menos de 20ms', async () => {
      const { result } = renderHook(() => useCart());
      
      // Adicionar 1000 items
      await act(async () => {
        for (let i = 1; i <= 1000; i++) {
          result.current.addItem({
            id: i.toString(),
            name: `Product ${i}`,
            price: 10,
            stock: 100,
            category: 'Test',
            barcode: `BAR${i}`,
            supplier: 'Test Supplier',
            volume_ml: 750,
            alcohol_content: 12.5,
            package_size: 1,
            cost_price: 5,
            minimum_stock: 10,
            stock_quantity: 100,
            unit_type: 'un'
          }, 1);
        }
      });

      // Medir tempo de remoção do item do meio
      const startTime = performance.now();
      
      await act(async () => {
        result.current.removeItem('500');
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(20); // Menos de 20ms
      expect(result.current.items).toHaveLength(999);
      expect(result.current.items.find(item => item.product.id === '500')).toBeUndefined();
    });

    it('deve atualizar quantidade de item específico em menos de 15ms', async () => {
      const { result } = renderHook(() => useCart());
      
      // Adicionar 1000 items
      await act(async () => {
        for (let i = 1; i <= 1000; i++) {
          result.current.addItem({
            id: i.toString(),
            name: `Product ${i}`,
            price: 10,
            stock: 100,
            category: 'Test',
            barcode: `BAR${i}`,
            supplier: 'Test Supplier',
            volume_ml: 750,
            alcohol_content: 12.5,
            package_size: 1,
            cost_price: 5,
            minimum_stock: 10,
            stock_quantity: 100,
            unit_type: 'un'
          }, 1);
        }
      });

      // Medir tempo de atualização de quantidade
      const startTime = performance.now();
      
      await act(async () => {
        result.current.updateQuantity('500', 5);
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(15); // Menos de 15ms
      
      const updatedItem = result.current.items.find(item => item.product.id === '500');
      expect(updatedItem?.quantity).toBe(5);
    });
  });

  describe('Subtarefa 7.2.1: Performance de Busca e Filtros', () => {
    it('deve encontrar item por ID em lista de 1000+ items em menos de 5ms', async () => {
      const { result } = renderHook(() => useCart());
      
      // Adicionar 1000 items
      await act(async () => {
        for (let i = 1; i <= 1000; i++) {
          result.current.addItem({
            id: i.toString(),
            name: `Product ${i}`,
            price: 10,
            stock: 100,
            category: 'Test',
            barcode: `BAR${i}`,
            supplier: 'Test Supplier',
            volume_ml: 750,
            alcohol_content: 12.5,
            package_size: 1,
            cost_price: 5,
            minimum_stock: 10,
            stock_quantity: 100,
            unit_type: 'un'
          }, 1);
        }
      });

      // Medir tempo de busca
      const startTime = performance.now();
      
      const foundItem = result.current.items.find(item => item.product.id === '750');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(5); // Menos de 5ms
      expect(foundItem).toBeDefined();
      expect(foundItem?.product.name).toBe('Product 750');
    });

    it('deve limpar carrinho com 1000 items em menos de 10ms', async () => {
      const { result } = renderHook(() => useCart());
      
      // Adicionar 1000 items
      await act(async () => {
        for (let i = 1; i <= 1000; i++) {
          result.current.addItem({
            id: i.toString(),
            name: `Product ${i}`,
            price: 10,
            stock: 100,
            category: 'Test',
            barcode: `BAR${i}`,
            supplier: 'Test Supplier',
            volume_ml: 750,
            alcohol_content: 12.5,
            package_size: 1,
            cost_price: 5,
            minimum_stock: 10,
            stock_quantity: 100,
            unit_type: 'un'
          }, 1);
        }
      });

      expect(result.current.items).toHaveLength(1000);

      // Medir tempo de limpeza
      const startTime = performance.now();
      
      await act(async () => {
        result.current.clearCart();
      });
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(10); // Menos de 10ms
      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('Subtarefa 7.2.1: Memory Performance', () => {
    it('deve gerenciar memória eficientemente com adições/remoções em massa', async () => {
      const { result } = renderHook(() => useCart());
      
      // Medir uso de memória inicial (aproximado)
      const initialHeapUsed = process.memoryUsage().heapUsed;
      
      // Adicionar e remover items em ciclos
      await act(async () => {
        for (let cycle = 0; cycle < 10; cycle++) {
          // Adicionar 100 items
          for (let i = 1; i <= 100; i++) {
            result.current.addItem({
              id: `${cycle}-${i}`,
              name: `Product ${cycle}-${i}`,
              price: 10,
              stock: 100,
              category: 'Test',
              barcode: `BAR${cycle}${i}`,
              supplier: 'Test Supplier',
              volume_ml: 750,
              alcohol_content: 12.5,
              package_size: 1,
              cost_price: 5,
              minimum_stock: 10,
              stock_quantity: 100,
              unit_type: 'un'
            }, 1);
          }
          
          // Remover 50 items
          for (let i = 1; i <= 50; i++) {
            result.current.removeItem(`${cycle}-${i}`);
          }
        }
      });
      
      // Forçar garbage collection se disponível
      if (global.gc) {
        global.gc();
      }
      
      const finalHeapUsed = process.memoryUsage().heapUsed;
      const memoryGrowth = finalHeapUsed - initialHeapUsed;
      
      // Crescimento de memória deve ser razoável (menos de 50MB)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
      
      // Verificar estado final do carrinho
      expect(result.current.items).toHaveLength(500); // 10 cycles * 50 items restantes
    });
  });

  describe('Subtarefa 7.2.1: Stress Testing', () => {
    it('deve suportar operações concorrentes sem corromper estado', async () => {
      const { result } = renderHook(() => useCart());
      
      const operations = [];
      
      // Criar 100 operações concorrentes
      for (let i = 1; i <= 100; i++) {
        operations.push(
          act(async () => {
            result.current.addItem({
              id: i.toString(),
              name: `Product ${i}`,
              price: 10,
              stock: 100,
              category: 'Test',
              barcode: `BAR${i}`,
              supplier: 'Test Supplier',
              volume_ml: 750,
              alcohol_content: 12.5,
              package_size: 1,
              cost_price: 5,
              minimum_stock: 10,
              stock_quantity: 100,
              unit_type: 'un'
            }, 1);
          })
        );
      }
      
      const startTime = performance.now();
      
      // Executar todas as operações em paralelo
      await Promise.all(operations);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Deve completar em tempo razoável
      expect(executionTime).toBeLessThan(500); // Menos de 500ms
      
      // Verificar integridade do estado
      expect(result.current.items).toHaveLength(100);
      expect(result.current.totalItems).toBe(100);
      expect(result.current.totalPrice).toBe(1000);
      
      // Verificar que não há items duplicados
      const uniqueIds = new Set(result.current.items.map(item => item.product.id));
      expect(uniqueIds.size).toBe(100);
    });

    it('deve manter performance consistente com operações repetitivas', async () => {
      const { result } = renderHook(() => useCart());
      
      const executionTimes: number[] = [];
      
      // Executar 50 cycles de add/remove para medir consistência
      for (let cycle = 0; cycle < 50; cycle++) {
        const cycleStartTime = performance.now();
        
        await act(async () => {
          // Adicionar 20 items
          for (let i = 1; i <= 20; i++) {
            result.current.addItem({
              id: `cycle${cycle}-item${i}`,
              name: `Product ${cycle}-${i}`,
              price: 10,
              stock: 100,
              category: 'Test',
              barcode: `BAR${cycle}${i}`,
              supplier: 'Test Supplier',
              volume_ml: 750,
              alcohol_content: 12.5,
              package_size: 1,
              cost_price: 5,
              minimum_stock: 10,
              stock_quantity: 100,
              unit_type: 'un'
            }, 1);
          }
          
          // Remover 10 items
          for (let i = 1; i <= 10; i++) {
            result.current.removeItem(`cycle${cycle}-item${i}`);
          }
        });
        
        const cycleEndTime = performance.now();
        executionTimes.push(cycleEndTime - cycleStartTime);
      }
      
      // Calcular estatísticas de performance
      const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      const maxTime = Math.max(...executionTimes);
      const minTime = Math.min(...executionTimes);
      
      // Performance deve ser consistente
      expect(avgTime).toBeLessThan(50); // Média menos de 50ms
      expect(maxTime).toBeLessThan(100); // Máximo menos de 100ms
      expect(maxTime - minTime).toBeLessThan(75); // Variação menor que 75ms
      
      // Estado final deve estar correto
      expect(result.current.items).toHaveLength(500); // 50 cycles * 10 items restantes
    });
  });
});