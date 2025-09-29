/**
 * useProductOperations.ts - Hook de operações centralizadas para produtos
 *
 * @description
 * Centraliza toda a lógica de negócio relacionada a produtos seguindo o padrão
 * do useInventoryCalculations. Expande as funcionalidades existentes com análises
 * mais avançadas de performance, categorização automática e insights de IA.
 *
 * @features
 * - Análise de performance de produtos (turnover, margem, popularidade)
 * - Categorização automática por performance
 * - Cálculos de preço otimizados para diferentes cenários
 * - Validações avançadas de dados de produto
 * - Insights de IA para recomendações
 * - Análise de estoque e reposição
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Business Logic Centralization
 */

import { useMemo } from 'react';
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface ProductData {
  id?: number;
  name: string;
  category: string;
  price: number;
  cost_price?: number;
  stock_quantity?: number;
  barcode?: string | null;
  package_barcode?: string | null;
  has_package_tracking?: boolean;
  units_per_package?: number;
  package_price?: number | null;
  volume_ml?: number | null;
  supplier?: string | null;
  created_at?: string;
  updated_at?: string;

  // Campos de performance calculados
  totalSold?: number;
  totalRevenue?: number;
  averageSalePrice?: number;
  lastSaleDate?: string | null;
  turnoverRate?: 'fast' | 'medium' | 'slow';
}

export interface ProductPerformance {
  salesVelocity: number; // Unidades por dia
  revenueVelocity: number; // R$ por dia
  marginPerformance: 'excellent' | 'good' | 'fair' | 'poor';
  stockHealth: 'overstock' | 'optimal' | 'low' | 'critical';
  popularityScore: number; // 0-100
  profitabilityScore: number; // 0-100
  overallPerformance: 'star' | 'good' | 'average' | 'underperform';
  daysInStock: number;
  predictedStockoutDays: number | null;
}

export interface ProductInsights {
  needsReorder: boolean;
  suggestedOrderQuantity: number;
  priceOptimizationOpportunity: boolean;
  suggestedPriceAdjustment: number | null;
  categoryPerformanceVsAverage: 'above' | 'average' | 'below';
  seasonalityFactor: number; // -1 to 1
  competitivePosition: 'premium' | 'competitive' | 'value';
  crossSellOpportunities: string[];
  riskFactors: string[];
  opportunities: string[];
}

export interface ProductValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useProductOperations = (productData: Partial<ProductData> = {}) => {

  // Usar o hook existente para cálculos básicos
  const inventoryCalculations = useInventoryCalculations(productData);

  // ============================================================================
  // ANÁLISE DE PERFORMANCE
  // ============================================================================

  const performance = useMemo((): ProductPerformance => {
    const {
      totalSold = 0,
      totalRevenue = 0,
      stock_quantity = 0,
      created_at,
      lastSaleDate,
      price = 0,
      cost_price = 0
    } = productData;

    // Calcular dias desde criação
    const daysInStock = created_at
      ? Math.floor((Date.now() - new Date(created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Sales Velocity (unidades por dia)
    const salesVelocity = daysInStock > 0 ? totalSold / daysInStock : 0;

    // Revenue Velocity (R$ por dia)
    const revenueVelocity = daysInStock > 0 ? totalRevenue / daysInStock : 0;

    // Margin Performance
    const margin = inventoryCalculations.unitMargin;
    let marginPerformance: 'excellent' | 'good' | 'fair' | 'poor';
    if (margin >= 40) marginPerformance = 'excellent';
    else if (margin >= 25) marginPerformance = 'good';
    else if (margin >= 15) marginPerformance = 'fair';
    else marginPerformance = 'poor';

    // Stock Health
    let stockHealth: 'overstock' | 'optimal' | 'low' | 'critical';
    const monthlyDemand = salesVelocity * 30;
    const stockRatio = monthlyDemand > 0 ? stock_quantity / monthlyDemand : 999;

    if (stockRatio > 3) stockHealth = 'overstock';
    else if (stockRatio > 1) stockHealth = 'optimal';
    else if (stockRatio > 0.5) stockHealth = 'low';
    else stockHealth = 'critical';

    // Popularity Score (0-100)
    const popularityScore = Math.min(100,
      (salesVelocity * 20) + // Velocidade de venda
      (totalSold > 0 ? 30 : 0) + // Já foi vendido
      (revenueVelocity > 10 ? 25 : revenueVelocity * 2.5) + // Revenue velocity
      (lastSaleDate && (Date.now() - new Date(lastSaleDate).getTime()) < 30 * 24 * 60 * 60 * 1000 ? 25 : 0) // Venda recente
    );

    // Profitability Score (0-100)
    const profitabilityScore = Math.min(100,
      margin + // Margem atual
      (revenueVelocity * 5) + // Velocidade de receita
      (totalRevenue > 1000 ? 30 : totalRevenue / 33.33) // Revenue total
    );

    // Overall Performance
    let overallPerformance: 'star' | 'good' | 'average' | 'underperform';
    const overallScore = (popularityScore + profitabilityScore) / 2;
    if (overallScore >= 75) overallPerformance = 'star';
    else if (overallScore >= 60) overallPerformance = 'good';
    else if (overallScore >= 40) overallPerformance = 'average';
    else overallPerformance = 'underperform';

    // Predicted Stockout Days
    const predictedStockoutDays = salesVelocity > 0 ? Math.floor(stock_quantity / salesVelocity) : null;

    return {
      salesVelocity: Math.round(salesVelocity * 100) / 100,
      revenueVelocity: Math.round(revenueVelocity * 100) / 100,
      marginPerformance,
      stockHealth,
      popularityScore: Math.round(popularityScore),
      profitabilityScore: Math.round(profitabilityScore),
      overallPerformance,
      daysInStock,
      predictedStockoutDays
    };
  }, [productData, inventoryCalculations]);

  // ============================================================================
  // INSIGHTS DE IA
  // ============================================================================

  const insights = useMemo((): ProductInsights => {
    const { stock_quantity = 0, category, price = 0, cost_price = 0 } = productData;

    // Needs Reorder
    const needsReorder = performance.stockHealth === 'critical' || performance.stockHealth === 'low';

    // Suggested Order Quantity
    const monthlyDemand = performance.salesVelocity * 30;
    const suggestedOrderQuantity = Math.max(
      Math.ceil(monthlyDemand * 2), // 2 meses de estoque
      10 // Mínimo de 10 unidades
    );

    // Price Optimization
    const currentMargin = inventoryCalculations.unitMargin;
    const priceOptimizationOpportunity = currentMargin < 25 || currentMargin > 60;
    const suggestedPriceAdjustment = priceOptimizationOpportunity
      ? (currentMargin < 25 ? price * 0.15 : currentMargin > 60 ? price * -0.1 : null)
      : null;

    // Category Performance (simulated - would need category averages)
    const categoryPerformanceVsAverage: 'above' | 'average' | 'below' =
      performance.overallPerformance === 'star' ? 'above' :
      performance.overallPerformance === 'underperform' ? 'below' : 'average';

    // Seasonality Factor (simulated - would need historical data)
    const seasonalityFactor = Math.random() * 0.4 - 0.2; // -0.2 to 0.2

    // Competitive Position
    let competitivePosition: 'premium' | 'competitive' | 'value';
    if (price > 100) competitivePosition = 'premium';
    else if (price > 30) competitivePosition = 'competitive';
    else competitivePosition = 'value';

    // Cross Sell Opportunities
    const crossSellOpportunities: string[] = [];
    if (category === 'Vinhos Tintos') {
      crossSellOpportunities.push('Vinhos Brancos', 'Queijos', 'Acessórios');
    } else if (category === 'Espumantes') {
      crossSellOpportunities.push('Taças', 'Aperitivos', 'Sobremesas');
    }

    // Risk Factors
    const riskFactors: string[] = [];
    if (performance.stockHealth === 'critical') riskFactors.push('Estoque crítico');
    if (performance.salesVelocity < 0.1) riskFactors.push('Baixa velocidade de venda');
    if (currentMargin < 15) riskFactors.push('Margem muito baixa');
    if (!productData.barcode) riskFactors.push('Sem código de barras');
    if (performance.daysInStock > 180 && performance.salesVelocity < 0.1) riskFactors.push('Produto parado há muito tempo');

    // Opportunities
    const opportunities: string[] = [];
    if (performance.popularityScore > 70) opportunities.push('Produto popular - considerar promoções');
    if (currentMargin > 45) opportunities.push('Margem alta - potencial para desconto estratégico');
    if (performance.stockHealth === 'overstock') opportunities.push('Excesso de estoque - criar promoção');
    if (!productData.package_price && price < 50) opportunities.push('Considerar venda em pacotes');

    return {
      needsReorder,
      suggestedOrderQuantity,
      priceOptimizationOpportunity,
      suggestedPriceAdjustment: suggestedPriceAdjustment ? Math.round(suggestedPriceAdjustment * 100) / 100 : null,
      categoryPerformanceVsAverage,
      seasonalityFactor: Math.round(seasonalityFactor * 100) / 100,
      competitivePosition,
      crossSellOpportunities,
      riskFactors,
      opportunities
    };
  }, [productData, performance, inventoryCalculations]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  const validateProductData = (data: Partial<ProductData>): ProductValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validações obrigatórias
    if (!data.name?.trim()) {
      errors.push('Nome do produto é obrigatório');
    } else if (data.name.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!data.category?.trim()) {
      errors.push('Categoria é obrigatória');
    }

    if (!data.price || data.price <= 0) {
      errors.push('Preço deve ser maior que zero');
    }

    // Validações de código de barras
    if (data.barcode && data.barcode.trim()) {
      if (!/^[0-9]{8,14}$/.test(data.barcode)) {
        errors.push('Código de barras deve ter entre 8 e 14 dígitos numéricos');
      }
    }

    // Warnings
    if (!data.cost_price || data.cost_price <= 0) {
      warnings.push('Preço de custo não informado - impossibilitará análise de margem');
    }

    if (!data.barcode?.trim()) {
      warnings.push('Código de barras não informado - dificultará operações de venda');
    }

    if (!data.supplier?.trim() || data.supplier === 'none') {
      warnings.push('Fornecedor não informado - dificultará reposição');
    }

    // Suggestions
    if (data.price && data.cost_price) {
      const margin = ((data.price - data.cost_price) / data.price) * 100;
      if (margin < 20) {
        suggestions.push('Margem baixa - considere ajustar o preço');
      } else if (margin > 60) {
        suggestions.push('Margem muito alta - considere ser mais competitivo');
      }
    }

    if (data.price && data.price < 20) {
      suggestions.push('Preço baixo - considere venda em pacotes para aumentar ticket médio');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  };

  const formatProductData = (data: Partial<ProductData>): Partial<ProductData> => {
    return {
      ...data,
      name: data.name?.trim() || '',
      category: data.category?.trim() || '',
      price: data.price || 0,
      cost_price: (data.cost_price && data.cost_price > 0) ? data.cost_price : undefined,
      barcode: data.barcode?.trim() || null,
      package_barcode: data.package_barcode?.trim() || null,
      supplier: (data.supplier && data.supplier !== 'none') ? data.supplier.trim() : null,
      volume_ml: (data.volume_ml && data.volume_ml > 0) ? data.volume_ml : null,
    };
  };

  const getPerformanceColor = (performance: string): string => {
    switch (performance) {
      case 'star': return 'text-accent-gold bg-accent-gold-100/20';
      case 'good': return 'text-green-400 bg-green-400/20';
      case 'average': return 'text-blue-400 bg-blue-400/20';
      case 'underperform': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStockHealthColor = (health: string): string => {
    switch (health) {
      case 'optimal': return 'text-green-400';
      case 'low': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'overstock': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const calculateOptimalPrice = (targetMargin: number): number => {
    const { cost_price = 0 } = productData;
    if (cost_price <= 0) return 0;
    return Math.round(cost_price * (1 + targetMargin / 100) * 100) / 100;
  };

  const getReorderRecommendation = (): { urgency: 'immediate' | 'soon' | 'normal' | 'none'; message: string } => {
    if (performance.stockHealth === 'critical') {
      return { urgency: 'immediate', message: 'URGENTE: Reabastecer imediatamente - estoque crítico' };
    }

    if (performance.stockHealth === 'low') {
      return { urgency: 'soon', message: 'ATENÇÃO: Reabastecer em breve - estoque baixo' };
    }

    if (performance.predictedStockoutDays && performance.predictedStockoutDays < 7) {
      return { urgency: 'soon', message: `Reabastecer em ${performance.predictedStockoutDays} dias` };
    }

    if (performance.stockHealth === 'overstock') {
      return { urgency: 'none', message: 'Estoque em excesso - não reabastecer no momento' };
    }

    return { urgency: 'normal', message: 'Estoque adequado' };
  };

  // ============================================================================
  // SSoT v3.0.0 - FUNÇÕES PARA MODAIS E FORMS
  // ============================================================================

  const getCategoriesFromActiveTable = async (): Promise<{ data: string[]; error: string | null }> => {
    try {
      // Importar supabase dinamicamente para evitar problemas de SSR
      const { supabase } = await import('@/core/api/supabase/client');

      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        return { data: [], error: 'Erro ao carregar categorias ativas' };
      }

      const categoryNames = categoriesData?.map(item => item.name) || [];
      return { data: categoryNames, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar categorias:', error);
      return { data: [], error: 'Erro inesperado ao carregar categorias' };
    }
  };

  const getSuppliersFromProducts = async (): Promise<{ data: string[]; error: string | null }> => {
    try {
      const { supabase } = await import('@/core/api/supabase/client');

      const { data: suppliersData, error } = await supabase
        .from('products')
        .select('supplier')
        .not('supplier', 'is', null)
        .neq('supplier', '');

      if (error) {
        console.error('Erro ao buscar fornecedores:', error);
        return { data: [], error: 'Erro ao carregar fornecedores' };
      }

      const uniqueSuppliers = [...new Set(suppliersData?.map(item => item.supplier) || [])].sort();
      return { data: uniqueSuppliers, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar fornecedores:', error);
      return { data: [], error: 'Erro inesperado ao carregar fornecedores' };
    }
  };

  const validateBarcodeUniqueness = async (barcode: string, excludeProductId?: number): Promise<{ isUnique: boolean; error: string | null }> => {
    try {
      if (!barcode || barcode === '') {
        return { isUnique: true, error: null };
      }

      const { supabase } = await import('@/core/api/supabase/client');

      let query = supabase
        .from('products')
        .select('id, name, barcode, package_barcode')
        .or(`barcode.eq.${barcode},package_barcode.eq.${barcode}`);

      if (excludeProductId) {
        query = query.neq('id', excludeProductId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao validar código de barras:', error);
        return { isUnique: false, error: 'Erro ao validar código de barras' };
      }

      if (data && data.length > 0) {
        const conflictProduct = data[0];
        const fieldType = conflictProduct.barcode === barcode ? 'principal' : 'pacote';
        return {
          isUnique: false,
          error: `Código já existe no produto "${conflictProduct.name}" (campo ${fieldType})`
        };
      }

      return { isUnique: true, error: null };
    } catch (error) {
      console.error('Erro inesperado ao validar código de barras:', error);
      return { isUnique: false, error: 'Erro inesperado na validação' };
    }
  };

  const getFormattedSupplierOptions = (suppliers: string[]) => {
    return [
      { value: 'none', label: 'Sem fornecedor' },
      ...suppliers.map(supplier => ({ value: supplier, label: supplier }))
    ];
  };

  const getFormattedCategoryOptions = (categories: string[]) => {
    return categories.map(category => ({ value: category, label: category }));
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Dados do hook base
    ...inventoryCalculations,

    // Análises avançadas
    performance,
    insights,

    // Funções utilitárias
    validateProductData,
    formatProductData,
    getPerformanceColor,
    getStockHealthColor,
    calculateOptimalPrice,
    getReorderRecommendation,

    // SSoT v3.0.0 - Funções para modais e forms
    getCategoriesFromActiveTable,
    getSuppliersFromProducts,
    validateBarcodeUniqueness,
    getFormattedSupplierOptions,
    getFormattedCategoryOptions,

    // Estados derivados
    isStarPerformer: performance.overallPerformance === 'star',
    needsAttention: performance.overallPerformance === 'underperform',
    needsRestock: insights.needsReorder,
    isOverstocked: performance.stockHealth === 'overstock',
    isProfitable: performance.profitabilityScore > 60,
    isPopular: performance.popularityScore > 70,
  };
};

export default useProductOperations;