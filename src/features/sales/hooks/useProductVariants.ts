/**
 * Hook para buscar e gerenciar variantes de produtos
 * Integra com o novo sistema de product_variants
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { 
  ProductWithVariants, 
  ProductVariant, 
  UseProductVariantsOptions,
  VariantAvailabilityCheck,
  UseVariantAvailabilityOptions
} from '@/core/types/variants.types';

// Hook para buscar variantes de um produto específico
export function useProductVariants(productId: string, options?: UseProductVariantsOptions) {
  
  return useQuery({
    queryKey: ['product-variants', productId, options, 'v2'], // Versão v2 para forçar invalidação
    queryFn: async (): Promise<ProductWithVariants> => {
      // Buscar produto base
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;


      // Buscar variantes do produto
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('variant_type');

      if (variantsError) throw variantsError;

      // Calcular total de unidades disponíveis
      const { data: totalUnits } = await supabase
        .rpc('get_product_total_units', { p_product_id: productId });

      // Processar variantes
      let unitVariant = variants?.find(v => v.variant_type === 'unit');
      let packageVariant = variants?.find(v => v.variant_type === 'package');


      // Se não há variantes configuradas, criar variantes virtuais baseadas nos dados legados
      const needsVirtualVariants = !unitVariant && !packageVariant;
      
      if (needsVirtualVariants) {
        // Criar variante de unidade padrão baseada nos dados do produto
        unitVariant = {
          id: `${product.id}-unit-virtual`,
          product_id: product.id,
          variant_type: 'unit' as const,
          stock_quantity: product.stock_quantity || 0,
          minimum_stock: product.minimum_stock || 0,
          price: product.price,
          cost_price: product.cost_price || null,
          barcode: product.barcode || null,
          margin_percent: product.margin_percent || null,
          is_active: true,
          created_at: product.created_at,
          updated_at: product.updated_at,
          units_in_package: null // NULL para unidades
        };

        // Se produto tem configuração de pacote (dados legados), criar variante de pacote
        // Condição mais flexível: só precisa ter package_units OU package_price configurado
        const hasPackageData = product.has_package_tracking || 
                               (product.package_units && product.package_units > 1) || 
                               product.package_price;
        
        
        if (hasPackageData) {
          // Valores padrão mais robustos
          const packageUnits = product.package_units || product.units_per_package || 6; // Padrão 6 unidades por pacote
          const packagePrice = product.package_price || (product.price * packageUnits * 0.9); // 10% desconto no pacote
          
          packageVariant = {
            id: `${product.id}-package-virtual`,
            product_id: product.id,
            variant_type: 'package' as const,
            stock_quantity: Math.floor((product.stock_quantity || 0) / packageUnits),
            minimum_stock: product.minimum_stock ? Math.floor(product.minimum_stock / packageUnits) : 0,
            price: packagePrice,
            cost_price: product.cost_price ? (product.cost_price * packageUnits) : null,
            barcode: product.package_barcode || null,
            margin_percent: product.package_margin || null,
            is_active: true,
            created_at: product.created_at,
            updated_at: product.updated_at,
            units_in_package: packageUnits
          };
          
        }
      }

      const result: ProductWithVariants = {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        image_url: product.image_url,
        supplier: product.supplier,
        producer: product.producer,
        country: product.country,
        region: product.region,
        vintage: product.vintage,
        alcohol_content: product.alcohol_content,
        volume_ml: product.volume_ml,
        created_at: product.created_at,
        updated_at: product.updated_at,
        
        variants: variants?.length ? variants : [unitVariant, packageVariant].filter(Boolean),
        unit_variant: unitVariant,
        package_variant: packageVariant,
        total_stock_units: totalUnits || product.stock_quantity || 0,
        has_both_variants: !!(unitVariant && packageVariant),
        
        // Para vendas (requer estoque > 0)
        can_sell_units: !!(unitVariant && unitVariant.stock_quantity > 0),
        can_sell_packages: !!(packageVariant && packageVariant.stock_quantity > 0),
        
        // Para ajustes de estoque (só requer variante configurada)
        can_adjust_units: !!unitVariant,
        can_adjust_packages: !!packageVariant,
      };


      return result;
    },
    enabled: !!productId,
    staleTime: 0, // Sempre buscar dados atualizados para garantir que variantes virtuais funcionem
    refetchOnWindowFocus: true, // Refetch quando voltar ao foco
  });
}

// Hook para verificar disponibilidade de uma variante
export function useVariantAvailability(options: UseVariantAvailabilityOptions) {
  return useQuery({
    queryKey: ['variant-availability', options],
    queryFn: async (): Promise<VariantAvailabilityCheck> => {
      const { data, error } = await supabase
        .rpc('check_variant_availability', {
          p_product_id: options.product_id,
          p_variant_type: options.variant_type,
          p_quantity: options.quantity
        });

      if (error) throw error;
      return data;
    },
    enabled: !!(options.product_id && options.variant_type && options.quantity > 0),
    staleTime: 5000, // 5 segundos (dados em tempo real)
  });
}

// Hook para buscar múltiplos produtos com variantes (para grids)
export function useProductsWithVariants(productIds: string[]) {
  return useQuery({
    queryKey: ['products-with-variants', productIds],
    queryFn: async (): Promise<ProductWithVariants[]> => {
      if (productIds.length === 0) return [];

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) throw productsError;

      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)
        .eq('is_active', true)
        .order('product_id, variant_type');

      if (variantsError) throw variantsError;

      // Agrupar variantes por produto
      const variantsByProduct = variants?.reduce((acc, variant) => {
        if (!acc[variant.product_id]) acc[variant.product_id] = [];
        acc[variant.product_id].push(variant);
        return acc;
      }, {} as Record<string, ProductVariant[]>) || {};

      // Calcular totais para cada produto
      const results: ProductWithVariants[] = [];
      
      for (const product of products || []) {
        const productVariants = variantsByProduct[product.id] || [];
        const unitVariant = productVariants.find(v => v.variant_type === 'unit');
        const packageVariant = productVariants.find(v => v.variant_type === 'package');
        
        // Calcular total de unidades
        const totalUnits = (unitVariant?.stock_quantity || 0) + 
          ((packageVariant?.stock_quantity || 0) * (packageVariant?.units_in_package || 0));

        results.push({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          image_url: product.image_url,
          supplier: product.supplier,
          producer: product.producer,
          country: product.country,
          region: product.region,
          vintage: product.vintage,
          alcohol_content: product.alcohol_content,
          volume_ml: product.volume_ml,
          created_at: product.created_at,
          updated_at: product.updated_at,
          
          variants: productVariants,
          unit_variant: unitVariant,
          package_variant: packageVariant,
          total_stock_units: totalUnits,
          has_both_variants: !!(unitVariant && packageVariant),
          can_sell_units: !!(unitVariant && unitVariant.stock_quantity > 0),
          can_sell_packages: !!(packageVariant && packageVariant.stock_quantity > 0),
        });
      }

      return results;
    },
    enabled: productIds.length > 0,
    staleTime: 60000, // 1 minuto
  });
}

// Hook para buscar logs de conversão de um produto
export function useConversionLogs(productId: string) {
  return useQuery({
    queryKey: ['conversion-logs', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_conversion_log')
        .select(`
          *,
          products(name, category)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    staleTime: 30000,
  });
}