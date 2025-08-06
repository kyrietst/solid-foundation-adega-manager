/**
 * Testes de Integração - Workflow de Vendas Simplificado  
 * Valida os fluxos críticos de venda usando mocks diretos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock direto do Supabase para testes de integração
const createMockQueryBuilder = () => {
  const mockSingle = vi.fn();
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockEq = vi.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect, single: mockSingle }));
  const mockUpdate = vi.fn(() => ({ eq: mockEq, select: mockSelect, single: mockSingle }));
  
  return {
    select: vi.fn(() => ({ eq: mockEq, single: mockSingle })),
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
    single: mockSingle
  };
};

const mockSupabase = {
  rpc: vi.fn(),
  from: vi.fn(() => createMockQueryBuilder()),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: { id: 'test-user-id' } }
    }))
  }
};

// Simulação de dados realistas do sistema
const testData = {
  product: {
    id: 'prod-123',
    name: 'Vinho Tinto Premium',
    price: 89.90,
    stock_quantity: 25,
    minimum_stock: 5,
    cost_price: 45.00
  },
  
  customer: {
    id: 'cust-456',
    name: 'João Silva',
    email: 'joao@email.com',
    segment: 'regular'
  },
  
  sale: {
    id: 'sale-789',
    customer_id: 'cust-456',
    total_amount: 179.80,
    payment_method: 'pix',
    items: [
      {
        product_id: 'prod-123',
        quantity: 2,
        unit_price: 89.90,
        subtotal: 179.80
      }
    ]
  }
};

// Simulador de fluxo de venda completo
class SalesWorkflowSimulator {
  constructor(private supabase: typeof mockSupabase) {}

  async processCompleteSale(saleData: {
    customer_id: string;
    total_amount: number;
    payment_method: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>;
  }) {
    const steps: string[] = [];
    
    try {
      // Passo 1: Validar estoque disponível
      steps.push('validate_stock');
      const stockCheck = await this.validateStock(saleData.items);
      if (!stockCheck.valid) {
        throw new Error(`Estoque insuficiente: ${stockCheck.message}`);
      }
      
      // Passo 2: Processar venda (stored procedure)
      steps.push('process_sale');
      const saleResult = await this.processSale(saleData);
      
      // Passo 3: Atualizar estoque de cada produto
      steps.push('update_stock');
      for (const item of saleData.items) {
        await this.updateProductStock(item.product_id, item.quantity);
      }
      
      // Passo 4: Criar movimentos de estoque
      steps.push('create_movements');
      for (const item of saleData.items) {
        await this.createStockMovement(item, saleResult.id);
      }
      
      // Passo 5: Atualizar insights CRM do cliente
      steps.push('update_crm');
      await this.updateCustomerInsights(saleData.customer_id, saleData.total_amount);
      
      // Passo 6: Registrar audit log
      steps.push('audit_log');
      await this.createAuditLog('sale_created', saleResult.id, saleData);
      
      return {
        success: true,
        saleId: saleResult.id,
        stepsCompleted: steps,
        data: saleResult
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stepsCompleted: steps,
        failedAt: steps[steps.length - 1]
      };
    }
  }

  private async validateStock(items: Array<{
    product_id: string;
    quantity: number;
  }>) {
    for (const item of items) {
      const result = await this.supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();
      
      if (!result.data || result.error) {
        throw new Error(`Erro ao verificar estoque: ${result.error?.message || 'Produto não encontrado'}`);
      }
        
      if (result.data.stock_quantity < item.quantity) {
        return {
          valid: false,
          message: `Produto ${item.product_id} tem apenas ${result.data.stock_quantity} em estoque`
        };
      }
    }
    return { valid: true };
  }

  private async processSale(saleData: {
    customer_id: string;
    items: unknown[];
    payment_method: string;
    total_amount: number;
  }) {
    const result = await this.supabase.rpc('process_sale', {
      customer_id: saleData.customer_id,
      items: saleData.items,
      payment_method: saleData.payment_method,
      total_amount: saleData.total_amount
    });
    
    if (!result.data || result.error) {
      throw new Error(`Erro ao processar venda: ${result.error?.message || 'Falha na criação'}`);
    }
    
    return result.data;
  }

  private async updateProductStock(productId: string, quantitySold: number) {
    const result = await this.supabase
      .from('products')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();
      
    if (!result.data || result.error) {
      throw new Error(`Erro ao atualizar estoque: ${result.error?.message || 'Falha na atualização'}`);
    }
    
    return result.data;
  }

  private async createStockMovement(item: {
    product_id: string;
    quantity: number;
  }, saleId: string) {
    const result = await this.supabase
      .from('inventory_movements')
      .insert({
        product_id: item.product_id,
        type: 'OUT',
        quantity: item.quantity,
        reason: `Venda #${saleId}`,
        user_id: 'test-user-id'
      })
      .select()
      .single();
      
    if (!result.data || result.error) {
      throw new Error(`Erro ao criar movimento: ${result.error?.message || 'Falha na criação'}`);
    }
    
    return result.data;
  }

  private async updateCustomerInsights(customerId: string, saleAmount: number) {
    const result = await this.supabase.rpc('recalc_customer_insights', {
      customer_id: customerId
    });
    
    if (result.error) {
      throw new Error(`Erro ao atualizar insights: ${result.error.message}`);
    }
    
    return result.data;
  }

  private async createAuditLog(action: string, recordId: string, details: unknown) {
    const result = await this.supabase
      .from('audit_logs')
      .insert({
        action,
        table_name: 'sales',
        record_id: recordId,
        user_id: 'test-user-id',
        details,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (!result.data || result.error) {
      throw new Error(`Erro ao criar audit log: ${result.error?.message || 'Falha na criação'}`);
    }
    
    return result.data;
  }
}

describe('Integration Tests - Sales Workflow', () => {
  let simulator: SalesWorkflowSimulator;

  beforeEach(() => {
    vi.clearAllMocks();
    simulator = new SalesWorkflowSimulator(mockSupabase);
  });

  describe('Fluxo Completo de Venda - Cenários de Sucesso', () => {
    it('deve processar venda completa com todos os passos', async () => {
      // Setup mocks para cada chamada de from()
      const mockQueryBuilder1 = createMockQueryBuilder();
      const mockQueryBuilder2 = createMockQueryBuilder();
      const mockQueryBuilder3 = createMockQueryBuilder();
      const mockQueryBuilder4 = createMockQueryBuilder();
      
      mockSupabase.from
        .mockReturnValueOnce(mockQueryBuilder1) // Para validação de estoque
        .mockReturnValueOnce(mockQueryBuilder2) // Para atualização de estoque
        .mockReturnValueOnce(mockQueryBuilder3) // Para movimento de estoque
        .mockReturnValueOnce(mockQueryBuilder4); // Para audit log
      
      // Mock para validação de estoque
      mockQueryBuilder1.select().eq().single.mockResolvedValue({
        data: { stock_quantity: 25 },
        error: null
      });
      
      // Mock para process_sale RPC
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { id: 'sale-789', status: 'completed' },
        error: null
      });
      
      // Mock para atualização de estoque
      mockQueryBuilder2.update().eq().select().single.mockResolvedValue({
        data: { id: 'prod-123', stock_quantity: 23 },
        error: null
      });
      
      // Mock para movimento de estoque
      mockQueryBuilder3.insert().select().single.mockResolvedValue({
        data: { id: 'mov-101' },
        error: null
      });
      
      // Mock para insights CRM
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { customer_id: 'cust-456', updated: true },
        error: null
      });
      
      // Mock para audit log
      mockQueryBuilder4.insert().select().single.mockResolvedValue({
        data: { id: 'audit-201' },
        error: null
      });

      // Executar fluxo completo
      const result = await simulator.processCompleteSale(testData.sale);

      // Verificações
      expect(result.success).toBe(true);
      expect(result.saleId).toBe('sale-789');
      expect(result.stepsCompleted).toEqual([
        'validate_stock',
        'process_sale', 
        'update_stock',
        'create_movements',
        'update_crm',
        'audit_log'
      ]);

      // Verificar chamadas do Supabase
      expect(mockSupabase.rpc).toHaveBeenCalledWith('process_sale', {
        customer_id: 'cust-456',
        items: testData.sale.items,
        payment_method: 'pix',
        total_amount: 179.80
      });
    });

    it('deve processar venda com múltiplos produtos corretamente', async () => {
      const multiItemSale = {
        ...testData.sale,
        items: [
          { product_id: 'prod-123', quantity: 2, unit_price: 89.90, subtotal: 179.80 },
          { product_id: 'prod-456', quantity: 1, unit_price: 245.50, subtotal: 245.50 }
        ],
        total_amount: 425.30
      };

      // Setup mocks
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: { stock_quantity: 25 }, error: null })
        .mockResolvedValueOnce({ data: { stock_quantity: 10 }, error: null });
        
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { id: 'sale-790', status: 'completed' },
        error: null
      });
      
      mockSupabase.from().update().eq().select().single
        .mockResolvedValueOnce({ data: { stock_quantity: 23 }, error: null })
        .mockResolvedValueOnce({ data: { stock_quantity: 9 }, error: null });
      
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: { id: 'mov-102' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-103' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'audit-202' }, error: null });
      
      mockSupabase.rpc.mockResolvedValueOnce({ data: { updated: true }, error: null });

      const result = await simulator.processCompleteSale(multiItemSale);

      expect(result.success).toBe(true);
      expect(mockSupabase.from().update().eq().select().single).toHaveBeenCalledTimes(2);
      expect(mockSupabase.from().insert().select().single).toHaveBeenCalledTimes(3); // 2 movimentos + 1 audit
    });
  });

  describe('Fluxo de Venda - Cenários de Falha', () => {
    it('deve falhar quando estoque insuficiente', async () => {
      // Mock estoque insuficiente
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 1 }, // Menos que os 2 solicitados
        error: null
      });

      const result = await simulator.processCompleteSale(testData.sale);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Estoque insuficiente');
      expect(result.failedAt).toBe('validate_stock');
      expect(result.stepsCompleted).toEqual(['validate_stock']);
    });

    it('deve falhar na criação da venda e não continuar', async () => {
      // Stock OK
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 25 },
        error: null
      });
      
      // Falha na criação da venda
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Falha na criação da venda' }
      });

      const result = await simulator.processCompleteSale(testData.sale);

      expect(result.success).toBe(false);
      expect(result.failedAt).toBe('process_sale');
      expect(result.stepsCompleted).toEqual(['validate_stock', 'process_sale']);
      
      // Não deve tentar atualizar estoque se a venda falhou
      expect(mockSupabase.from().update().eq().select().single).not.toHaveBeenCalled();
    });

    it('deve falhar na atualização de estoque mas manter venda', async () => {
      // Setup inicial OK
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 25 },
        error: null
      });
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { id: 'sale-791', status: 'completed' },
        error: null
      });
      
      // Falha na atualização de estoque
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Falha na atualização de estoque' }
      });

      const result = await simulator.processCompleteSale(testData.sale);

      expect(result.success).toBe(false);
      expect(result.failedAt).toBe('update_stock');
      
      // Venda foi criada, mas processo não completou
      expect(mockSupabase.rpc).toHaveBeenCalledWith('process_sale', expect.any(Object));
    });
  });

  describe('Integridade e Consistência de Dados', () => {
    it('deve manter consistência entre venda e movimentos de estoque', async () => {
      const saleWithMultipleItems = {
        customer_id: 'cust-456',
        total_amount: 515.30,
        payment_method: 'cartao',
        items: [
          { product_id: 'prod-123', quantity: 2, unit_price: 89.90, subtotal: 179.80 },
          { product_id: 'prod-456', quantity: 1, unit_price: 245.50, subtotal: 245.50 },
          { product_id: 'prod-789', quantity: 3, unit_price: 30.00, subtotal: 90.00 }
        ]
      };

      // Setup mocks para sucesso completo
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: { stock_quantity: 25 }, error: null })
        .mockResolvedValueOnce({ data: { stock_quantity: 10 }, error: null })
        .mockResolvedValueOnce({ data: { stock_quantity: 50 }, error: null });
        
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { id: 'sale-792', status: 'completed' },
        error: null
      });
      
      mockSupabase.from().update().eq().select().single
        .mockResolvedValueOnce({ data: { stock_quantity: 23 }, error: null })
        .mockResolvedValueOnce({ data: { stock_quantity: 9 }, error: null })
        .mockResolvedValueOnce({ data: { stock_quantity: 47 }, error: null });

      // Mock dos movimentos (um para cada item)
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: { id: 'mov-201' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-202' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-203' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'audit-301' }, error: null });
      
      mockSupabase.rpc.mockResolvedValueOnce({ data: { updated: true }, error: null });

      const result = await simulator.processCompleteSale(saleWithMultipleItems);

      expect(result.success).toBe(true);
      
      // Verificar que cada produto teve estoque atualizado
      expect(mockSupabase.from().update().eq().select().single).toHaveBeenCalledTimes(3);
      
      // Verificar que foram criados 3 movimentos + 1 audit log
      expect(mockSupabase.from().insert().select().single).toHaveBeenCalledTimes(4);
    });

    it('deve atualizar insights CRM baseado no valor da venda', async () => {
      const highValueSale = {
        ...testData.sale,
        total_amount: 2500.00, // Venda de alto valor
        items: [{ product_id: 'prod-premium', quantity: 1, unit_price: 2500.00, subtotal: 2500.00 }]
      };

      // Setup mocks
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 5 },
        error: null
      });
      
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: { id: 'sale-793' }, error: null })
        .mockResolvedValueOnce({ 
          data: { 
            customer_id: 'cust-456', 
            segment: 'high_value', // Upgraded segment
            total_spent: 5200.00,
            updated: true 
          }, 
          error: null 
        });
      
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { stock_quantity: 4 },
        error: null
      });
      
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: { id: 'mov-301' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'audit-401' }, error: null });

      const result = await simulator.processCompleteSale(highValueSale);

      expect(result.success).toBe(true);
      
      // Verificar que insights CRM foram recalculados
      expect(mockSupabase.rpc).toHaveBeenCalledWith('recalc_customer_insights', {
        customer_id: 'cust-456'
      });
    });
  });

  describe('Audit Trail e Rastreabilidade', () => {
    it('deve criar audit log com detalhes completos da venda', async () => {
      // Setup mocks para sucesso
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 25 },
        error: null
      });
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { id: 'sale-794', status: 'completed' },
        error: null
      });
      
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { stock_quantity: 23 },
        error: null
      });
      
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: { id: 'mov-401' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'audit-501' }, error: null });
      
      mockSupabase.rpc.mockResolvedValueOnce({ data: { updated: true }, error: null });

      await simulator.processCompleteSale(testData.sale);

      // Verificar que audit log foi criado com detalhes corretos
      const auditCall = mockSupabase.from().insert().select().single.mock.calls.find(
        call => call[0].action === 'sale_created'
      );
      
      expect(auditCall).toBeDefined();
      expect(auditCall[0]).toMatchObject({
        action: 'sale_created',
        table_name: 'sales',
        record_id: 'sale-794',
        user_id: 'test-user-id',
        details: testData.sale
      });
    });

    it('deve registrar movimentos de estoque para cada produto vendido', async () => {
      // Setup para sucesso completo
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 25 },
        error: null
      });
      
      mockSupabase.rpc.mockResolvedValueOnce({
        data: { id: 'sale-795', status: 'completed' },
        error: null
      });
      
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { stock_quantity: 23 },
        error: null
      });
      
      mockSupabase.from().insert().select().single
        .mockResolvedValueOnce({ data: { id: 'mov-501' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'audit-601' }, error: null });
      
      mockSupabase.rpc.mockResolvedValueOnce({ data: { updated: true }, error: null });

      await simulator.processCompleteSale(testData.sale);

      // Verificar movimento de estoque
      const movementCall = mockSupabase.from().insert().select().single.mock.calls.find(
        call => call[0].type === 'OUT'
      );
      
      expect(movementCall).toBeDefined();
      expect(movementCall[0]).toMatchObject({
        product_id: 'prod-123',
        type: 'OUT',
        quantity: 2,
        reason: 'Venda #sale-795',
        user_id: 'test-user-id'
      });
    });
  });

  describe('Performance e Concorrência', () => {
    it('deve processar vendas sequenciais sem conflito', async () => {
      // Mock para múltiplas vendas
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { stock_quantity: 25 },
        error: null
      });
      
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: { id: 'sale-801' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'sale-802' }, error: null })
        .mockResolvedValueOnce({ data: { id: 'sale-803' }, error: null });
      
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { stock_quantity: 23 },
        error: null
      });
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: { id: 'mov-601' },
        error: null
      });
      
      mockSupabase.rpc.mockResolvedValue({ data: { updated: true }, error: null });

      // Processar 3 vendas sequenciais
      const sale1 = await simulator.processCompleteSale({...testData.sale, notes: 'Venda 1'});
      const sale2 = await simulator.processCompleteSale({...testData.sale, notes: 'Venda 2'});  
      const sale3 = await simulator.processCompleteSale({...testData.sale, notes: 'Venda 3'});

      expect(sale1.success).toBe(true);
      expect(sale2.success).toBe(true);
      expect(sale3.success).toBe(true);
      
      // Verificar que todas as vendas foram processadas
      expect(mockSupabase.rpc).toHaveBeenCalledTimes(6); // 3 vendas + 3 insights
    });
  });
});