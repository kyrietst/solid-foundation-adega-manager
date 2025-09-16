/**
 * Testes de Integração - Movimentações de Inventário
 * SPRINT 4 - DIA 1: Testes dos Cenários do "Produto Teste"
 * Baseado na documentação docs/limpeza/prompt.md
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

// Componentes para teste
import { StockDisplay } from '@/shared/ui/composite/StockDisplay';
import { ProductStockPreview } from '@/features/inventory/components/ProductStockPreview';
import { InventoryMovementsHistory } from '@/features/inventory/components/InventoryMovementsHistory';

// Dados do Produto Teste
const PRODUTO_TESTE = {
  id: '03c44fba-b95e-4331-940c-dddb244f04fc',
  name: 'Produto Teste',
  units_per_package: 10,
  stock_quantity: 0,
  category: 'Teste',
  minimum_stock: 5,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

// Helper para criar QueryClient limpo
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper de teste
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Inventory Movement Integration - Produto Teste', () => {
  let produtoTeste = { ...PRODUTO_TESTE };

  beforeEach(() => {
    // Reset do produto teste
    produtoTeste = { ...PRODUTO_TESTE, stock_quantity: 0 };

    // Mock do Supabase client
    server.use(
      // Mock para buscar produto
      http.get('*/rest/v1/products*', () => {
        return HttpResponse.json([produtoTeste]);
      }),

      // Mock para buscar movimentações
      http.get('*/rest/v1/inventory_movements*', () => {
        return HttpResponse.json([]);
      }),

      // Mock para criar movimentação via RPC
      http.post('*/rest/v1/rpc/create_inventory_movement*', async ({ request }) => {
        const body = await request.json() as any;
        const { p_quantity_change } = body;

        const previousStock = produtoTeste.stock_quantity;
        const newStock = previousStock + p_quantity_change;

        // Validação de estoque
        if (newStock < 0) {
          return HttpResponse.json(
            {
              message: `Estoque insuficiente. Atual: ${previousStock}, Solicitado: ${Math.abs(p_quantity_change)}`,
              code: 'INSUFFICIENT_STOCK'
            },
            { status: 400 }
          );
        }

        // Atualizar o produto teste
        produtoTeste.stock_quantity = newStock;

        return HttpResponse.json({
          movement_id: `movement-${Date.now()}`,
          previous_stock: previousStock,
          new_stock: newStock,
          quantity_change: p_quantity_change
        });
      })
    );
  });

  describe('Cenário 1: Entrada de 10 pacotes (+100 unidades)', () => {
    it('deve processar entrada inicial corretamente', async () => {
      // Simular entrada de 100 unidades (10 pacotes)
      const response = await fetch('/rest/v1/rpc/create_inventory_movement', {
        method: 'POST',
        body: JSON.stringify({
          p_product_id: PRODUTO_TESTE.id,
          p_quantity_change: 100,
          p_type: 'initial_stock',
          p_reason: 'Entrada inicial - 10 pacotes',
          p_metadata: { packages: 10, scenario: 'test_1' }
        })
      });

      const result = await response.json();

      expect(result.previous_stock).toBe(0);
      expect(result.new_stock).toBe(100);
      expect(result.quantity_change).toBe(100);
      expect(produtoTeste.stock_quantity).toBe(100);
    });

    it('deve exibir "10 pacotes" no StockDisplay', () => {
      // Atualizar produto para 100 unidades
      produtoTeste.stock_quantity = 100;

      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={100}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('10 pacotes')).toBeInTheDocument();
    });

    it('deve mostrar cálculo correto no ProductStockPreview', () => {
      render(
        <TestWrapper>
          <ProductStockPreview
            stock_quantity={100}
            units_per_package={10}
          />
        </TestWrapper>
      );

      expect(screen.getByText('100')).toBeInTheDocument(); // Total
      expect(screen.getByText('10')).toBeInTheDocument(); // Pacotes
      expect(screen.getByText('0')).toBeInTheDocument(); // Unidades soltas
    });
  });

  describe('Cenário 2: Venda de 1 pacote (-10 unidades)', () => {
    beforeEach(() => {
      // Iniciar com 100 unidades
      produtoTeste.stock_quantity = 100;
    });

    it('deve processar venda de 1 pacote corretamente', async () => {
      const response = await fetch('/rest/v1/rpc/create_inventory_movement', {
        method: 'POST',
        body: JSON.stringify({
          p_product_id: PRODUTO_TESTE.id,
          p_quantity_change: -10,
          p_type: 'sale',
          p_reason: 'Venda - 1 pacote',
          p_metadata: { packages_sold: 1, scenario: 'test_2' }
        })
      });

      const result = await response.json();

      expect(result.previous_stock).toBe(100);
      expect(result.new_stock).toBe(90);
      expect(result.quantity_change).toBe(-10);
      expect(produtoTeste.stock_quantity).toBe(90);
    });

    it('deve exibir "9 pacotes" após venda', () => {
      // Simular estado após venda
      produtoTeste.stock_quantity = 90;

      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={90}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('9 pacotes')).toBeInTheDocument();
    });
  });

  describe('Cenário 3: Venda de 7 unidades individuais', () => {
    beforeEach(() => {
      // Iniciar com 90 unidades (9 pacotes)
      produtoTeste.stock_quantity = 90;
    });

    it('deve processar venda de 7 unidades corretamente', async () => {
      const response = await fetch('/rest/v1/rpc/create_inventory_movement', {
        method: 'POST',
        body: JSON.stringify({
          p_product_id: PRODUTO_TESTE.id,
          p_quantity_change: -7,
          p_type: 'sale',
          p_reason: 'Venda - 7 unidades avulsas',
          p_metadata: { units_sold: 7, scenario: 'test_3' }
        })
      });

      const result = await response.json();

      expect(result.previous_stock).toBe(90);
      expect(result.new_stock).toBe(83);
      expect(result.quantity_change).toBe(-7);
      expect(produtoTeste.stock_quantity).toBe(83);
    });

    it('deve exibir "8 pacotes e 3 unidades" após venda', () => {
      // Simular estado após venda (83 unidades)
      produtoTeste.stock_quantity = 83;

      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={83}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('8 pacotes e 3 unidades')).toBeInTheDocument();
    });
  });

  describe('Cenário 4: Ajuste de +5 unidades', () => {
    beforeEach(() => {
      // Iniciar com 83 unidades
      produtoTeste.stock_quantity = 83;
    });

    it('deve processar ajuste positivo corretamente', async () => {
      const response = await fetch('/rest/v1/rpc/create_inventory_movement', {
        method: 'POST',
        body: JSON.stringify({
          p_product_id: PRODUTO_TESTE.id,
          p_quantity_change: 5,
          p_type: 'inventory_adjustment',
          p_reason: 'Ajuste de inventário - encontradas 5 unidades extras',
          p_metadata: { adjustment_type: 'positive', scenario: 'test_4' }
        })
      });

      const result = await response.json();

      expect(result.previous_stock).toBe(83);
      expect(result.new_stock).toBe(88);
      expect(result.quantity_change).toBe(5);
      expect(produtoTeste.stock_quantity).toBe(88);
    });

    it('deve exibir "8 pacotes e 8 unidades" após ajuste', () => {
      // Simular estado após ajuste (88 unidades)
      produtoTeste.stock_quantity = 88;

      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={88}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('8 pacotes e 8 unidades')).toBeInTheDocument();
    });
  });

  describe('Cenário 5: Tentativa de venda com estoque insuficiente', () => {
    beforeEach(() => {
      // Iniciar com 88 unidades
      produtoTeste.stock_quantity = 88;
    });

    it('deve rejeitar venda de 100 unidades (insuficiente)', async () => {
      const response = await fetch('/rest/v1/rpc/create_inventory_movement', {
        method: 'POST',
        body: JSON.stringify({
          p_product_id: PRODUTO_TESTE.id,
          p_quantity_change: -100,
          p_type: 'sale',
          p_reason: 'Tentativa de venda - 100 unidades',
          p_metadata: { scenario: 'test_5_fail' }
        })
      });

      expect(response.status).toBe(400);

      const error = await response.json();
      expect(error.message).toContain('Estoque insuficiente');
      expect(error.message).toContain('Atual: 88');
      expect(error.message).toContain('Solicitado: 100');

      // Estoque deve permanecer inalterado
      expect(produtoTeste.stock_quantity).toBe(88);
    });

    it('deve manter exibição "8 pacotes e 8 unidades" após falha', () => {
      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={88}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('8 pacotes e 8 unidades')).toBeInTheDocument();
    });
  });

  describe('Cálculos Dinâmicos - Casos Extremos', () => {
    it('deve lidar com estoque zero', () => {
      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={0}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('0 unidades')).toBeInTheDocument();
    });

    it('deve lidar com apenas unidades soltas', () => {
      render(
        <TestWrapper>
          <StockDisplay
            stock_quantity={7}
            units_per_package={10}
            variant="default"
          />
        </TestWrapper>
      );

      expect(screen.getByText('7 unidades')).toBeInTheDocument();
    });

    it('deve validar units_per_package inválido', () => {
      render(
        <TestWrapper>
          <ProductStockPreview
            stock_quantity={50}
            units_per_package={0}
            showValidation={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Inválido')).toBeInTheDocument();
      expect(screen.getByText('"Unidades por pacote" deve ser maior que 0')).toBeInTheDocument();
    });
  });

  describe('Interface de Histórico', () => {
    it('deve renderizar componente de histórico sem erros', () => {
      render(
        <TestWrapper>
          <InventoryMovementsHistory
            product_id={PRODUTO_TESTE.id}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Histórico de Movimentações')).toBeInTheDocument();
      expect(screen.getByText('Produto específico')).toBeInTheDocument();
    });

    it('deve mostrar filtros de movimentação', () => {
      render(
        <TestWrapper>
          <InventoryMovementsHistory />
        </TestWrapper>
      );

      expect(screen.getByText('Filtros:')).toBeInTheDocument();
      expect(screen.getByText('Tipo de movimento')).toBeInTheDocument();
      expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();
    });
  });
});