import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { TrendingUp, Package, RefreshCw, ArrowRight } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getCurrentMonthLabel } from '@/features/dashboard/utils/dateHelpers';
import { TopProduct } from '@/features/dashboard/hooks/useDashboardMetrics';

interface TopProductsCardProps {
  className?: string;
  limit?: number;
  cardHeight?: number;
  data: TopProduct[];
  isLoading?: boolean;
  error?: any;
}

export const TopProductsCard = React.memo(function TopProductsCard({ className, limit = 5, cardHeight, data: topProducts, isLoading, error }: TopProductsCardProps) {
  const navigate = useNavigate();

  // Hooks removidos - Componente agora é "Puro"
  // const { data: topProducts, isLoading, error, refetch } = useTopProducts(limit);

  // ✅ Context7 Pattern: Memoizar funções de formatação
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const formatQuantity = useCallback((qty: number) => {
    if (qty >= 1000) {
      return (qty / 1000).toFixed(1) + 'K';
    }
    return qty.toString();
  }, []);

  // ✅ Context7 Pattern: Memoizar cálculos pesados (reduce)
  const totalStats = useMemo(() => {
    if (!topProducts || topProducts.length === 0) {
      return { totalRevenue: 0, totalQuantity: 0 };
    }

    return {
      totalRevenue: topProducts.reduce((sum, p) => sum + p.revenue, 0),
      totalQuantity: topProducts.reduce((sum, p) => sum + p.qty, 0)
    };
  }, [topProducts]);

  const handleViewAll = () => {
    navigate('/reports?tab=sales');
  };

  const handleRefresh = () => {
    // refetch();
    // TODO: Prop onRefresh
    window.location.reload();
  };

  if (error) {
    return (
      <div className={cn(
        "flex flex-col h-full bg-black/60 backdrop-blur-sm border border-red-500/40 rounded-xl shadow-lg p-4",
        className
      )}>
        <p className="text-red-400 text-sm">Erro ao carregar top produtos</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg transition-all duration-300",
        className
      )}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-amber-400 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top {limit} Produtos ({getCurrentMonthLabel()})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 w-7 p-0 text-gray-400 hover:text-white"
            title="Atualizar"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4 flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 animate-pulse">
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded mb-2" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
                <div className="w-16 h-6 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : topProducts && topProducts.length > 0 ? (
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <div
                key={product.product_id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    index === 0 ? "bg-amber-500 text-black" :
                      index === 1 ? "bg-gray-400 text-black" :
                        index === 2 ? "bg-amber-600 text-white" :
                          "bg-white/20 text-gray-300"
                  )}>
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-white truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {product.category} • {formatQuantity(product.qty)} vendidos
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-emerald-400">
                    {formatCurrency(product.revenue)}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    receita
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Package className="h-8 w-8 text-gray-600 mb-2" />
            <p className="text-sm text-gray-400">Nenhuma venda no período</p>
            <p className="text-xs text-gray-500">Dados de {getCurrentMonthLabel()}</p>
          </div>
        )}

        {/* Botão Ver Todos - navega para Relatórios de Vendas */}
        {topProducts && topProducts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="w-full mt-2 text-gray-400 hover:text-white hover:bg-white/10"
          >
            Ver Todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </div>
  );
});