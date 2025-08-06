/**
 * @fileoverview Testes para cálculos de inventário
 * FASE 6: TESTES DE UTILITÁRIOS E HELPERS - Subtarefa 6.1.2
 * 
 * @author Adega Manager Testing Team
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useInventoryCalculations } from '../useInventoryCalculations';
import type { ProductFormData } from '@/core/types/inventory.types';

describe('useInventoryCalculations', () => {
  describe('Subtarefa 6.1.2: Cálculo de Margem de Lucro', () => {
    it('deve calcular margem unitária corretamente', () => {
      const productData: Partial<ProductFormData> = {
        price: 100,
        cost_price: 60,
        package_size: 1
      };

      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Margem = (100 - 60) / 60 * 100 = 66.67%
      expect(result.current.calculations.unitMargin).toBe(66.67);
      expect(result.current.calculations.unitProfitAmount).toBe(40);
    });

    it('deve calcular margem por pacote corretamente', () => {
      const productData: Partial<ProductFormData> = {
        price: 25,        // Preço unitário
        cost_price: 15,   // Custo unitário
        package_size: 6,  // Pacote com 6 unidades
        package_price: 140 // Preço do pacote (desconto no pacote)
      };

      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Custo do pacote: 15 * 6 = 90
      // Lucro do pacote: 140 - 90 = 50
      // Margem do pacote: 50 / 90 * 100 = 55.56%
      expect(result.current.calculations.packageMargin).toBe(55.56);
      expect(result.current.calculations.packageProfitAmount).toBe(50);
    });

    it('deve calcular preço de pacote automaticamente quando não fornecido', () => {
      const productData: Partial<ProductFormData> = {
        price: 29.90,
        cost_price: 20,
        package_size: 12
        // package_price não fornecido
      };

      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Preço do pacote deve ser: 29.90 * 12 = 358.80 (usar toBeCloseTo para precisão de ponto flutuante)
      expect(result.current.calculations.pricePerPackage).toBeCloseTo(358.80, 2);
    });

    it('deve lidar com margem zero quando custo é zero', () => {
      const productData: Partial<ProductFormData> = {
        price: 100,
        cost_price: 0,
        package_size: 1
      };

      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      expect(result.current.calculations.unitMargin).toBe(0);
      expect(result.current.calculations.packageMargin).toBe(0);
    });
  });

  describe('Subtarefa 6.1.2: Determinação de Preço com Margem Desejada', () => {
    it('deve calcular preço correto com margem desejada', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Custo R$ 50, margem desejada 30%
      const price = result.current.calculatePriceWithMargin(50, 30);
      expect(price).toBe(65); // 50 * 1.30 = 65
    });

    it('deve calcular preço correto com margens diferentes', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      expect(result.current.calculatePriceWithMargin(100, 50)).toBe(150); // 50% de margem
      expect(result.current.calculatePriceWithMargin(80, 25)).toBe(100);   // 25% de margem
      expect(result.current.calculatePriceWithMargin(200, 10)).toBe(220);  // 10% de margem
    });

    it('deve calcular margem necessária para preço alvo', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Custo R$ 80, preço alvo R$ 120
      const margin = result.current.calculateRequiredMargin(80, 120);
      expect(margin).toBe(50); // (120 - 80) / 80 * 100 = 50%
    });
  });

  describe('Subtarefa 6.1.2: Validação de Dados de Entrada', () => {
    it('deve validar dados básicos do produto', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Dados inválidos - sem nome
      const invalidResult = result.current.validateProductData({});
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Nome do produto é obrigatório');

      // Dados válidos - todos os campos obrigatórios
      const validResult = result.current.validateProductData({
        name: 'Produto Teste',
        category: 'Vinhos',
        price: 100,
        cost_price: 60,
        stock_quantity: 10,
        minimum_stock: 2
      });
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
    });

    it('deve validar preços negativos', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      const invalidResult = result.current.validateProductData({
        name: 'Produto Teste',
        category: 'Vinhos',
        price: -10,
        cost_price: -5,
        stock_quantity: -1,
        minimum_stock: -1
      });
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('Preço deve ser um valor positivo');
      expect(invalidResult.errors).toContain('Preço de custo deve ser um valor positivo');
      expect(invalidResult.errors).toContain('Quantidade em estoque deve ser um valor positivo');
      expect(invalidResult.errors).toContain('Estoque mínimo deve ser um valor positivo');
    });
  });

  describe('Subtarefa 6.1.2: Edge Cases', () => {
    it('deve lidar com margem 0%', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      const price = result.current.calculatePriceWithMargin(100, 0);
      expect(price).toBe(100); // Sem margem, preço = custo
    });

    it('deve lidar com margem maior que 100%', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      const price = result.current.calculatePriceWithMargin(50, 200);
      expect(price).toBe(150); // 50 * (1 + 200/100) = 150
    });

    it('deve retornar 0 para custos inválidos', () => {
      const productData: Partial<ProductFormData> = {};
      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      expect(result.current.calculatePriceWithMargin(0, 50)).toBe(0);
      expect(result.current.calculatePriceWithMargin(-10, 30)).toBe(0);
      expect(result.current.calculateRequiredMargin(0, 100)).toBe(0);
    });

    it('deve arredondar valores corretamente', () => {
      const productData: Partial<ProductFormData> = {
        price: 33.333,
        cost_price: 22.222,
        package_size: 1
      };

      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Valores devem ser arredondados para 2 casas decimais
      expect(result.current.calculations.unitProfitAmount).toBe(11.11);
      expect(result.current.calculations.unitMargin).toBe(50);
    });
  });

  describe('Property-based Tests: Invariantes Matemáticas', () => {
    it('deve manter invariante: preço = custo + lucro', () => {
      const testCases = [
        { price: 100, cost_price: 60 },
        { price: 29.90, cost_price: 18.50 },
        { price: 250, cost_price: 180 }
      ];

      testCases.forEach(({ price, cost_price }) => {
        const productData: Partial<ProductFormData> = { price, cost_price, package_size: 1 };
        const { result } = renderHook(() => useInventoryCalculations(productData));
        
        const expectedProfit = price - cost_price;
        expect(result.current.calculations.unitProfitAmount).toBeCloseTo(expectedProfit, 2);
      });
    });

    it('deve manter consistência entre cálculos unitários e de pacote', () => {
      const productData: Partial<ProductFormData> = {
        price: 25,
        cost_price: 15,
        package_size: 6
        // Sem package_price - deve usar price * package_size
      };

      const { result } = renderHook(() => useInventoryCalculations(productData));
      
      // Margem deve ser a mesma para unidade e pacote quando não há desconto
      expect(result.current.calculations.unitMargin).toBe(result.current.calculations.packageMargin);
      
      // Preço do pacote deve ser preço unitário * tamanho do pacote
      expect(result.current.calculations.pricePerPackage).toBe(25 * 6);
    });
  });
});