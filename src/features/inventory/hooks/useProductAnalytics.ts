/**
 * Hook para buscar dados analíticos reais de produtos
 * Substitui as simulações por dados verdadeiros do banco
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/core/api/supabase/client';

export interface ProductAnalytics {
  lastEntry: Date | null;
  lastExit: Date | null;
  salesLast30Days: number;
  turnoverRate: 'alto' | 'medio' | 'baixo';
  salesPerMonth: number;
}

export const useProductAnalytics = (productId: string | null) => {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        console.log('📈 BUSCANDO ANALYTICS para produto:', productId);
        // Usar função RPC otimizada para buscar resumo de movimentações
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('get_product_movement_summary', { p_product_id: productId });

        if (summaryError) {
          console.warn('⚠️ Erro ao buscar resumo via RPC:', summaryError.message);
          console.log('🔄 Continuando com query manual...');
        }

        // Buscar movimentações detalhadas para datas
        console.log('📊 Buscando movimentações do produto...');
        const { data: movementData, error: movementError } = await supabase
          .from('inventory_movements')
          .select('id, date, type, quantity')
          .eq('product_id', productId)
          .order('date', { ascending: false });

        if (movementError) {
          console.error('❌ Erro ao buscar movimentações:', movementError.message);
          throw movementError;
        }

        console.log('✅ Movimentações encontradas:', movementData?.length || 0);

        // Processar dados manualmente
        const movements = movementData || [];
        
        // Encontrar última entrada
        const lastEntry = movements
          .filter(m => ['entrada', 'in'].includes(m.type))
          .map(m => new Date(m.date))[0] || null;

        // Encontrar última saída
        const lastExit = movements
          .filter(m => ['saida', 'out', 'sale'].includes(m.type))
          .map(m => new Date(m.date))[0] || null;

        // Usar dados do resumo RPC se disponível
        let totalSaidas = 0;
        if (summaryData && summaryData.length > 0) {
          // Encontrar o resumo do produto específico
          const productSummary = summaryData.find(summary => 
            summary.product_name === (summaryData[0].product_name || 'N/A')
          );
          if (productSummary) {
            totalSaidas = productSummary.total_saidas || 0;
          }
        }

        // Calcular vendas dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const salesLast30Days = movements
          .filter(m => 
            ['saida', 'out', 'sale'].includes(m.type) && 
            new Date(m.date) >= thirtyDaysAgo
          )
          .reduce((sum, m) => sum + m.quantity, 0);

        // Calcular vendas dos últimos 90 dias para análise de giro
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        const salesLast90Days = movements
          .filter(m => 
            ['saida', 'out', 'sale'].includes(m.type) && 
            new Date(m.date) >= ninetyDaysAgo
          )
          .reduce((sum, m) => sum + m.quantity, 0);

        // Usar total de saídas como base se for maior que cálculo dos 90 dias
        const effectiveSales = Math.max(salesLast90Days, totalSaidas);
        
        // Calcular taxa de giro baseada nas vendas
        const salesPerMonth = effectiveSales / 3; // Média mensal dos últimos 3 meses
        
        let turnoverRate: 'alto' | 'medio' | 'baixo';
        if (salesPerMonth >= 30) {
          turnoverRate = 'alto';
        } else if (salesPerMonth >= 10) {
          turnoverRate = 'medio';
        } else {
          turnoverRate = 'baixo';
        }

        const finalAnalytics = {
          lastEntry,
          lastExit,
          salesLast30Days,
          turnoverRate,
          salesPerMonth: Math.round(salesPerMonth)
        };

        console.log('✅ ANALYTICS PROCESSADOS:', {
          productId,
          ...finalAnalytics,
          effectiveSales,
          totalSaidas
        });

        setAnalytics(finalAnalytics);

      } catch (err) {
        console.error('❌ ERRO ao buscar analytics do produto:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        // Em caso de erro, limpar os analytics
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [productId]);

  return { analytics, isLoading, error };
};