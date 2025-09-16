/**
 * server.ts - MSW Server Setup (Context7 Pattern)
 * Mock Service Worker para testes com APIs reais simuladas
 * Implementa interceptação de requests HTTP para testing robusto
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock data para produtos
const mockProducts = [
  {
    id: '1',
    name: 'Vinho Tinto Premium',
    price: 89.90,
    category: 'vinhos',
    stock: 15,
    barcode: '7891234567890',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Champagne Francês',
    price: 245.50,
    category: 'espumantes',
    stock: 8,
    barcode: '7891234567891',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];

// Mock data para clientes
const mockCustomers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    segment: 'high_value',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    address: 'Av. Central, 456',
    segment: 'regular',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
];

// Mock data para vendas
const mockSales = [
  {
    id: '1',
    customer_id: '1',
    total: 89.90,
    payment_method: 'credit_card',
    status: 'completed',
    created_at: '2024-01-15T10:00:00.000Z',
    items: [
      {
        id: '1',
        product_id: '1',
        quantity: 1,
        price: 89.90
      }
    ]
  }
];

// Request handlers
const handlers = [
  // Produtos
  http.get('/rest/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('name');

    let products = mockProducts;
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return HttpResponse.json(products);
  }),

  http.get('/rest/v1/products/:id', ({ params }) => {
    const product = mockProducts.find(p => p.id === params.id);
    if (!product) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(product);
  }),

  http.post('/rest/v1/products', async ({ request }) => {
    const newProduct = await request.json() as any;
    const product = {
      id: (mockProducts.length + 1).toString(),
      ...newProduct,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockProducts.push(product);
    return HttpResponse.json(product, { status: 201 });
  }),

  // Clientes
  http.get('/rest/v1/customers', () => {
    return HttpResponse.json(mockCustomers);
  }),

  http.get('/rest/v1/customers/:id', ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);
    if (!customer) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(customer);
  }),

  http.post('/rest/v1/customers', async ({ request }) => {
    const newCustomer = await request.json() as any;
    const customer = {
      id: (mockCustomers.length + 1).toString(),
      ...newCustomer,
      segment: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockCustomers.push(customer);
    return HttpResponse.json(customer, { status: 201 });
  }),

  // Vendas
  http.get('/rest/v1/sales', () => {
    return HttpResponse.json(mockSales);
  }),

  http.post('/rest/v1/sales', async ({ request }) => {
    const newSale = await request.json() as any;
    const sale = {
      id: (mockSales.length + 1).toString(),
      ...newSale,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    mockSales.push(sale);
    return HttpResponse.json(sale, { status: 201 });
  }),

  // Stored procedures / RPC
  http.post('/rest/v1/rpc/process_sale', async ({ request }) => {
    const saleData = await request.json() as any;
    const sale = {
      id: (mockSales.length + 1).toString(),
      ...saleData,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    mockSales.push(sale);
    return HttpResponse.json(sale);
  }),

  // Error handlers for testing
  http.get('/rest/v1/error-test', () => {
    return new HttpResponse(
      JSON.stringify({ message: 'Erro simulado para testes' }),
      { status: 500 }
    );
  }),
];

// Setup server
export const server = setupServer(...handlers);

// Utilities para testes
export const resetMockData = () => {
  mockProducts.splice(2); // Keep first 2
  mockCustomers.splice(2); // Keep first 2
  mockSales.splice(1); // Keep first 1
};

export const addMockProduct = (product: any) => {
  const newProduct = {
    id: (mockProducts.length + 1).toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...product
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const addMockCustomer = (customer: any) => {
  const newCustomer = {
    id: (mockCustomers.length + 1).toString(),
    segment: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...customer
  };
  mockCustomers.push(newCustomer);
  return newCustomer;
};

export default server;