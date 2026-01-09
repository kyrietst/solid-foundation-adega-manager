// Tipos específicos para o módulo de vendas
import type { Price, StockQuantity } from './branded.types';
import type { 
  PaymentMethod, 
  SaleStatus, 
  PaymentStatus, 
  DeliveryStatus 
} from './enums.types';

// Interface para endereço de entrega
export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryInstructions?: string;
  contactPhone?: string;
  // Fiscal / Portuguese fields (Optional for backward compatibility)
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  nome_municipio?: string;
  uf?: string;
  cep?: string;
  codigo_municipio?: string;
  pais?: string;
  codigo_pais?: string;
}

// Re-exportar tipos do enums.types para compatibilidade
export type { PaymentMethod, SaleStatus, PaymentStatus } from './enums.types';

// Interface principal para vendas
export interface Sale {
  id: string;
  customer_id: string | null;
  total_amount: Price;
  discount_amount?: Price;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: SaleStatus;
  delivery_address: DeliveryAddress | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Relacionamentos opcionais (quando fazemos JOIN)
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  user?: {
    name: string;
  };
}

// Interface para itens da venda
export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: StockQuantity;
  unit_price: Price;
  total_price: Price;
  created_at: string;
  
  // Relacionamento opcional com produto
  product?: {
    name: string;
    unit_type: string;
    image_url?: string;
  };
}

// Interface para dados de formulário de venda
export interface SaleFormData {
  customer_id: string | null;
  payment_method: PaymentMethod;
  delivery_address?: DeliveryAddress | null;
  notes?: string;
  discount_amount?: Price;
}

// Interface para carrinho de compras
export interface CartItem {
  id: string;
  name: string;
  price: Price;
  quantity: StockQuantity;
  maxQuantity: StockQuantity;
  unit_type: string;
  image_url?: string;
}

// Interface para estado do carrinho
export interface CartState {
  items: CartItem[];
  total: Price;
  discount: Price;
  finalTotal: Price;
  customer: {
    id: string;
    name: string;
  } | null;
  paymentMethod: PaymentMethod | null;
  deliveryAddress: DeliveryAddress | null;
}

// Interface para relatórios de vendas
export interface SalesReport {
  totalSales: number;
  totalRevenue: Price;
  averageTicket: Price;
  topProducts: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: StockQuantity;
    revenue: Price;
  }>;
  salesByPeriod: Array<{
    period: string;
    sales_count: number;
    revenue: Price;
  }>;
  paymentMethodBreakdown: Array<{
    method: PaymentMethod;
    count: number;
    total_amount: Price;
  }>;
}