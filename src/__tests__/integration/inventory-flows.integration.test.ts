/**
 * Testes de Integração - Fluxos de Estoque
 * Valida fluxos automáticos de gestão de estoque, categorização e alertas
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Simulação simplificada das operações de estoque
interface ProductData {
  id: string;
  name: string;
  category?: string;
  stock_quantity: number;
  minimum_stock: number;
  turnover_rate?: 'fast' | 'medium' | 'slow';
  last_sale_date?: string;
  total_sales?: number;
}

interface StockMovement {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  created_at: string;
}

// Simulador de fluxos de estoque
class InventoryFlowSimulator {
  private products: Map<string, ProductData> = new Map();
  private movements: StockMovement[] = [];
  private alerts: Array<{ type: string; product_id: string; message: string }> = [];

  // Simula criação de produto com categorização automática
  async createProduct(productData: Partial<ProductData>): Promise<{ success: boolean; product?: ProductData; category?: string }> {
    try {
      // Categorização automática baseada no nome
      const autoCategory = this.categorizeProduct(productData.name || '');
      
      const product: ProductData = {
        id: productData.id || `prod-${Date.now()}`,
        name: productData.name || '',
        category: autoCategory,
        stock_quantity: productData.stock_quantity || 0,
        minimum_stock: productData.minimum_stock || 5,
        turnover_rate: 'medium',
        total_sales: 0
      };

      this.products.set(product.id, product);

      // Verificar se precisa de alerta de estoque baixo
      this.checkLowStockAlert(product);

      return {
        success: true,
        product,
        category: autoCategory
      };
    } catch (error) {
      return {
        success: false
      };
    }
  }

  // Simula entrada de estoque com recálculo de giro
  async stockEntry(productId: string, quantity: number, reason: string): Promise<{ success: boolean; turnover?: string; movement?: StockMovement }> {
    try {
      const product = this.products.get(productId);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      // Criar movimento de entrada
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        product_id: productId,
        type: 'IN',
        quantity,
        reason,
        created_at: new Date().toISOString()
      };

      this.movements.push(movement);

      // Atualizar estoque
      product.stock_quantity += quantity;

      // Recalcular giro do produto
      const newTurnover = this.calculateTurnoverRate(product);
      product.turnover_rate = newTurnover;

      // Remover alerta de estoque baixo se aplicável
      this.removeStockAlert(productId);

      return {
        success: true,
        turnover: newTurnover,
        movement
      };
    } catch (error) {
      return {
        success: false
      };
    }
  }

  // Simula produto esgotado com alertas automáticos
  async markProductOutOfStock(productId: string): Promise<{ success: boolean; alerts?: string[] }> {
    try {
      const product = this.products.get(productId);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      product.stock_quantity = 0;

      // Gerar alertas automáticos
      const generatedAlerts = this.generateOutOfStockAlerts(product);

      return {
        success: true,
        alerts: generatedAlerts
      };
    } catch (error) {
      return {
        success: false
      };
    }
  }

  // Métodos privados para lógica de negócio
  private categorizeProduct(name: string): string {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('vinho') || nameLower.includes('wine')) return 'Vinho';
    if (nameLower.includes('whisky') || nameLower.includes('whiskey')) return 'Whisky';
    if (nameLower.includes('vodka')) return 'Vodka';
    if (nameLower.includes('cerveja') || nameLower.includes('beer')) return 'Cerveja';
    if (nameLower.includes('champagne') || nameLower.includes('espumante')) return 'Espumante';
    if (nameLower.includes('licor')) return 'Licor';
    if (nameLower.includes('cachaça')) return 'Cachaça';
    
    return 'Outros';
  }

  private calculateTurnoverRate(product: ProductData): 'fast' | 'medium' | 'slow' {
    const totalSales = product.total_sales || 0;
    const daysInStock = this.getDaysInStock(product.id);
    
    if (daysInStock === 0) return 'medium';
    
    const salesPerDay = totalSales / daysInStock;
    
    if (salesPerDay > 1) return 'fast';
    if (salesPerDay > 0.3) return 'medium';
    return 'slow';
  }

  private getDaysInStock(productId: string): number {
    // Simulação: assumir que o produto está em estoque há 30 dias
    return 30;
  }

  private checkLowStockAlert(product: ProductData): void {
    if (product.stock_quantity <= product.minimum_stock) {
      this.alerts.push({
        type: 'low_stock',
        product_id: product.id,
        message: `Produto ${product.name} com estoque baixo: ${product.stock_quantity}/${product.minimum_stock}`
      });
    }
  }

  private removeStockAlert(productId: string): void {
    this.alerts = this.alerts.filter(alert => 
      !(alert.type === 'low_stock' && alert.product_id === productId)
    );
  }

  private generateOutOfStockAlerts(product: ProductData): string[] {
    const alerts = [
      `Produto ${product.name} esgotado`,
      `Necessário reposição urgente para ${product.name}`,
      `Produto ${product.name} indisponível para vendas`
    ];

    // Adicionar alertas ao sistema
    alerts.forEach(message => {
      this.alerts.push({
        type: 'out_of_stock',
        product_id: product.id,
        message
      });
    });

    return alerts;
  }

  // Métodos auxiliares para testes
  getProduct(id: string): ProductData | undefined {
    return this.products.get(id);
  }

  getMovements(): StockMovement[] {
    return this.movements;
  }

  getAlerts(): Array<{ type: string; product_id: string; message: string }> {
    return this.alerts;
  }
}

describe('Integration Tests - Inventory Flows', () => {
  let simulator: InventoryFlowSimulator;

  beforeEach(() => {
    simulator = new InventoryFlowSimulator();
  });

  describe('Criação de Produto → Categorização Automática', () => {
    it('deve categorizar vinho automaticamente', async () => {
      const productData = {
        id: 'prod-001',
        name: 'Vinho Tinto Reserva',
        stock_quantity: 12,
        minimum_stock: 3
      };

      const result = await simulator.createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.category).toBe('Vinho');
      expect(result.product?.category).toBe('Vinho');
    });

    it('deve categorizar whisky automaticamente', async () => {
      const productData = {
        id: 'prod-002',
        name: 'Whisky Single Malt 12 anos',
        stock_quantity: 8,
        minimum_stock: 2
      };

      const result = await simulator.createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.category).toBe('Whisky');
      expect(result.product?.category).toBe('Whisky');
    });

    it('deve categorizar cerveja automaticamente', async () => {
      const productData = {
        id: 'prod-003',
        name: 'Cerveja Artesanal IPA',
        stock_quantity: 24,
        minimum_stock: 6
      };

      const result = await simulator.createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.category).toBe('Cerveja');
    });

    it('deve usar categoria "Outros" para produtos não reconhecidos', async () => {
      const productData = {
        id: 'prod-004',
        name: 'Acessório Saca-Rolhas Premium',
        stock_quantity: 5,
        minimum_stock: 1
      };

      const result = await simulator.createProduct(productData);

      expect(result.success).toBe(true);
      expect(result.category).toBe('Outros');
    });

    it('deve gerar alerta para produto criado com estoque baixo', async () => {
      const productData = {
        id: 'prod-005',
        name: 'Champagne Premium',
        stock_quantity: 2, // Abaixo do mínimo
        minimum_stock: 5
      };

      await simulator.createProduct(productData);

      const alerts = simulator.getAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('low_stock');
      expect(alerts[0].product_id).toBe('prod-005');
      expect(alerts[0].message).toContain('estoque baixo');
    });
  });

  describe('Entrada de Estoque → Recálculo de Giro', () => {
    beforeEach(async () => {
      // Criar produto inicial para os testes
      await simulator.createProduct({
        id: 'prod-100',
        name: 'Vinho Base para Testes',
        stock_quantity: 5,
        minimum_stock: 3,
        total_sales: 10
      });
    });

    it('deve processar entrada de estoque corretamente', async () => {
      const result = await simulator.stockEntry('prod-100', 20, 'Compra do fornecedor');

      expect(result.success).toBe(true);
      expect(result.movement).toBeDefined();
      expect(result.movement?.type).toBe('IN');
      expect(result.movement?.quantity).toBe(20);
      expect(result.movement?.reason).toBe('Compra do fornecedor');

      // Verificar que o estoque foi atualizado
      const product = simulator.getProduct('prod-100');
      expect(product?.stock_quantity).toBe(25); // 5 + 20
    });

    it('deve recalcular giro após entrada de estoque', async () => {
      const result = await simulator.stockEntry('prod-100', 15, 'Reposição mensal');

      expect(result.success).toBe(true);
      expect(result.turnover).toBeDefined();
      expect(['fast', 'medium', 'slow']).toContain(result.turnover);

      // Verificar que o produto teve o giro atualizado
      const product = simulator.getProduct('prod-100');
      expect(product?.turnover_rate).toBe(result.turnover);
    });

    it('deve criar movimento de estoque para auditoria', async () => {
      const initialMovements = simulator.getMovements().length;

      await simulator.stockEntry('prod-100', 10, 'Ajuste de inventário');

      const movements = simulator.getMovements();
      expect(movements).toHaveLength(initialMovements + 1);

      const lastMovement = movements[movements.length - 1];
      expect(lastMovement.product_id).toBe('prod-100');
      expect(lastMovement.type).toBe('IN');
      expect(lastMovement.quantity).toBe(10);
      expect(lastMovement.reason).toBe('Ajuste de inventário');
    });

    it('deve remover alerta de estoque baixo após entrada', async () => {
      // Criar produto com estoque baixo
      await simulator.createProduct({
        id: 'prod-101',
        name: 'Produto com Estoque Baixo',
        stock_quantity: 1,
        minimum_stock: 5
      });

      // Verificar que há alerta
      let alerts = simulator.getAlerts();
      const lowStockAlerts = alerts.filter(a => a.type === 'low_stock');
      expect(lowStockAlerts.length).toBeGreaterThan(0);

      // Fazer entrada de estoque
      await simulator.stockEntry('prod-101', 10, 'Reposição urgente');

      // Verificar que o alerta foi removido
      alerts = simulator.getAlerts();
      const remainingLowStockAlerts = alerts.filter(
        a => a.type === 'low_stock' && a.product_id === 'prod-101'
      );
      expect(remainingLowStockAlerts).toHaveLength(0);
    });

    it('deve falhar para produto inexistente', async () => {
      const result = await simulator.stockEntry('prod-inexistente', 10, 'Teste');

      expect(result.success).toBe(false);
    });
  });

  describe('Produto Esgotado → Alertas Automáticos', () => {
    beforeEach(async () => {
      await simulator.createProduct({
        id: 'prod-200',
        name: 'Produto para Esgotamento',
        stock_quantity: 5,
        minimum_stock: 2
      });
    });

    it('deve gerar alertas quando produto esgota', async () => {
      const result = await simulator.markProductOutOfStock('prod-200');

      expect(result.success).toBe(true);
      expect(result.alerts).toBeDefined();
      expect(result.alerts?.length).toBeGreaterThan(0);

      // Verificar tipos de alertas gerados
      expect(result.alerts).toEqual(
        expect.arrayContaining([
          expect.stringContaining('esgotado'),
          expect.stringContaining('reposição urgente'),
          expect.stringContaining('indisponível')
        ])
      );
    });

    it('deve atualizar estoque para zero', async () => {
      await simulator.markProductOutOfStock('prod-200');

      const product = simulator.getProduct('prod-200');
      expect(product?.stock_quantity).toBe(0);
    });

    it('deve adicionar alertas ao sistema de notificações', async () => {
      const initialAlerts = simulator.getAlerts().length;

      await simulator.markProductOutOfStock('prod-200');

      const alerts = simulator.getAlerts();
      expect(alerts.length).toBeGreaterThan(initialAlerts);

      const outOfStockAlerts = alerts.filter(a => a.type === 'out_of_stock');
      expect(outOfStockAlerts.length).toBeGreaterThan(0);
      expect(outOfStockAlerts[0].product_id).toBe('prod-200');
    });

    it('deve gerar múltiplos tipos de alerta para produto esgotado', async () => {
      await simulator.markProductOutOfStock('prod-200');

      const alerts = simulator.getAlerts();
      const outOfStockAlerts = alerts.filter(a => a.type === 'out_of_stock');

      // Deve ter pelo menos 3 tipos de alerta
      expect(outOfStockAlerts.length).toBeGreaterThanOrEqual(3);

      const messages = outOfStockAlerts.map(a => a.message);
      expect(messages.some(m => m.includes('esgotado'))).toBe(true);
      expect(messages.some(m => m.includes('reposição'))).toBe(true);
      expect(messages.some(m => m.includes('indisponível'))).toBe(true);
    });
  });

  describe('Fluxos Integrados Complexos', () => {
    it('deve processar ciclo completo: criação → entrada → esgotamento', async () => {
      // 1. Criar produto
      const createResult = await simulator.createProduct({
        id: 'prod-300',
        name: 'Vodka Premium Import',
        stock_quantity: 3,
        minimum_stock: 5
      });

      expect(createResult.success).toBe(true);
      expect(createResult.category).toBe('Vodka');

      // Deve ter alerta de estoque baixo
      let alerts = simulator.getAlerts();
      expect(alerts.some(a => a.type === 'low_stock')).toBe(true);

      // 2. Entrada de estoque
      const entryResult = await simulator.stockEntry('prod-300', 15, 'Importação');

      expect(entryResult.success).toBe(true);
      expect(entryResult.turnover).toBeDefined();

      // Alerta de estoque baixo deve ter sido removido
      alerts = simulator.getAlerts();
      const lowStockForProduct = alerts.filter(
        a => a.type === 'low_stock' && a.product_id === 'prod-300'
      );
      expect(lowStockForProduct).toHaveLength(0);

      // 3. Esgotar produto
      const outOfStockResult = await simulator.markProductOutOfStock('prod-300');

      expect(outOfStockResult.success).toBe(true);
      expect(outOfStockResult.alerts?.length).toBeGreaterThan(0);

      // Verificar estado final
      const finalProduct = simulator.getProduct('prod-300');
      expect(finalProduct?.stock_quantity).toBe(0);
      expect(finalProduct?.category).toBe('Vodka');

      // Deve ter alertas de esgotamento
      alerts = simulator.getAlerts();
      const outOfStockAlerts = alerts.filter(a => a.type === 'out_of_stock');
      expect(outOfStockAlerts.length).toBeGreaterThan(0);
    });

    it('deve manter auditoria completa de movimentos', async () => {
      const initialMovements = simulator.getMovements().length;

      // Criar produto
      await simulator.createProduct({
        id: 'prod-301',
        name: 'Licor de Frutas',
        stock_quantity: 0,
        minimum_stock: 3
      });

      // Múltiplas entradas
      await simulator.stockEntry('prod-301', 10, 'Compra inicial');
      await simulator.stockEntry('prod-301', 5, 'Complemento');
      await simulator.stockEntry('prod-301', 3, 'Ajuste');

      const movements = simulator.getMovements();
      const newMovements = movements.length - initialMovements;

      expect(newMovements).toBe(3);

      // Verificar que todos os movimentos foram registrados
      const productMovements = movements.filter(m => m.product_id === 'prod-301');
      expect(productMovements).toHaveLength(3);
      expect(productMovements.every(m => m.type === 'IN')).toBe(true);

      const totalQuantity = productMovements.reduce((sum, m) => sum + m.quantity, 0);
      expect(totalQuantity).toBe(18); // 10 + 5 + 3

      // Verificar que o estoque final está correto
      const product = simulator.getProduct('prod-301');
      expect(product?.stock_quantity).toBe(18);
    });

    it('deve processar múltiplos produtos com diferentes categorias', async () => {
      const products = [
        { name: 'Vinho Branco Seco', expected_category: 'Vinho' },
        { name: 'Cerveja Pilsen', expected_category: 'Cerveja' },
        { name: 'Whisky Bourbon', expected_category: 'Whisky' },
        { name: 'Champagne Rosé', expected_category: 'Espumante' },
        { name: 'Cachaça Envelhecida', expected_category: 'Cachaça' }
      ];

      const results = [];
      for (let i = 0; i < products.length; i++) {
        const result = await simulator.createProduct({
          id: `prod-40${i}`,
          name: products[i].name,
          stock_quantity: 10,
          minimum_stock: 2
        });
        results.push(result);
      }

      // Verificar que todos foram criados com sucesso
      expect(results.every(r => r.success)).toBe(true);

      // Verificar categorização correta
      for (let i = 0; i < products.length; i++) {
        expect(results[i].category).toBe(products[i].expected_category);
      }

      // Verificar que não há alertas (todos com estoque adequado)
      const lowStockAlerts = simulator.getAlerts().filter(a => a.type === 'low_stock');
      expect(lowStockAlerts).toHaveLength(0);
    });
  });

  describe('Validação e Casos Limite', () => {
    it('deve lidar com quantidade zero na entrada', async () => {
      await simulator.createProduct({
        id: 'prod-400',
        name: 'Produto Teste',
        stock_quantity: 5,
        minimum_stock: 2
      });

      const result = await simulator.stockEntry('prod-400', 0, 'Entrada zero');

      expect(result.success).toBe(true);
      
      const product = simulator.getProduct('prod-400');
      expect(product?.stock_quantity).toBe(5); // Não deve mudar
    });

    it('deve lidar com quantidade negativa como ajuste', async () => {
      await simulator.createProduct({
        id: 'prod-401',
        name: 'Produto para Ajuste',
        stock_quantity: 10,
        minimum_stock: 2
      });

      const result = await simulator.stockEntry('prod-401', -3, 'Ajuste negativo');

      expect(result.success).toBe(true);
      
      const product = simulator.getProduct('prod-401');
      expect(product?.stock_quantity).toBe(7); // 10 - 3
    });

    it('deve manter histórico de movimentos ordenado', async () => {
      await simulator.createProduct({
        id: 'prod-402',
        name: 'Produto Histórico',
        stock_quantity: 5,
        minimum_stock: 1
      });

      // Fazer várias operações com delay simulado
      await simulator.stockEntry('prod-402', 5, 'Primeira entrada');
      await new Promise(resolve => setTimeout(resolve, 1)); // Garantir ordem temporal
      await simulator.stockEntry('prod-402', 3, 'Segunda entrada');
      await new Promise(resolve => setTimeout(resolve, 1));
      await simulator.stockEntry('prod-402', 2, 'Terceira entrada');

      const movements = simulator.getMovements();
      const productMovements = movements.filter(m => m.product_id === 'prod-402');

      expect(productMovements).toHaveLength(3);

      // Verificar ordem cronológica
      for (let i = 1; i < productMovements.length; i++) {
        const prevDate = new Date(productMovements[i - 1].created_at);
        const currDate = new Date(productMovements[i].created_at);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });
  });
});