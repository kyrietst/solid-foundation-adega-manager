// Tipos específicos para o módulo de estoque aprimorado

export type UnitType = 'un' | 'pct';
export type TurnoverRate = 'fast' | 'medium' | 'slow';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category: string;
  vintage?: number;
  producer?: string;
  country?: string;
  region?: string;
  alcohol_content?: number;
  volume?: number; // Mantendo compatibilidade com campo antigo
  volume_ml?: number; // Novo campo em mililitros
  image_url?: string;
  supplier?: string;
  minimum_stock: number;
  cost_price?: number;
  margin_percent?: number;
  created_at: string;
  updated_at: string;
  
  // Novos campos para estoque aprimorado
  unit_type: UnitType;
  package_size: number;
  package_price?: number;
  package_margin?: number;
  turnover_rate: TurnoverRate;
  last_sale_date?: string;
  barcode?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price?: number;
  margin_percent?: number;
  stock_quantity: number;
  minimum_stock: number;
  supplier?: string;
  producer?: string;
  country?: string;
  region?: string;
  vintage?: number;
  alcohol_content?: number;
  volume_ml?: number;
  image_url?: string;
  
  // Novos campos
  unit_type: UnitType;
  package_size: number;
  package_price?: number;
  package_margin?: number;
  barcode?: string;
}

export interface ProductCalculations {
  // Cálculos automáticos de margem
  unitMargin?: number;
  packageMargin?: number;
  unitProfitAmount?: number;
  packageProfitAmount?: number;
  
  // Conversões
  pricePerUnit?: number;
  pricePerPackage?: number;
  
  // Métricas de giro
  daysSinceLastSale?: number;
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
  format?: 'EAN-8' | 'EAN-13' | 'UPC-A' | 'UPC-E' | 'CODE-128' | 'UNKNOWN';
  error?: string;
}

export interface BarcodeComponentProps {
  onScan: (barcode: string) => Promise<void>;
  disabled?: boolean;
  autoFocus?: boolean;
}