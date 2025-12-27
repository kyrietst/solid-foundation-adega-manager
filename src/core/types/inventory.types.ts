// Tipos específicos para o módulo de estoque aprimorado
import type {
  Price,
  StockQuantity,
  Volume,
  Year,
  Percentage,
  NonNegativeInteger
} from './branded.types';
import type {
  ProducingCountry,
  WineRegion
} from './enums.types';

export type UnitType = 'un' | 'pct';
export type TurnoverRate = 'fast' | 'medium' | 'slow';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: Price;
  stock_quantity: StockQuantity;
  category: string; // Categoria dinâmica do banco de dados
  vintage?: Year;
  producer?: string;
  country?: ProducingCountry;
  region?: WineRegion;
  alcohol_content?: Percentage;
  volume?: Volume; // Mantendo compatibilidade com campo antigo
  volume_ml?: Volume; // Novo campo em mililitros
  image_url?: string;
  supplier?: string;
  cost_price?: Price;
  margin_percent?: Percentage;
  created_at: string;
  updated_at: string;

  // Novos campos para estoque aprimorado
  unit_type: UnitType;
  package_size: NonNegativeInteger;
  package_price?: Price;
  package_margin?: Percentage;
  turnover_rate: TurnoverRate;
  last_sale_date?: string;
  barcode?: string;

  // Campos adicionados na história 1.1 - Schema e Políticas de Segurança
  measurement_type?: string; // Tipo de medição (Volume, Unidade, etc.)
  measurement_value?: string; // Valor da medição para campos dinâmicos
  is_package?: boolean; // Se o produto é um pacote vs unidade individual
  units_per_package?: NonNegativeInteger; // Número de unidades por pacote

  // Campos do sistema hierárquico de códigos de barras
  unit_barcode?: string; // Código de barras da unidade individual
  package_barcode?: string; // Código de barras do pacote/fardo
  package_units?: NonNegativeInteger; // Quantidade de unidades por pacote
  has_unit_tracking?: boolean; // Se permite venda por unidade
  has_package_tracking?: boolean; // Se permite venda por pacote
  packaging_type?: string; // Tipo de embalagem (fardo, caixa, etc.)

  // Campos de controle de validade
  expiry_date?: string; // Data de validade do produto (ISO string)
  has_expiry_tracking?: boolean; // Se este produto tem controle de validade

  // Campos Fiscais (NFe/NFCe)
  ncm?: string;
  cest?: string;
  cfop?: string;
  origin?: string;

  // ⭐ CAMPOS PRINCIPAIS DO SISTEMA SIMPLIFICADO ⭐
  // "O Estoque é um Espelho da Prateleira" - apenas 2 números diretos
  stock_packages: NonNegativeInteger; // Quantidade de pacotes fechados em estoque
  stock_units_loose: NonNegativeInteger; // Quantidade de unidades soltas em estoque

  // 🏪 CAMPOS LOJA 2 (HOLDING STOCK) - v3.6.1+ "Active vs Holding" Architecture
  store2_holding_packages?: NonNegativeInteger; // Estoque de pacotes na Loja 2 (depósito)
  store2_holding_units_loose?: NonNegativeInteger; // Estoque de unidades soltas na Loja 2 (depósito)

  // 📊 CAMPO DE ALERTA DE ESTOQUE BAIXO
  minimum_stock?: NonNegativeInteger; // Limite mínimo de estoque (herdado de category.default_min_stock)

  // NOTA: stock_quantity é DEPRECATED - usar apenas os 2 campos acima
  // v3.5.4 - Sistema multistore removido, consolidado em colunas legacy
}

export interface ProductFormData {
  name: string;
  description?: string;
  category: string; // Categoria dinâmica do banco de dados
  price: Price;
  cost_price?: Price;
  margin_percent?: Percentage;
  stock_quantity: StockQuantity; // DEPRECATED - manter para compatibilidade
  supplier?: string;
  producer?: string;
  country?: ProducingCountry;
  region?: WineRegion;
  vintage?: Year;
  alcohol_content?: Percentage;
  volume_ml?: Volume;
  image_url?: string;

  // ⭐ CAMPOS PRINCIPAIS DO SISTEMA SIMPLIFICADO ⭐
  stock_packages: NonNegativeInteger; // Quantidade de pacotes fechados
  stock_units_loose: NonNegativeInteger; // Quantidade de unidades soltas

  // Novos campos
  unit_type: UnitType;
  package_size: NonNegativeInteger;
  package_price?: Price;
  package_margin?: Percentage;
  turnover_rate?: TurnoverRate;
  barcode?: string;

  // Campos adicionados na história 1.1 - Schema e Políticas de Segurança
  measurement_type?: string; // Tipo de medição para campos dinâmicos
  measurement_value?: string; // Valor da medição para campos dinâmicos
  is_package?: boolean; // Se é pacote vs unidade individual
  units_per_package?: NonNegativeInteger; // Unidades por pacote

  // Campos do sistema hierárquico de códigos de barras
  unit_barcode?: string; // Código de barras da unidade individual
  package_barcode?: string; // Código de barras do pacote/fardo
  package_units?: NonNegativeInteger; // Quantidade de unidades por pacote
  has_unit_tracking?: boolean; // Se permite venda por unidade
  has_package_tracking?: boolean; // Se permite venda por pacote
  packaging_type?: string; // Tipo de embalagem (fardo, caixa, etc.)

  // Campos de controle de validade
  expiry_date?: string; // Data de validade do produto (ISO string)
  has_expiry_tracking?: boolean; // Se este produto tem controle de validade

  // Campos Fiscais (NFe/NFCe)
  ncm?: string;
  cest?: string;
  cfop?: string;
  origin?: string; // Origem da mercadoria (0, 1, 2...)

  // Alerta de Estoque
  minimum_stock?: NonNegativeInteger;
}

export interface ProductCalculations {
  // Cálculos automáticos de margem
  unitMargin?: Percentage;
  packageMargin?: Percentage;
  unitProfitAmount?: Price;
  packageProfitAmount?: Price;

  // Conversões
  pricePerUnit?: Price;
  pricePerPackage?: Price;

  // Métricas de giro
  daysSinceLastSale?: NonNegativeInteger;
  salesVelocity?: 'high' | 'medium' | 'low';
  reorderRecommendation?: boolean;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  fastMovingCount: number;
  slowMovingCount: number;
  averageMargin: number;
  topCategories: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  productCount: number;
  totalValue: number;
  averageMargin: number;
}

export interface TurnoverAnalysis {
  productId: string;
  productName: string;
  category: string;
  lastSaleDate?: string;
  daysSinceLastSale: number;
  salesLast30Days: number;
  salesLast60Days: number;
  salesLast90Days: number;
  currentTurnoverRate: TurnoverRate;
  recommendedTurnoverRate: TurnoverRate;
  stockLevel: 'low' | 'adequate' | 'high';
  reorderSuggestion: boolean;
}

// Filtros para a interface de estoque
export interface InventoryFilters {
  category?: string;
  turnoverRate?: TurnoverRate;
  unitType?: UnitType;
  stockStatus?: 'low' | 'adequate' | 'high';
  supplier?: string;
  search?: string;
}

// Opções para ordenação
export type SortOption =
  | 'name'
  | 'category'
  | 'price'
  | 'stock_quantity'
  | 'turnover_rate'
  | 'last_sale_date'
  | 'margin_percent'
  | 'updated_at';

export interface SortConfig {
  field: SortOption;
  direction: 'asc' | 'desc';
}

// Interfaces específicas para código de barras
export interface BarcodeOperation {
  barcode: string;
  productId?: string;
  timestamp: Date;
  operation: 'scan' | 'manual_entry' | 'update';
  success: boolean;
  error?: string;
}

export interface BarcodeValidation {
  isValid: boolean;
  format?: 'EAN-8' | 'EAN-13' | 'UPC-A' | 'UPC-E' | 'CODE-128' | 'CUSTOM' | 'UNKNOWN';
  error?: string;
}

export interface BarcodeComponentProps {
  onScan: (barcode: string) => Promise<void>;
  disabled?: boolean;
  autoFocus?: boolean;
}

// Interface para movimentações de estoque
export interface InventoryMovement {
  id: string;
  type: 'in' | 'out' | 'fiado' | 'devolucao';
  product_id: string;
  quantity: StockQuantity;
  reason: string | null;
  customer_id: string | null;
  amount: Price | null;
  due_date: string | null;
  sale_id: string | null;
  user_id: string | null;
  date: string;
  created_at: string;
  updated_at: string;

  // Relacionamentos opcionais (quando fazemos JOIN)
  product?: {
    name: string;
    unit_type: UnitType;
    price: Price;
  };
  // Propriedade usada no query useMovements (alias 'products')
  products?: {
    id: string;
    name: string;
    price?: number;
    unit_type?: UnitType;
  };
  customer?: {
    name: string;
    phone?: string;
  };
  user?: {
    name: string;
  };
  sales?: {
    id: string;
    created_at: string;
    delivery_type: string;
    payment_method: string;
    payment_status: string;
    status: string;
    final_amount: number;
    sale_items?: Array<{
      id: string;
      product_id: string;
      quantity: number;
      unit_price: number;
      products?: {
        name: string;
        barcode?: string;
      };
    }>;
    // Novos campos de entrega e cliente
    delivery_fee?: number;
    discount_amount?: number;
    delivery_address?: any; // JSONB
    delivery_person?: {
      full_name: string;
    };
    customer?: {
      name: string;
    };
  };
}