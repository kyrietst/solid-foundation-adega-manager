/**
 * Testes de Integração Backend - RPC Functions
 * SPRINT 4 - DIA 2: Testes de Integração Backend
 * Baseado na documentação docs/limpeza/prompt.md
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/core/api/supabase/client';

// Dados de teste
const TEST_PRODUCT = {
  id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido para testes
  name: 'Produto Teste RPC Backend',
  units_per_package: 10,
  category: 'Água',
  minimum_stock: 5,
  stock_quantity: 50
};

describe('RPC Backend Integration Tests', () => {

  beforeEach(async () => {
    // Limpar dados de teste anteriores
    await supabase
      .from('inventory_movements')
      .delete()
      .eq('product_id', TEST_PRODUCT.id);

    await supabase
      .from('products')
      .delete()
      .eq('id', TEST_PRODUCT.id);

    // Inserir produto de teste
    const { error: productError } = await supabase
      .from('products')
      .insert(TEST_PRODUCT);

    if (productError) {
      throw new Error(`Erro ao criar produto de teste: ${productError.message}`);
    }
  });

  afterEach(async () => {
    // Limpar dados de teste
    await supabase
      .from('inventory_movements')
      .delete()
      .eq('product_id', TEST_PRODUCT.id);

    await supabase
      .from('products')
      .delete()
      .eq('id', TEST_PRODUCT.id);
  });

  describe('create_inventory_movement RPC Function', () => {

    it('deve processar movimentação válida de entrada', async () => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: 25,
          p_type: 'initial_stock',
          p_reason: 'Teste entrada de estoque',
          p_metadata: { test: true, scenario: 'valid_entry' }
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.previous_stock).toBe(50);
      expect(data.new_stock).toBe(75);
      expect(data.quantity_change).toBe(25);
      expect(data.movement_id).toBeDefined();

      // Verificar se o produto foi atualizado
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', TEST_PRODUCT.id)
        .single();

      expect(product?.stock_quantity).toBe(75);
    });

    it('deve processar movimentação válida de saída', async () => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: -15,
          p_type: 'sale',
          p_reason: 'Teste venda',
          p_metadata: { test: true, scenario: 'valid_sale' }
        });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.previous_stock).toBe(50);
      expect(data.new_stock).toBe(35);
      expect(data.quantity_change).toBe(-15);

      // Verificar se o produto foi atualizado
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', TEST_PRODUCT.id)
        .single();

      expect(product?.stock_quantity).toBe(35);
    });

    it('deve rejeitar movimentação com estoque insuficiente', async () => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: -100, // Maior que o estoque atual (50)
          p_type: 'sale',
          p_reason: 'Teste estoque insuficiente',
          p_metadata: { test: true, scenario: 'insufficient_stock' }
        });

      expect(error).toBeDefined();
      expect(error?.message).toContain('Estoque insuficiente');
      expect(error?.message).toContain('Atual: 50');
      expect(error?.message).toContain('Solicitado: 100');

      // Verificar se o produto NÃO foi alterado
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', TEST_PRODUCT.id)
        .single();

      expect(product?.stock_quantity).toBe(50); // Deve permanecer inalterado
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
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: 20,
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
      expect(movement?.product_id).toBe(TEST_PRODUCT.id);
      expect(movement?.quantity_change).toBe(20);
      expect(movement?.type).toBe('inventory_adjustment');
      expect(movement?.reason).toBe('Teste criação de movimento');
      expect(movement?.previous_stock).toBe(50);
      expect(movement?.new_stock_quantity).toBe(70);
      expect(movement?.metadata).toEqual({ test: true, adjustment_type: 'positive' });
    });
  });

  describe('Cenários Complexos de Movimentação', () => {

    it('deve processar múltiplas movimentações sequenciais', async () => {
      // Movimentação 1: Entrada de 30 unidades
      const { data: mov1 } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: 30,
          p_type: 'initial_stock',
          p_reason: 'Primeira entrada'
        });

      expect(mov1.new_stock).toBe(80); // 50 + 30

      // Movimentação 2: Venda de 25 unidades
      const { data: mov2 } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: -25,
          p_type: 'sale',
          p_reason: 'Primeira venda'
        });

      expect(mov2.previous_stock).toBe(80);
      expect(mov2.new_stock).toBe(55); // 80 - 25

      // Movimentação 3: Ajuste de -10 unidades
      const { data: mov3 } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: -10,
          p_type: 'inventory_adjustment',
          p_reason: 'Ajuste de inventário'
        });

      expect(mov3.previous_stock).toBe(55);
      expect(mov3.new_stock).toBe(45); // 55 - 10

      // Verificar estoque final
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', TEST_PRODUCT.id)
        .single();

      expect(product?.stock_quantity).toBe(45);
    });

    it('deve manter consistência em operações concorrentes simuladas', async () => {
      // Simular operações "concorrentes" rapidamente
      const operations = [
        { change: 10, type: 'initial_stock', reason: 'Op 1' },
        { change: -5, type: 'sale', reason: 'Op 2' },
        { change: 3, type: 'return', reason: 'Op 3' },
        { change: -8, type: 'sale', reason: 'Op 4' },
        { change: 15, type: 'inventory_adjustment', reason: 'Op 5' }
      ];

      const promises = operations.map(op =>
        supabase.rpc('create_inventory_movement', {
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: op.change,
          p_type: op.type as any,
          p_reason: op.reason
        })
      );

      const results = await Promise.allSettled(promises);

      // Todas as operações devem ter sucesso (estoque inicial é 50, operações totalizam +15)
      const successResults = results.filter(r => r.status === 'fulfilled');
      expect(successResults).toHaveLength(5);

      // Verificar estoque final
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', TEST_PRODUCT.id)
        .single();

      const expectedFinal = 50 + 10 - 5 + 3 - 8 + 15; // = 65
      expect(product?.stock_quantity).toBe(expectedFinal);
    });
  });

  describe('Tipos de Movimentação Suportados', () => {
    const movementTypes = [
      'sale',
      'initial_stock',
      'inventory_adjustment',
      'return',
      'stock_transfer_out',
      'stock_transfer_in',
      'personal_consumption'
    ];

    movementTypes.forEach(type => {
      it(`deve processar tipo de movimentação: ${type}`, async () => {
        const isNegativeMovement = ['sale', 'stock_transfer_out', 'personal_consumption'].includes(type);
        const quantityChange = isNegativeMovement ? -5 : 5;

        const { data, error } = await supabase
          .rpc('create_inventory_movement', {
            p_product_id: TEST_PRODUCT.id,
            p_quantity_change: quantityChange,
            p_type: type as any,
            p_reason: `Teste de movimento tipo ${type}`,
            p_metadata: { movement_type_test: type }
          });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data.quantity_change).toBe(quantityChange);

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
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: -5,
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
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: 10,
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
          p_product_id: TEST_PRODUCT.id,
          p_quantity_change: 1,
          p_type: 'inventory_adjustment',
          p_reason: 'Teste de performance'
        });

      const executionTime = Date.now() - startTime;

      expect(error).toBeNull();
      expect(executionTime).toBeLessThan(500);
    }, 1000);

    it('deve manter integridade em caso de erro de constraint', async () => {
      // Tentar inserir produto com ID duplicado (deve falhar)
      const { error: duplicateError } = await supabase
        .from('products')
        .insert({ ...TEST_PRODUCT, name: 'Produto Duplicado' });

      expect(duplicateError).toBeDefined();

      // Verificar se o produto original ainda existe e não foi alterado
      const { data: originalProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', TEST_PRODUCT.id)
        .single();

      expect(originalProduct).toBeDefined();
      expect(originalProduct?.name).toBe(TEST_PRODUCT.name);
      expect(originalProduct?.stock_quantity).toBe(TEST_PRODUCT.stock_quantity);
    });
  });
});