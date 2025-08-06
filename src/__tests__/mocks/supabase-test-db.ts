import { vi } from 'vitest';
import type { Database } from '@/integrations/supabase/types';
import { 
  fixtureProducts, 
  fixtureCustomers, 
  fixtureSales, 
  fixtureUsers,
  fixturePaymentMethods,
  fixtureInventoryMovements 
} from '@/__tests__/fixtures';

// In-memory test database that simulates Supabase operations
export class SupabaseTestDB {
  private data: {
    products: unknown[];
    customers: unknown[];
    sales: unknown[];
    sale_items: unknown[];
    profiles: unknown[];
    payment_methods: unknown[];
    inventory_movements: unknown[];
    customer_insights: unknown[];
    customer_interactions: unknown[];
    audit_logs: unknown[];
  };

  constructor() {
    this.reset();
  }

  reset() {
    this.data = {
      products: [...fixtureProducts],
      customers: [...fixtureCustomers],
      sales: [...fixtureSales],
      sale_items: [],
      profiles: [...fixtureUsers],
      payment_methods: [...fixturePaymentMethods],
      inventory_movements: [...fixtureInventoryMovements],
      customer_insights: [],
      customer_interactions: [],
      audit_logs: [],
    };

    // Add sale items from fixtures
    fixtureSales.forEach(sale => {
      if (sale.items) {
        this.data.sale_items.push(...sale.items.map(item => ({
          ...item,
          sale_id: sale.id,
        })));
      }
    });
  }

  // Simulate Supabase query builder
  from(table: string) {
    const data = this.data[table as keyof typeof this.data] || [];
    let result = [...data];
    const filters: Array<{ column: string; operator: string; value: unknown }> = [];
    let orderBy: { column: string; ascending: boolean } | null = null;
    let selectColumns = '*';
    let limitCount: number | null = null;
    let rangeStart: number | null = null;
    let rangeEnd: number | null = null;

    const queryBuilder = {
      select: (columns = '*') => {
        selectColumns = columns;
        return queryBuilder;
      },
      eq: (column: string, value: unknown) => {
        filters.push({ column, operator: 'eq', value });
        return queryBuilder;
      },
      neq: (column: string, value: any) => {
        filters.push({ column, operator: 'neq', value });
        return queryBuilder;
      },
      gt: (column: string, value: any) => {
        filters.push({ column, operator: 'gt', value });
        return queryBuilder;
      },
      gte: (column: string, value: any) => {
        filters.push({ column, operator: 'gte', value });
        return queryBuilder;
      },
      lt: (column: string, value: any) => {
        filters.push({ column, operator: 'lt', value });
        return queryBuilder;
      },
      lte: (column: string, value: any) => {
        filters.push({ column, operator: 'lte', value });
        return queryBuilder;
      },
      like: (column: string, value: any) => {
        filters.push({ column, operator: 'like', value });
        return queryBuilder;
      },
      ilike: (column: string, value: any) => {
        filters.push({ column, operator: 'ilike', value });
        return queryBuilder;
      },
      in: (column: string, values: any[]) => {
        filters.push({ column, operator: 'in', value: values });
        return queryBuilder;
      },
      order: (column: string, options: { ascending?: boolean } = {}) => {
        orderBy = { column, ascending: options.ascending ?? true };
        return queryBuilder;
      },
      limit: (count: number) => {
        limitCount = count;
        return queryBuilder;
      },
      range: (from: number, to: number) => {
        rangeStart = from;
        rangeEnd = to;
        return queryBuilder;
      },
      single: () => {
        return queryBuilder;
      },
      maybeSingle: () => {
        return queryBuilder;
      },
      insert: (values: any | any[]) => {
        const insertData = Array.isArray(values) ? values : [values];
        const newItems = insertData.map(item => ({
          id: `generated-id-${Date.now()}-${Math.random()}`,
          ...item,
          created_at: new Date().toISOString(),
        }));
        
        this.data[table as keyof typeof this.data].push(...newItems);
        
        return Promise.resolve({
          data: newItems,
          error: null,
          count: newItems.length,
          status: 201,
          statusText: 'Created',
        });
      },
      update: (values: any) => {
        // Apply filters to find items to update
        let itemsToUpdate = this.applyFilters([...data], filters);
        
        itemsToUpdate.forEach(item => {
          const index = this.data[table as keyof typeof this.data].findIndex(
            (dataItem: any) => dataItem.id === item.id
          );
          if (index !== -1) {
            this.data[table as keyof typeof this.data][index] = {
              ...this.data[table as keyof typeof this.data][index],
              ...values,
              updated_at: new Date().toISOString(),
            };
          }
        });

        const updatedItems = itemsToUpdate.map(item => ({
          ...item,
          ...values,
          updated_at: new Date().toISOString(),
        }));

        return Promise.resolve({
          data: updatedItems,
          error: null,
          count: updatedItems.length,
          status: 200,
          statusText: 'OK',
        });
      },
      delete: () => {
        let itemsToDelete = this.applyFilters([...data], filters);
        
        itemsToDelete.forEach(item => {
          const index = this.data[table as keyof typeof this.data].findIndex(
            (dataItem: any) => dataItem.id === item.id
          );
          if (index !== -1) {
            this.data[table as keyof typeof this.data].splice(index, 1);
          }
        });

        return Promise.resolve({
          data: itemsToDelete,
          error: null,
          count: itemsToDelete.length,
          status: 200,
          statusText: 'OK',
        });
      },
      then: (callback: (result: any) => any) => {
        // Apply filters
        result = this.applyFilters(result, filters);

        // Apply ordering
        if (orderBy) {
          result.sort((a, b) => {
            const aVal = a[orderBy!.column];
            const bVal = b[orderBy!.column];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return orderBy!.ascending ? comparison : -comparison;
          });
        }

        // Apply limit and range
        if (rangeStart !== null && rangeEnd !== null) {
          result = result.slice(rangeStart, rangeEnd + 1);
        } else if (limitCount !== null) {
          result = result.slice(0, limitCount);
        }

        // Apply select (simplified - just return all for now)
        
        return callback({
          data: result,
          error: null,
          count: result.length,
          status: 200,
          statusText: 'OK',
        });
      },
    };

    return queryBuilder;
  }

  private applyFilters(data: any[], filters: Array<{ column: string; operator: string; value: any }>) {
    return data.filter(item => {
      return filters.every(filter => {
        const itemValue = item[filter.column];
        
        switch (filter.operator) {
          case 'eq':
            return itemValue === filter.value;
          case 'neq':
            return itemValue !== filter.value;
          case 'gt':
            return itemValue > filter.value;
          case 'gte':
            return itemValue >= filter.value;
          case 'lt':
            return itemValue < filter.value;
          case 'lte':
            return itemValue <= filter.value;
          case 'like':
          case 'ilike':
            const pattern = filter.value.replace(/%/g, '.*').replace(/_/g, '.');
            const regex = new RegExp(pattern, filter.operator === 'ilike' ? 'i' : '');
            return regex.test(itemValue);
          case 'in':
            return filter.value.includes(itemValue);
          default:
            return true;
        }
      });
    });
  }

  // Simulate RPC calls
  rpc(functionName: string, params: any = {}) {
    switch (functionName) {
      case 'process_sale':
        return this.processSaleRPC(params);
      case 'delete_sale_with_items':
        return this.deleteSaleWithItemsRPC(params);
      case 'recalc_customer_insights':
        return this.recalcCustomerInsightsRPC(params);
      case 'get_sales_trends':
        return this.getSalesTrendsRPC(params);
      case 'get_top_products':
        return this.getTopProductsRPC(params);
      default:
        return Promise.resolve({
          data: null,
          error: { message: `Function ${functionName} not implemented in test mock` },
        });
    }
  }

  private processSaleRPC(params: any) {
    const { customer_id, items, payment_method_id, total, discount = 0 } = params;
    
    // Create sale
    const saleId = `sale-${Date.now()}`;
    const sale = {
      id: saleId,
      customer_id,
      total,
      subtotal: total + discount,
      discount,
      payment_method_id,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    
    this.data.sales.push(sale);
    
    // Create sale items
    items.forEach((item: any) => {
      this.data.sale_items.push({
        id: `item-${Date.now()}-${Math.random()}`,
        sale_id: saleId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      });

      // Update product stock
      const productIndex = this.data.products.findIndex(p => p.id === item.product_id);
      if (productIndex !== -1) {
        this.data.products[productIndex].stock_quantity -= item.quantity;
      }
    });

    return Promise.resolve({
      data: { sale_id: saleId },
      error: null,
    });
  }

  private deleteSaleWithItemsRPC(params: any) {
    const { sale_id } = params;
    
    // Remove sale items first
    this.data.sale_items = this.data.sale_items.filter(item => item.sale_id !== sale_id);
    
    // Remove sale
    this.data.sales = this.data.sales.filter(sale => sale.id !== sale_id);
    
    return Promise.resolve({
      data: true,
      error: null,
    });
  }

  private recalcCustomerInsightsRPC(params: any) {
    // Simplified insight calculation
    return Promise.resolve({
      data: true,
      error: null,
    });
  }

  private getSalesTrendsRPC(params: any) {
    // Return mock trends data
    return Promise.resolve({
      data: [
        { period: '2024-07', total: 1500.00, count: 15 },
        { period: '2024-08', total: 1800.00, count: 18 },
      ],
      error: null,
    });
  }

  private getTopProductsRPC(params: any) {
    // Return mock top products
    return Promise.resolve({
      data: fixtureProducts.slice(0, 3).map(product => ({
        ...product,
        total_sold: Math.floor(Math.random() * 100),
        revenue: product.price * Math.floor(Math.random() * 100),
      })),
      error: null,
    });
  }

  // Simulate auth
  auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: fixtureUsers[0] },
      error: null,
    }),
    signIn: vi.fn().mockResolvedValue({
      data: { user: fixtureUsers[0], session: {} },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn(),
  };
}

// Global test database instance
export const testDB = new SupabaseTestDB();