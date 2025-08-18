/**
 * @fileoverview Hook para buscar métricas reais calculadas em tempo real de um cliente
 * Substitui dados mockados por cálculos baseados em vendas e interações reais
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface CustomerRealMetrics {
  // Dados básicos do cliente
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  segment: string | null;
  favorite_category: string | null;
  created_at: string;
  
  // Métricas LTV
  lifetime_value_stored: number;
  lifetime_value_calculated: number;
  ltv_difference: number;
  
  // Métricas de compras
  total_purchases: number;
  total_spent: number;
  avg_purchase_value: number;
  total_products_bought: number;
  avg_items_per_purchase: number;
  
  // Datas importantes
  first_purchase_stored: string | null;
  last_purchase_stored: string | null;
  first_purchase_real: string | null;
  last_purchase_real: string | null;
  days_since_last_purchase: number;
  
  // Insights reais
  insights_count: number;
  insights_confidence: number;
  latest_insights: Array<{
    id: string;
    insight_type: string;
    insight_value: string;
    confidence: number;
    created_at: string;
  }>;
  
  // Categoria e produtos favoritos calculados
  calculated_favorite_category: string | null;
  calculated_favorite_product: string | null;
  
  // Status de sincronização
  data_sync_status: {
    ltv_synced: boolean;
    dates_synced: boolean;
    preferences_synced: boolean;
  };
}

/**
 * Hook para buscar métricas reais de um cliente específico
 * Calcula todos os valores em tempo real baseado nas vendas e interações
 */
export const useCustomerRealMetrics = (customerId: string | null) => {
  return useQuery({
    queryKey: ['customer-real-metrics', customerId],
    queryFn: async (): Promise<CustomerRealMetrics> => {
      if (!customerId) throw new Error('Customer ID é obrigatório');

      // Query complexa que calcula todas as métricas em tempo real
      const { data, error } = await supabase.rpc('get_customer_real_metrics', {
        p_customer_id: customerId
      });

      if (error) {
        console.warn('RPC get_customer_real_metrics falhou:', error);
        
        // Fallback para query manual se a função RPC falhar
        return await calculateCustomerMetricsManual(customerId);
      }

      // A função RPC retorna JSON, então retornamos diretamente
      return data as CustomerRealMetrics;
    },
    enabled: !!customerId,
    staleTime: 30000, // 30 segundos - dados podem ser um pouco cached
    refetchInterval: 60000, // Refetch a cada 1 minuto para manter dados frescos
  });
};

/**
 * Função auxiliar para calcular métricas manualmente quando RPC não existe
 */
async function calculateCustomerMetricsManual(customerId: string): Promise<CustomerRealMetrics> {
  // 1. Buscar dados básicos do cliente
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();
    
  if (customerError) throw customerError;

  // 2. Calcular métricas de vendas
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      id,
      total_amount,
      created_at,
      sale_items (
        product_id,
        quantity,
        unit_price,
        products (
          name,
          category
        )
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
    
  if (salesError) throw salesError;

  // 3. Calcular métricas agregadas
  const totalPurchases = salesData.length;
  const totalSpent = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const avgPurchaseValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0;
  
  let totalProductsBought = 0;
  const categoryCount: Record<string, number> = {};
  const productCount: Record<string, number> = {};
  
  salesData.forEach(sale => {
    sale.sale_items.forEach(item => {
      totalProductsBought += item.quantity;
      
      // Contar categorias
      const category = item.products?.category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + item.quantity;
      }
      
      // Contar produtos
      const productName = item.products?.name;
      if (productName) {
        productCount[productName] = (productCount[productName] || 0) + item.quantity;
      }
    });
  });
  
  const avgItemsPerPurchase = totalPurchases > 0 ? totalProductsBought / totalPurchases : 0;
  
  // Categoria e produto favoritos calculados
  const calculatedFavoriteCategory = Object.keys(categoryCount).length > 0 
    ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
    : null;
    
  const calculatedFavoriteProduct = Object.keys(productCount).length > 0
    ? Object.keys(productCount).reduce((a, b) => productCount[a] > productCount[b] ? a : b)
    : null;

  // Datas reais
  const firstPurchaseReal = salesData.length > 0 ? salesData[salesData.length - 1].created_at : null;
  const lastPurchaseReal = salesData.length > 0 ? salesData[0].created_at : null;
  
  // Dias desde última compra
  const daysSinceLastPurchase = lastPurchaseReal 
    ? Math.floor((new Date().getTime() - new Date(lastPurchaseReal).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // 4. Buscar insights reais
  const { data: insights, error: insightsError } = await supabase
    .from('customer_insights')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (insightsError) throw insightsError;

  const insightsCount = insights.length;
  const insightsConfidence = insights.length > 0 
    ? insights.reduce((sum, insight) => sum + parseFloat(insight.confidence), 0) / insights.length
    : 0;

  // 5. Status de sincronização
  const ltv_difference = totalSpent - parseFloat(customer.lifetime_value || '0');
  const ltv_synced = Math.abs(ltv_difference) < 1; // Considera sincronizado se diferença < R$ 1
  
  const dates_synced = customer.last_purchase_date && lastPurchaseReal
    ? new Date(customer.last_purchase_date).getTime() === new Date(lastPurchaseReal).getTime()
    : !customer.last_purchase_date && !lastPurchaseReal;
    
  const preferences_synced = customer.favorite_category === calculatedFavoriteCategory;

  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    segment: customer.segment,
    favorite_category: customer.favorite_category,
    created_at: customer.created_at,
    
    lifetime_value_stored: parseFloat(customer.lifetime_value || '0'),
    lifetime_value_calculated: totalSpent,
    ltv_difference,
    
    total_purchases: totalPurchases,
    total_spent: totalSpent,
    avg_purchase_value: avgPurchaseValue,
    total_products_bought: totalProductsBought,
    avg_items_per_purchase: avgItemsPerPurchase,
    
    first_purchase_stored: customer.first_purchase_date,
    last_purchase_stored: customer.last_purchase_date,
    first_purchase_real: firstPurchaseReal,
    last_purchase_real: lastPurchaseReal,
    days_since_last_purchase: daysSinceLastPurchase,
    
    insights_count: insightsCount,
    insights_confidence: insightsConfidence,
    latest_insights: insights.map(insight => ({
      id: insight.id,
      insight_type: insight.insight_type,
      insight_value: insight.insight_value,
      confidence: parseFloat(insight.confidence),
      created_at: insight.created_at
    })),
    
    calculated_favorite_category: calculatedFavoriteCategory,
    calculated_favorite_product: calculatedFavoriteProduct,
    
    data_sync_status: {
      ltv_synced,
      dates_synced,
      preferences_synced
    }
  };
}

export default useCustomerRealMetrics;