/**
 * Tipos TypeScript para o sistema de fornecedores
 */

export interface Supplier {
  id: string;
  company_name: string;
  contact_info: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  products_supplied: string[];
  delivery_time?: string;
  payment_methods: string[];
  minimum_order_value: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SupplierFormData {
  company_name: string;
  contact_info: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  products_supplied: string[];
  delivery_time?: string;
  payment_methods: string[];
  minimum_order_value: number;
  notes?: string;
}

export interface SupplierFilters {
  search?: string;
  products_supplied?: string;
  payment_method?: string;
  min_order_value?: number;
  is_active?: boolean;
}

export interface SupplierStats {
  total_suppliers: number;
  active_suppliers: number;
  avg_delivery_time: number;
  total_product_categories: number;
}

// Opções padrão para formulários
export const PAYMENT_METHODS_OPTIONS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
] as const;

export const DELIVERY_TIME_OPTIONS = [
  { value: '24h', label: '24 horas' },
  { value: '2-3_dias', label: '2-3 dias' },
  { value: '1_semana', label: '1 semana' },
  { value: '2_semanas', label: '2 semanas' },
  { value: '1_mes', label: '1 mês' },
  { value: 'sob_consulta', label: 'Sob consulta' },
] as const;