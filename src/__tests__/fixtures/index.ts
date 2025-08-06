// Test fixtures for consistent test data across the application

export const fixtureProducts = [
  {
    id: 'prod-wine-red-1',
    name: 'Cabernet Sauvignon Reserve',
    price: 125.90,
    cost_price: 65.00,
    stock_quantity: 45,
    min_stock: 10,
    category: 'Vinhos Tintos',
    volume: 750,
    barcode: '7891234567890',
    description: 'Vinho tinto encorpado com notas de frutas vermelhas',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod-wine-white-1',
    name: 'Chardonnay Premium',
    price: 89.50,
    cost_price: 45.00,
    stock_quantity: 32,
    min_stock: 8,
    category: 'Vinhos Brancos',
    volume: 750,
    barcode: '7891234567891',
    description: 'Vinho branco seco com aroma floral',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod-wine-rose-1',
    name: 'Rosé Special Edition',
    price: 67.80,
    cost_price: 32.00,
    stock_quantity: 15, // Low stock
    min_stock: 12,
    category: 'Vinhos Rosé',
    volume: 750,
    barcode: '7891234567892',
    description: 'Vinho rosé refrescante ideal para verão',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prod-sparkling-1',
    name: 'Prosecco Italiano',
    price: 156.90,
    cost_price: 78.00,
    stock_quantity: 28,
    min_stock: 6,
    category: 'Espumantes',
    volume: 750,
    barcode: '7891234567893',
    description: 'Espumante italiano tradicional',
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const fixtureCustomers = [
  {
    id: 'cust-high-value-1',
    name: 'Ricardo Almeida Santos',
    email: 'ricardo.santos@email.com',
    phone: '11987654321',
    segment: 'high_value',
    ltv: 2890.50,
    total_purchases: 15,
    last_purchase: '2024-07-15T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cust-regular-1',
    name: 'Maria Fernanda Silva',
    email: 'maria.silva@email.com',
    phone: '11876543210',
    segment: 'regular',
    ltv: 780.90,
    total_purchases: 8,
    last_purchase: '2024-07-20T00:00:00Z',
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'cust-occasional-1',
    name: 'João Paulo Oliveira',
    email: 'joao.oliveira@email.com',
    phone: '11765432109',
    segment: 'occasional',
    ltv: 245.80,
    total_purchases: 3,
    last_purchase: '2024-06-10T00:00:00Z',
    created_at: '2024-03-20T00:00:00Z',
  },
  {
    id: 'cust-new-1',
    name: 'Ana Carolina Costa',
    email: 'ana.costa@email.com',
    phone: '11654321098',
    segment: 'new',
    ltv: 89.50,
    total_purchases: 1,
    last_purchase: '2024-07-25T00:00:00Z',
    created_at: '2024-07-20T00:00:00Z',
  },
];

export const fixturePaymentMethods = [
  {
    id: 'payment-cash',
    name: 'Dinheiro',
    type: 'cash',
    is_active: true,
  },
  {
    id: 'payment-card',
    name: 'Cartão de Crédito',
    type: 'credit_card',
    is_active: true,
  },
  {
    id: 'payment-debit',
    name: 'Cartão de Débito',
    type: 'debit_card',
    is_active: true,
  },
  {
    id: 'payment-pix',
    name: 'PIX',
    type: 'pix',
    is_active: true,
  },
];

export const fixtureSales = [
  {
    id: 'sale-complete-1',
    customer_id: 'cust-high-value-1',
    total: 251.80,
    subtotal: 251.80,
    discount: 0,
    payment_method_id: 'payment-card',
    status: 'completed',
    notes: 'Venda para cliente VIP',
    created_at: '2024-07-15T14:30:00Z',
    items: [
      {
        id: 'item-1',
        product_id: 'prod-wine-red-1',
        quantity: 2,
        unit_price: 125.90,
        total: 251.80,
      },
    ],
  },
  {
    id: 'sale-with-discount-1',
    customer_id: 'cust-regular-1',
    total: 80.55,
    subtotal: 89.50,
    discount: 8.95, // 10% discount
    payment_method_id: 'payment-pix',
    status: 'completed',
    notes: 'Desconto de fidelidade aplicado',
    created_at: '2024-07-20T16:45:00Z',
    items: [
      {
        id: 'item-2',
        product_id: 'prod-wine-white-1',
        quantity: 1,
        unit_price: 89.50,
        total: 89.50,
      },
    ],
  },
  {
    id: 'sale-pending-1',
    customer_id: 'cust-occasional-1',
    total: 67.80,
    subtotal: 67.80,
    discount: 0,
    payment_method_id: 'payment-cash',
    status: 'pending',
    notes: 'Aguardando confirmação do pagamento',
    created_at: '2024-07-25T10:15:00Z',
    items: [
      {
        id: 'item-3',
        product_id: 'prod-wine-rose-1',
        quantity: 1,
        unit_price: 67.80,
        total: 67.80,
      },
    ],
  },
];

export const fixtureUsers = [
  {
    id: 'user-admin-1',
    email: 'admin@adega.com',
    role: 'admin',
    name: 'Administrador Principal',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-employee-1',
    email: 'vendedor@adega.com',
    role: 'employee',
    name: 'João Vendedor',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'user-delivery-1',
    email: 'entregador@adega.com',
    role: 'delivery',
    name: 'Carlos Entregador',
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
  },
];

export const fixtureInventoryMovements = [
  {
    id: 'movement-in-1',
    product_id: 'prod-wine-red-1',
    type: 'IN',
    quantity: 50,
    reason: 'Reposição de estoque',
    user_id: 'user-admin-1',
    created_at: '2024-07-01T09:00:00Z',
  },
  {
    id: 'movement-out-1',
    product_id: 'prod-wine-red-1',
    type: 'OUT',
    quantity: -2,
    reason: 'Venda realizada',
    sale_id: 'sale-complete-1',
    user_id: 'user-employee-1',
    created_at: '2024-07-15T14:30:00Z',
  },
  {
    id: 'movement-fiado-1',
    product_id: 'prod-wine-white-1',
    type: 'FIADO',
    quantity: -1,
    reason: 'Venda fiado - Cliente regular',
    customer_id: 'cust-regular-1',
    user_id: 'user-employee-1',
    created_at: '2024-07-18T11:20:00Z',
  },
];

// Scenarios for comprehensive testing
export const testScenarios = {
  // Cart scenarios
  emptyCart: {
    items: [],
    total: 0,
    subtotal: 0,
    discount: 0,
  },
  singleItemCart: {
    items: [
      {
        product_id: 'prod-wine-red-1',
        quantity: 1,
        unit_price: 125.90,
      },
    ],
    total: 125.90,
    subtotal: 125.90,
    discount: 0,
  },
  multipleItemsCart: {
    items: [
      {
        product_id: 'prod-wine-red-1',
        quantity: 2,
        unit_price: 125.90,
      },
      {
        product_id: 'prod-wine-white-1',
        quantity: 1,
        unit_price: 89.50,
      },
    ],
    total: 341.30,
    subtotal: 341.30,
    discount: 0,
  },
  cartWithDiscount: {
    items: [
      {
        product_id: 'prod-wine-red-1',
        quantity: 1,
        unit_price: 125.90,
      },
    ],
    total: 113.31, // 10% discount
    subtotal: 125.90,
    discount: 12.59,
  },

  // Stock scenarios
  lowStockProduct: {
    ...fixtureProducts[2], // Rosé with 15 units, min 12
    stock_quantity: 15,
    min_stock: 12,
  },
  outOfStockProduct: {
    ...fixtureProducts[0],
    stock_quantity: 0,
    min_stock: 10,
  },

  // Permission scenarios
  adminPermissions: {
    canCreateSales: true,
    canViewReports: true,
    canManageUsers: true,
    canManageProducts: true,
    canViewCostPrices: true,
    canManageDeliveries: true,
  },
  employeePermissions: {
    canCreateSales: true,
    canViewReports: true,
    canManageUsers: false,
    canManageProducts: true,
    canViewCostPrices: false,
    canManageDeliveries: false,
  },
  deliveryPermissions: {
    canCreateSales: false,
    canViewReports: false,
    canManageUsers: false,
    canManageProducts: false,
    canViewCostPrices: false,
    canManageDeliveries: true,
  },
};