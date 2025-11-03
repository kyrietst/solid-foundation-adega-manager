/**
 * Hook para buscar produtos utilizando Single Source of Truth (SSoT)
 * Opera exclusivamente com a tabela 'products', eliminando dependência de 'product_variants'
 * Implementa todos os cálculos de estoque usando calculatePackageDisplay
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import type { Product } from '@/types/inventory.types';

// Interface SSoT para produto com informações calculadas
export interface ProductSSoT extends Product {
  // Informações de estoque calculadas
  stockDisplay: {
    packages: number;
    units: number;
    total: number;
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
 * Hook principal para buscar um produto específico com dados SSoT
 */
export function useProductSSoT(productId: string) {
  return useQuery({
    queryKey: ['product-ssot', productId],
    queryFn: async (): Promise<ProductSSoT | null> => {
      if (!productId) return null;

      // Buscar produto diretamente da tabela products
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        // PGRST116 = produto deletado/não encontrado, retornar null ao invés de throw
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      if (!product) return null;

      // 🏪 v3.4.2 - Usar estoque da LOJA 1 (vendas sempre da Loja 1)
      const stockPackages = product.store1_stock_packages || 0;
      const stockUnitsLoose = product.store1_stock_units_loose || 0;
      // ✅ CORREÇÃO: Ler apenas da Loja 1 (fonte de vendas)

      // ✅ ESPELHO DA PRATELEIRA: O que você vê é o que tem (SEPARADAMENTE)
      const stockDisplay = {
        packages: stockPackages,
        units: stockUnitsLoose,
        // ✅ REMOVIDO: total (não faz sentido somar pacotes + unidades)
        formatted: `${stockPackages} pacotes + ${stockUnitsLoose} unidades soltas`
      };

      // ✅ CAPACIDADES DIRETAS: Tem estoque = pode vender
      const canSellUnits = stockUnitsLoose > 0;
      const canSellPackages = stockPackages > 0;

      // ✅ PREÇOS DIRETOS
      const unitPrice = product.price || 0;
      const packagePrice = product.package_price || 0;
      const unitsPerPackage = 1; // Sem conversões automáticas

      // ✅ STATUS ULTRA-SIMPLES: Tem qualquer tipo de estoque = in_stock
      const stockStatus = (stockPackages > 0 || stockUnitsLoose > 0) ? 'in_stock' : 'out_of_stock';

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
    staleTime: 0, // ✅ Sempre buscar dados frescos quando invalidado (fix: cache antigo bloqueava vendas)
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      // Não fazer retry para produtos deletados/não encontrados
      if (failureCount < 3 && error.code !== 'PGRST116' && !error.message?.includes('not found')) {
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
  return useQuery({
    queryKey: ['products-ssot', productIds],
    queryFn: async (): Promise<ProductSSoT[]> => {
      if (productIds.length === 0) return [];

      // Buscar produtos diretamente da tabela products
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (error) throw error;
      if (!products) return [];

      // Processar cada produto
      const results: ProductSSoT[] = products.map(product => {
        // Calcular informações de estoque usando função centralizada
        const stockDisplay = calculatePackageDisplay(
          product.stock_quantity || 0,
          product.package_units || 0
        );

        // Calcular capacidades de venda
        const canSellUnits = (product.stock_quantity || 0) > 0;
        const canSellPackages = stockDisplay.packages > 0;

        // Preços (com fallbacks seguros)
        const unitPrice = product.price || 0;
        const packagePrice = product.package_price || (unitPrice * (product.package_units || 1));
        const unitsPerPackage = product.package_units || 1;

        // Status de estoque
        const stockStatus = getStockStatus(product.stock_quantity || 0, product.minimum_stock);

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
  return useQuery({
    queryKey: ['all-products-ssot'],
    queryFn: async (): Promise<ProductSSoT[]> => {
      // Buscar todos os produtos ativos
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      if (!products) return [];

      // Processar cada produto
      const results: ProductSSoT[] = products.map(product => {
        // Calcular informações de estoque usando função centralizada
        const stockDisplay = calculatePackageDisplay(
          product.stock_quantity || 0,
          product.package_units || 0
        );

        // Calcular capacidades de venda
        const canSellUnits = (product.stock_quantity || 0) > 0;
        const canSellPackages = stockDisplay.packages > 0;

        // Preços (com fallbacks seguros)
        const unitPrice = product.price || 0;
        const packagePrice = product.package_price || (unitPrice * (product.package_units || 1));
        const unitsPerPackage = product.package_units || 1;

        // Status de estoque
        const stockStatus = getStockStatus(product.stock_quantity || 0, product.minimum_stock);

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
  return useQuery({
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

      // ✅ ULTRA-SIMPLIFICAÇÃO: Buscar apenas campos diretos (multistore)
      const { data: product, error } = await supabase
        .from('products')
        .select('store1_stock_packages, store1_stock_units_loose')
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (!product) {
        return {
          available: false,
          maxUnits: 0,
          maxPackages: 0,
          needsConversion: false,
        };
      }

      // ✅ ESPELHO DA PRATELEIRA: O que tem na prateleira (Loja 1)
      const stockPackages = product.store1_stock_packages || 0;
      const stockUnitsLoose = product.store1_stock_units_loose || 0;

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
    staleTime: 0, // ✅ Sempre buscar dados frescos quando invalidado (fix: cache antigo limitava quantidade no carrinho)
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