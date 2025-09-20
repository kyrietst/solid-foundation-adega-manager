/**
 * Tipos para o novo sistema de variantes de produtos
 * Integra com as tabelas product_variants e inventory_conversion_log
 */

import type { Price, StockQuantity, Percentage } from './branded.types';

export type VariantType = 'unit' | 'package';
export type ConversionType = 'package_to_units' | 'units_to_package' | 'auto_restock';
export type VariantSelectorContext = 'sales' | 'inventory';

// Interface para uma variante de produto
export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: VariantType;
  barcode: string | null;
  price: Price;
  cost_price: Price | null;
  stock_quantity: StockQuantity;
  units_in_package: number | null; // NULL para unidades, valor para pacotes
  margin_percent: Percentage | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface estendida do produto com suas variantes
export interface ProductWithVariants {
  id: string;
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  supplier?: string;
  producer?: string;
  country?: string;
  region?: string;
  vintage?: number;
  alcohol_content?: number;
  volume_ml?: number;
  created_at: string;
  updated_at: string;
  
  // Variantes disponíveis
  variants: ProductVariant[];
  
  // Campos calculados baseados nas variantes
  unit_variant?: ProductVariant;
  package_variant?: ProductVariant;
  total_stock_units: number; // Total em unidades considerando conversões
  has_both_variants: boolean;
  
  // Para vendas (requer estoque > 0)
  can_sell_units: boolean;
  can_sell_packages: boolean;
  
  // Para ajustes de estoque (só requer variante configurada)
  can_adjust_units: boolean;
  can_adjust_packages: boolean;
}

// Dados para seleção de variante no modal
export interface VariantSelectionData {
  variant_id: string;
  variant_type: VariantType;
  quantity: number;
  unit_price: Price;
  total_price: Price;
  units_sold: number; // Unidades efetivamente vendidas (para conversão)
  conversion_required: boolean;
  packages_converted?: number;
}

// Interface para item do carrinho com suporte a variantes
export interface CartItemWithVariant {
  id: string; // product_id
  variant_id: string;
  name: string;
  variant_type: VariantType;
  price: Price;
  quantity: number;
  maxQuantity: number;
  units_sold: number;
  packageUnits?: number;
  displayName: string;
  conversion_required: boolean;
  packages_converted?: number;
}

// Interface para log de conversão de estoque
export interface InventoryConversionLog {
  id: string;
  product_id: string;
  conversion_type: ConversionType;
  packages_converted: number;
  units_converted: number;
  units_per_package: number;
  package_stock_before: number;
  unit_stock_before: number;
  package_stock_after: number;
  unit_stock_after: number;
  user_id: string | null;
  reason: string | null;
  sale_id: string | null;
  created_at: string;
}

// Interface para resultado de verificação de disponibilidade
export interface VariantAvailabilityCheck {
  can_fulfill: boolean;
  current_stock: number;
  requested_quantity: number;
  total_units_available: number;
  needs_conversion: boolean;
}

// Interface para resultado de processamento de venda
export interface SaleProcessingResult {
  success: boolean;
  error?: string;
  packages_converted?: number;
  final_stock?: number;
  availability?: VariantAvailabilityCheck;
}

// Interface para dados do item de venda atualizado
export interface SaleItemWithVariant {
  id: string;
  sale_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: Price;
  units_sold: number;
  conversion_required: boolean;
  packages_converted: number;
  created_at: string;
  
  // Relacionamentos
  variant?: ProductVariant;
  product?: {
    name: string;
    category: string;
  };
}

// Interface para sugestão de rebalanceamento
export interface StockRebalancingSuggestion {
  product_name: string;
  current_state: {
    unit_stock: number;
    package_stock: number;
    total_units: number;
  };
  suggested_state: {
    unit_stock: number;
    package_stock: number;
    total_units: number;
  };
  actions_needed: {
    transfer_to_packages: number;
    convert_to_units: number;
  };
  pricing_info: {
    unit_price: Price;
    package_price: Price;
    units_per_package: number;
    package_savings: Price;
  };
}

// Interface para resultado de transferência de estoque
export interface StockTransferResult {
  success: boolean;
  error?: string;
  packages_created?: number;
  units_used?: number;
  units_remaining?: number;
  new_unit_stock?: number;
  new_package_stock?: number;
}

// Tipos para hooks e componentes
export interface UseProductVariantsOptions {
  includeInactive?: boolean;
  variantType?: VariantType;
}

export interface UseVariantAvailabilityOptions {
  product_id: string;
  variant_type: VariantType;
  quantity: number;
}

export interface UseStockConversionOptions {
  product_id: string;
  packages_to_convert: number;
  user_id?: string;
  reason?: string;
  sale_id?: string;
}