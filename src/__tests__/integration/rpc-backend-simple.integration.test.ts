/**
 * Testes de Integração Backend - RPC Functions (Versão Simplificada)
 * SPRINT 4 - DIA 2: Testes de Integração Backend
 * Baseado na documentação docs/limpeza/prompt.md
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/core/api/supabase/client';

// Usando produto existente
const EXISTING_PRODUCT_ID = 'c864be4c-909c-4c6f-98cd-84a0255d6dfc'; // Petra

describe('RPC Backend Integration Tests (Simplified)', () => {
  let initialStock: number;

  beforeAll(async () => {
    // Obter estoque inicial do produto
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', EXISTING_PRODUCT_ID)
      .single();

    initialStock = product?.stock_quantity || 0;
  });

  describe('create_inventory_movement RPC Function', () => {

    it('deve processar movimentação válida de entrada', async () => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: 5,
          p_type: 'initial_stock',
          p_reason: 'Teste entrada - RPC Backend',
          p_metadata: { test: true, scenario: 'backend_entry' }
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.previous_stock).toBeGreaterThanOrEqual(0);
      expect(data.new_stock).toBe(data.previous_stock + 5);
      expect(data.quantity_change).toBe(5);
      expect(data.movement_id).toBeDefined();
    });

    it('deve processar movimentação válida de saída', async () => {
      // Obter estoque atual primeiro
      const { data: currentProduct } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', EXISTING_PRODUCT_ID)
        .single();

      const currentStock = currentProduct?.stock_quantity || 0;

      // Fazer uma venda pequena (3 unidades) que certamente será possível
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: -3,
          p_type: 'sale',
          p_reason: 'Teste saída - RPC Backend',
          p_metadata: { test: true, scenario: 'backend_sale' }
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.previous_stock).toBe(currentStock);
      expect(data.new_stock).toBe(currentStock - 3);
      expect(data.quantity_change).toBe(-3);
    });

    it('deve rejeitar movimentação com estoque insuficiente', async () => {
      // Tentar remover uma quantidade absurda que certamente falhará
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: -999999, // Quantidade impossível
          p_type: 'sale',
          p_reason: 'Teste estoque insuficiente',
          p_metadata: { test: true, scenario: 'insufficient_stock' }
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Estoque insuficiente');
    });

    it('deve rejeitar produto inexistente', async () => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: '123e4567-e89b-12d3-a456-426614174000', // UUID inexistente
          p_quantity_change: 10,
          p_type: 'initial_stock',
          p_reason: 'Teste produto inexistente'
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Produto não encontrado');
    });

    it('deve criar registro na tabela inventory_movements', async () => {
      const { data: rpcResult } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: 2,
          p_type: 'inventory_adjustment',
          p_reason: 'Teste criação de movimento',
          p_metadata: { test: true, adjustment_type: 'positive' }
        });

      // Verificar se o movimento foi criado
      const { data: movement, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('id', rpcResult.movement_id)
        .single();

      expect(error).toBeNull();
      expect(movement).toBeDefined();
      expect(movement?.product_id).toBe(EXISTING_PRODUCT_ID);
      expect(movement?.quantity_change).toBe(2);
      expect(movement?.type).toBe('inventory_adjustment');
      expect(movement?.reason).toBe('Teste criação de movimento');
      expect(movement?.metadata).toEqual({ test: true, adjustment_type: 'positive' });
    });
  });

  describe('Tipos de Movimentação Suportados', () => {
    const movementTypesToTest = [
      { type: 'initial_stock', change: 1 },
      { type: 'inventory_adjustment', change: 1 },
      { type: 'return', change: 1 },
      { type: 'stock_transfer_in', change: 1 },
      { type: 'sale', change: -1 },
      { type: 'stock_transfer_out', change: -1 },
      { type: 'personal_consumption', change: -1 }
    ];

    movementTypesToTest.forEach(({ type, change }) => {
      it(`deve processar tipo de movimentação: ${type}`, async () => {
        const { data, error } = await supabase
          .rpc('create_inventory_movement', {
            p_product_id: EXISTING_PRODUCT_ID,
            p_quantity_change: change,
            p_type: type as any,
            p_reason: `Teste de movimento tipo ${type}`,
            p_metadata: { movement_type_test: type }
          });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.quantity_change).toBe(change);

        // Verificar se o movimento foi registrado com o tipo correto
        const { data: movement } = await supabase
          .from('inventory_movements')
          .select('type')
          .eq('id', data.movement_id)
          .single();

        expect(movement?.type).toBe(type);
      });
    });
  });

  describe('Validação de Metadados', () => {

    it('deve aceitar metadados JSON complexos', async () => {
      const complexMetadata = {
        sale_id: 'sale-123',
        customer: {
          id: 'customer-456',
          name: 'Cliente Teste'
        },
        items: [
          { id: 'item-1', quantity: 2 },
          { id: 'item-2', quantity: 3 }
        ],
        payment_method: 'credit_card',
        discount: 10.5,
        notes: 'Venda com desconto especial'
      };

      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: -1,
          p_type: 'sale',
          p_reason: 'Venda com metadados complexos',
          p_metadata: complexMetadata
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Verificar se os metadados foram salvos corretamente
      const { data: movement } = await supabase
        .from('inventory_movements')
        .select('metadata')
        .eq('id', data.movement_id)
        .single();

      expect(movement?.metadata).toEqual(complexMetadata);
    });

    it('deve aceitar metadados vazios', async () => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: 1,
          p_type: 'initial_stock',
          p_reason: 'Movimento sem metadados'
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      const { data: movement } = await supabase
        .from('inventory_movements')
        .select('metadata')
        .eq('id', data.movement_id)
        .single();

      expect(movement?.metadata).toEqual({});
    });
  });

  describe('Performance e Robustez', () => {

    it('deve executar movimentação em menos de 500ms', async () => {
      const startTime = Date.now();

      const { error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: 1,
          p_type: 'inventory_adjustment',
          p_reason: 'Teste de performance'
        });

      const executionTime = Date.now() - startTime;

      expect(error).toBeNull();
      expect(executionTime).toBeLessThan(500);
    }, 1000);

    it('deve processar múltiplas movimentações sequenciais', async () => {
      const operations = [
        { change: 2, type: 'initial_stock', reason: 'Op 1' },
        { change: -1, type: 'sale', reason: 'Op 2' },
        { change: 1, type: 'return', reason: 'Op 3' }
      ];

      for (const op of operations) {
        const { data, error } = await supabase
          .rpc('create_inventory_movement', {
            p_product_id: EXISTING_PRODUCT_ID,
            p_quantity_change: op.change,
            p_type: op.type as any,
            p_reason: op.reason
          });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.quantity_change).toBe(op.change);
      }
    });
  });

  describe('Integridade dos Dados', () => {

    it('deve manter consistência entre product e inventory_movements', async () => {
      // Obter estoque atual
      const { data: productBefore } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', EXISTING_PRODUCT_ID)
        .single();

      const stockBefore = productBefore?.stock_quantity || 0;

      // Fazer uma movimentação
      const { data: movement } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: 3,
          p_type: 'inventory_adjustment',
          p_reason: 'Teste consistência'
        });

      // Verificar estoque após movimentação
      const { data: productAfter } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', EXISTING_PRODUCT_ID)
        .single();

      const stockAfter = productAfter?.stock_quantity || 0;

      // Verificar se os dados batem
      expect(movement.previous_stock).toBe(stockBefore);
      expect(movement.new_stock).toBe(stockAfter);
      expect(stockAfter).toBe(stockBefore + 3);
    });

    it('deve registrar timestamp correto', async () => {
      const beforeTime = new Date();

      const { data } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: EXISTING_PRODUCT_ID,
          p_quantity_change: 1,
          p_type: 'inventory_adjustment',
          p_reason: 'Teste timestamp'
        });

      const afterTime = new Date();

      // Verificar timestamp do movimento
      const { data: movement } = await supabase
        .from('inventory_movements')
        .select('date')
        .eq('id', data.movement_id)
        .single();

      const movementTime = new Date(movement?.date || '');

      expect(movementTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(movementTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});