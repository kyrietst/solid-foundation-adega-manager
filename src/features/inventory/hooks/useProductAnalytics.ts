/**
 * Hook para buscar dados analíticos reais de produtos
 * Substitui as simulações por dados verdadeiros do banco
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { Product } from '@/core/types/inventory.types';

export interface ProductAnalytics {
  lastEntry: Date | null;
  lastExit: Date | null;
  salesLast30Days: number;
  turnoverRate: string; // 'alto' | 'medio' | 'baixo' -> converted to string for flexibility
  salesPerMonth: number;
  avgSales: number; // Alias for salesPerMonth
  daysOfStock: number;
  stockStatus: {
    status: string;
    label: string;
    color: string;
  };
  lastMovement: {
    type: string;
    quantity: number;
    date: string;
  } | null;
}

export interface ProductCompleteness {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  missing: string[];
}

const calculateCompleteness = (product: Product | null): ProductCompleteness | null => {
  if (!product) return null;

  const fields = [
    { key: 'cost_price', weight: 3 },
    { key: 'supplier', weight: 3 },
    { key: 'volume_ml', weight: 3 },
    { key: 'minimum_stock', weight: 2 },
    { key: 'barcode', weight: 2 },
    { key: 'image_url', weight: 1 }
  ];

  const analysis = fields.map(field => {
    const value = (product as any)[field.key];
    let isComplete = false;
    if (field.key === 'cost_price') isComplete = Number(value) > 0;
    else if (typeof value === 'string') isComplete = value.trim() !== '';
    else if (typeof value === 'number') isComplete = value > 0;
    else isComplete = value !== null && value !== undefined;
    return { ...field, isComplete };
  });

  const totalWeight = analysis.reduce((sum, f) => sum + f.weight, 0);
  const completedWeight = analysis.filter(f => f.isComplete).reduce((sum, f) => sum + f.weight, 0);
  const score = Math.round((completedWeight / totalWeight) * 100);

  // Identify missing fields names map
  const fieldNames: Record<string, string> = {
    'cost_price': 'Preço de Custo',
    'supplier': 'Fornecedor',
    'volume_ml': 'Volume',
    'minimum_stock': 'Estoque Mínimo',
    'barcode': 'Código de Barras',
    'image_url': 'Imagem'
  };

  const missing = analysis.filter(f => !f.isComplete).map(f => fieldNames[f.key]);

  return {
    score,
    status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor',
    missing
  };
};

const getStockStatus = (currentStock: number, minStock: number = 10) => {
  if (currentStock === 0) return {
    status: 'out',
    label: '🔴 Sem Estoque',
    color: 'bg-red-500/20 text-red-400 border-red-400/30'
  };
  if (currentStock <= minStock) return {
    status: 'low',
    label: '⚠️ Estoque Baixo',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
  };
  return {
    status: 'available',
    label: '✅ Disponível',
    color: 'bg-green-500/20 text-green-400 border-green-400/30'
  };
};

export const useProductAnalytics = (productId: string | null, product?: Product | null) => {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [completeness, setCompleteness] = useState<ProductCompleteness | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate completeness whenever product changes
  useEffect(() => {
    if (product) {
      setCompleteness(calculateCompleteness(product));
    } else {
      setCompleteness(null);
    }
  }, [product]);

  useEffect(() => {
    if (!productId) {
      setAnalytics(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch current stock for stock status (if not provided in product, fetch it)
        interface ProductStockData {
          stock_quantity: number;
          minimum_stock: number;
        }

        interface MovementData {
          id: string;
          date: string;
          type_enum: string;
          quantity_change: number;
        }

        let currentStock = product?.stock_quantity || 0;
        let minStock = product?.minimum_stock || 10;

        if (!product) {
          // Explicit casting to bypass Supabase generic inference issues - NUCLEAR OPTION
          const { data: rawData, error: prodError } = await (supabase
            .from('products') as any)
            .select('stock_quantity, minimum_stock')
            .eq('id', productId)
            .single();

          if (!prodError && rawData) {
            const data = rawData as unknown as ProductStockData;
            currentStock = data.stock_quantity;
            minStock = data.minimum_stock;
          }
        }

        // Usar função RPC otimizada para buscar resumo de movimentações
        const { error: summaryError } = await supabase
          .rpc('get_product_movement_summary', { p_product_id: productId });

        if (summaryError) {
          console.warn('⚠️ Erro ao buscar resumo via RPC:', summaryError.message);
        }

        // Buscar movimentações detalhadas para datas e lastMovement
        const { data: movementData, error: movementError } = await (supabase
          .from('inventory_movements') as any)
          .select('id, date, type_enum, quantity_change')
          .eq('product_id', productId)
          .order('date', { ascending: false })
          .limit(50); // Limit to avoid fetching too much history

        if (movementError) {
          console.error('❌ Erro ao buscar movimentações:', movementError.message);
          throw movementError;
        }

        const movements = (movementData as unknown as MovementData[]) || [];

        // Last Movement
        let lastMovement = null;
        if (movements.length > 0) {
          const last = movements[0];
          lastMovement = {
            type: ['saida', 'out', 'sale'].includes(last.type_enum) ? 'SAIDA' : 'ENTRADA',
            quantity: Math.abs(last.quantity_change),
            date: new Date(last.date).toLocaleDateString('pt-BR')
          };
        }

        // Encontrar última entrada
        const lastEntry = movements
          .filter(m => ['entrada', 'in'].includes(m.type_enum))
          .map(m => new Date(m.date))[0] || null;

        // Encontrar última saída
        const lastExit = movements
          .filter(m => ['saida', 'out', 'sale'].includes(m.type_enum))
          .map(m => new Date(m.date))[0] || null;

        // Calcular vendas dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesLast30Days = movements
          .filter(m =>
            ['saida', 'out', 'sale'].includes(m.type_enum) &&
            new Date(m.date) >= thirtyDaysAgo
          )
          .reduce((sum, m) => sum + Math.abs(m.quantity_change), 0);

        // Estimar média mensal (simplificado)
        const salesPerMonth = salesLast30Days;

        // Calcular Giro (Ratio de Vendas/Estoque)
        const ratio = currentStock > 0 ? (salesLast30Days / currentStock) : 0;

        let turnoverRate = 'baixo';
        if (ratio >= 1.0) turnoverRate = 'alto';
        else if (ratio >= 0.5) turnoverRate = 'medio';

        // Days of Stock
        const daysOfStock = salesPerMonth > 0 ? Math.round(currentStock / (salesPerMonth / 30)) : 999;

        const stockStatus = getStockStatus(currentStock, minStock);

        const finalAnalytics: ProductAnalytics = {
          lastEntry,
          lastExit,
          salesLast30Days,
          turnoverRate,
          salesPerMonth,
          avgSales: salesPerMonth,
          daysOfStock,
          stockStatus,
          lastMovement
        };

        setAnalytics(finalAnalytics);

      } catch (err) {
        console.error('❌ ERRO ao buscar analytics do produto:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [productId, product]);

  return { analytics, loading: isLoading, error, completeness };
};