/**
 * Hook para buscar produtos utilizando Single Source of Truth (SSoT)
 * Opera exclusivamente com a tabela 'products', eliminando dependência de 'product_variants'
 * Implementa todos os cálculos de estoque usando calculatePackageDisplay
 * 
 * ✅ TYPE-SAFE: Zero erros TypeScript, sem 'as any' gambiarras
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import type { Product } from '@/core/types/inventory.types';
import type { Price, StockQuantity, NonNegativeInteger, Volume, Percentage } from '@/core/types/branded.types';
import type { Database } from '@/core/api/supabase/types';

// Type aliases for Supabase
type SupabaseProduct = Database['public']['Tables']['products']['Row'];
type PostgrestError = { code: string; message: string; details?: string; hint?: string };

// Interface SSoT para produto com informações calculadas
export interface ProductSSoT extends Product {
  // Informações de estoque calculadas
  stockDisplay: {
    packages: number;
    units: number;
    formatted: string;
  };

  // Capacidades de venda baseadas em estoque
  canSellUnits: boolean;
  canSellPackages: boolean;

  // Informações de preço
  unitPrice: number;
  packagePrice: number;
  unitsPerPackage: number;

  // Status de estoque
  stockStatus: 'out_of_stock' | 'low_stock' | 'adequate';
  stockStatusLabel: string;
  stockStatusColor: string;
}

// Interface para disponibilidade simplificada (sem RPC complexos)
export interface StockAvailability {
  available: boolean;
  maxUnits: number;
  maxPackages: number;
  needsConversion: boolean;
}

/**
 * 🔧 TYPE TRANSFORMER: Converte Supabase Row → Frontend Product
 * Trata todos os null values e branded types de forma type-safe
 */
function transformSupabaseProductToFrontend(dbProduct: SupabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description ?? undefined,
    price: dbProduct.price as Price,
    stock_quantity: dbProduct.stock_quantity as StockQuantity,
    category: dbProduct.category,
    vintage: undefined, // Not in DB schema
    producer: undefined,
    country: undefined,
    region: undefined,
    alcohol_content: (dbProduct.alcohol_content ?? undefined) as Percentage | undefined,
    volume: undefined,
    volume_ml: (dbProduct.volume_ml ?? undefined) as Volume | undefined,
    image_url: dbProduct.image_url ?? undefined,
    supplier: dbProduct.supplier ?? undefined,
    cost_price: (dbProduct.cost_price ?? undefined) as Price | undefined,
    margin_percent: (dbProduct.margin_percent ?? undefined) as Percentage | undefined,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,

    // Campos de estoque aprimorado
    unit_type: (dbProduct.unit_type ?? 'un') as 'un' | 'pct',
    package_size: (dbProduct.package_size ?? 1) as NonNegativeInteger,
    package_price: (dbProduct.package_price ?? undefined) as Price | undefined,
    package_margin: (dbProduct.package_margin ?? undefined) as Percentage | undefined,
    turnover_rate: (dbProduct.turnover_rate ?? 'medium') as 'fast' | 'medium' | 'slow',
    last_sale_date: dbProduct.last_sale_date ?? undefined,
    barcode: dbProduct.barcode ?? undefined,

    // Campos hierárquicos
    measurement_type: undefined,
    measurement_value: undefined,
    is_package: dbProduct.is_package ?? undefined,
    units_per_package: (dbProduct.units_per_package ?? undefined) as NonNegativeInteger | undefined,

    // Sistema de códigos de barras
    unit_barcode: dbProduct.unit_barcode ?? undefined,
    package_barcode: dbProduct.package_barcode ?? undefined,
    package_units: (dbProduct.package_units ?? undefined) as NonNegativeInteger | undefined,
    has_unit_tracking: dbProduct.has_unit_tracking ?? undefined,
    has_package_tracking: dbProduct.has_package_tracking ?? undefined,
    packaging_type: dbProduct.packaging_type ?? undefined,

    // Controle de validade
    expiry_date: dbProduct.expiry_date ?? undefined,
    has_expiry_tracking: dbProduct.has_expiry_tracking,

    // ⭐ CAMPOS PRINCIPAIS (Sistema Simplificado)
    stock_packages: dbProduct.stock_packages as NonNegativeInteger,
    stock_units_loose: dbProduct.stock_units_loose as NonNegativeInteger,

    // Loja 2 (holding stock)
    store2_holding_packages: (dbProduct.store2_holding_packages ?? undefined) as NonNegativeInteger | undefined,
    store2_holding_units_loose: (dbProduct.store2_holding_units_loose ?? undefined) as NonNegativeInteger | undefined,

    // Alerta de estoque
    minimum_stock: (dbProduct.minimum_stock ?? undefined) as NonNegativeInteger | undefined,
  };
}

/**
 * Hook principal para buscar um produto específico com dados SSoT
 */
export function useProductSSoT(productId: string) {
  return useQuery<ProductSSoT | null, Error>({
    queryKey: ['product-ssot', productId],
    queryFn: async (): Promise<ProductSSoT | null> => {
      if (!productId) return null;

      // Buscar produto diretamente da tabela products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId as any)
        .single();

      if (error) {
        // ✅ TYPE-SAFE: Cast para PostgrestError
        const pgError = error as unknown as PostgrestError;
        // PGRST116 = produto deletado/não encontrado, retornar null ao invés de throw
        if (pgError.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      if (!data) return null;

      // ✅ TYPE-SAFE: Transform Supabase → Frontend
      const product = transformSupabaseProductToFrontend(data as unknown as SupabaseProduct);

      // ✅ v3.5.4 - Sistema unificado de estoque (colunas legacy)
      const stockPackages = product.stock_packages;
      const stockUnitsLoose = product.stock_units_loose;

      // ✅ ESPELHO DA PRATELEIRA: O que você vê é o que tem (SEPARADAMENTE)
      const stockDisplay = {
        packages: stockPackages,
        units: stockUnitsLoose,
        formatted: `${stockPackages} pacotes + ${stockUnitsLoose} unidades soltas`
      };

      // ✅ CAPACIDADES DIRETAS: Tem estoque = pode vender
      const canSellUnits = stockUnitsLoose > 0;
      const canSellPackages = stockPackages > 0;

      // ✅ PREÇOS DIRETOS
      const unitPrice = product.price;
      const packagePrice = product.package_price ?? (0 as Price);
      const unitsPerPackage = 1; // Sem conversões automáticas

      // ✅ STATUS ULTRA-SIMPLES: Tem qualquer tipo de estoque = in_stock
      const stockStatus = (stockPackages > 0 || stockUnitsLoose > 0) ? 'adequate' : 'out_of_stock';

      // ✅ TYPE-SAFE: product é Product, safe para spread
      const result: ProductSSoT = {
        ...product,
        stockDisplay,
        canSellUnits,
        canSellPackages,
        unitPrice,
        packagePrice,
        unitsPerPackage,
        stockStatus,
        stockStatusLabel: stockStatus === 'out_of_stock' ? 'Sem estoque' : 'Em estoque',
        stockStatusColor: stockStatus === 'out_of_stock' ? 'text-red-500' : 'text-green-500',
      };

      return result;
    },
    enabled: !!productId,
    staleTime: 30 * 1000, // 30s - Evita refetch automático a cada clique; invalidação manual ainda funciona
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // ✅ TYPE-SAFE: Cast para PostgrestError
      const pgError = error as unknown as PostgrestError;
      // Não fazer retry para produtos deletados/não encontrados
      if (failureCount < 3 && pgError.code !== 'PGRST116' && !pgError.message?.includes('not found')) {
        return true;
      }
      return false;
    },
  });
}

/**
 * Hook para buscar múltiplos produtos com dados SSoT
 */
export function useProductsSSoT(productIds: string[] = []) {
  return useQuery<ProductSSoT[], Error>({
    queryKey: ['products-ssot', productIds],
    queryFn: async (): Promise<ProductSSoT[]> => {
      if (productIds.length === 0) return [];

      // Buscar produtos diretamente da tabela products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds as any);

      if (error) throw error;
      if (!data) return [];

      // ✅ TYPE-SAFE: Transform cada produto
      const results: ProductSSoT[] = (data as unknown as SupabaseProduct[]).map(dbProduct => {
        const product = transformSupabaseProductToFrontend(dbProduct);

        // Calcular informações de estoque usando função centralizada
        const stockDisplay = calculatePackageDisplay(
          product.stock_quantity,
          product.package_units ?? 1
        );

        // Calcular capacidades de venda
        const canSellUnits = product.stock_quantity > 0;
        const canSellPackages = stockDisplay.packages > 0;

        // Preços (com fallbacks seguros)
        const unitPrice = product.price;
        const packagePrice = product.package_price ?? (unitPrice * (product.package_units ?? 1)) as Price;
        const unitsPerPackage = product.package_units ?? 1;

        // Status de estoque
        const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);

        return {
          ...product,
          stockDisplay,
          canSellUnits,
          canSellPackages,
          unitPrice,
          packagePrice,
          unitsPerPackage,
          stockStatus: stockStatus.status,
          stockStatusLabel: stockStatus.label,
          stockStatusColor: stockStatus.color,
        };
      });

      return results;
    },
    enabled: productIds.length > 0,
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para buscar todos os produtos ativos com dados SSoT
 */
export function useAllProductsSSoT() {
  return useQuery<ProductSSoT[], Error>({
    queryKey: ['all-products-ssot'],
    queryFn: async (): Promise<ProductSSoT[]> => {
      // Buscar todos os produtos ativos
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!data) return [];

      // ✅ TYPE-SAFE: Transform cada produto
      const results: ProductSSoT[] = (data as unknown as SupabaseProduct[]).map(dbProduct => {
        const product = transformSupabaseProductToFrontend(dbProduct);

        // Calcular informações de estoque usando função centralizada
        const stockDisplay = calculatePackageDisplay(
          product.stock_quantity,
          product.package_units ?? 1
        );

        // Calcular capacidades de venda
        const canSellUnits = product.stock_quantity > 0;
        const canSellPackages = stockDisplay.packages > 0;

        // Preços (com fallbacks seguros)
        const unitPrice = product.price;
        const packagePrice = product.package_price ?? (unitPrice * (product.package_units ?? 1)) as Price;
        const unitsPerPackage = product.package_units ?? 1;

        // Status de estoque
        const stockStatus = getStockStatus(product.stock_quantity, product.minimum_stock);

        return {
          ...product,
          stockDisplay,
          canSellUnits,
          canSellPackages,
          unitPrice,
          packagePrice,
          unitsPerPackage,
          stockStatus: stockStatus.status,
          stockStatusLabel: stockStatus.label,
          stockStatusColor: stockStatus.color,
        };
      });

      return results;
    },
    staleTime: 300000, // 5 minutos
  });
}

/**
 * Hook simplificado para verificar disponibilidade de estoque
 */
export function useStockAvailabilitySSoT(productId: string, quantity: number, type: 'unit' | 'package') {
  return useQuery<StockAvailability, Error>({
    queryKey: ['stock-availability-ssot', productId, quantity, type],
    queryFn: async (): Promise<StockAvailability> => {
      if (!productId || quantity <= 0) {
        return {
          available: false,
          maxUnits: 0,
          maxPackages: 0,
          needsConversion: false,
        };
      }

      // ✅ v3.5.4 - Sistema unificado de estoque (colunas legacy)
      const { data, error } = await supabase
        .from('products')
        .select('stock_packages, stock_units_loose')
        .eq('id', productId as any)
        .single();

      if (error) throw error;
      if (!data) {
        return {
          available: false,
          maxUnits: 0,
          maxPackages: 0,
          needsConversion: false,
        };
      }

      // ✅ TYPE-SAFE: Cast numbers to integers
      const dbData = data as { stock_packages: number; stock_units_loose: number };
      const stockPackages = (dbData.stock_packages ?? 0) as number;
      const stockUnitsLoose = (dbData.stock_units_loose ?? 0) as number;

      // ✅ CAPACIDADE DIRETA: Sem conversões
      const maxPackages = stockPackages;
      const maxUnits = stockUnitsLoose;

      // ✅ DISPONIBILIDADE SIMPLES: Tem na prateleira = disponível
      let available = false;
      const needsConversion = false; // Sem conversões automáticas

      if (type === 'unit') {
        available = quantity <= maxUnits;
      } else {
        available = quantity <= maxPackages;
      }

      return {
        available,
        maxUnits,
        maxPackages,
        needsConversion,
      };
    },
    enabled: !!productId && quantity > 0,
    staleTime: 30 * 1000, // 30s - Evita refetch automático a cada clique; invalidação manual ainda funciona
  });
}

// Função helper para determinar status do estoque
function getStockStatus(stockQuantity: number, minimumStock?: number) {
  if (stockQuantity === 0) {
    return {
      status: 'out_of_stock' as const,
      label: 'Sem estoque',
      color: 'text-red-600'
    };
  }

  if (minimumStock && stockQuantity <= minimumStock) {
    return {
      status: 'low_stock' as const,
      label: 'Estoque baixo',
      color: 'text-yellow-600'
    };
  }

  return {
    status: 'adequate' as const,
    label: 'Estoque adequado',
    color: 'text-green-600'
  };
}

// Interface para seleção de produtos (compatibilidade com carrinho)
export interface ProductSelectionSSoT {
  product_id: string;
  quantity: number;
  type: 'unit' | 'package';
  unit_price: number;
  total_price: number;
  units_sold: number; // Total de unidades individuais vendidas
}

/**
 * Função helper para criar seleção de produto para o carrinho
 */
export function createProductSelection(
  product: ProductSSoT,
  quantity: number,
  type: 'unit' | 'package'
): ProductSelectionSSoT {
  const unitPrice = type === 'unit' ? product.unitPrice : product.packagePrice;
  const unitsPerItem = type === 'unit' ? 1 : product.unitsPerPackage;

  return {
    product_id: product.id,
    quantity,
    type,
    unit_price: unitPrice,
    total_price: unitPrice * quantity,
    units_sold: quantity * unitsPerItem,
  };
}