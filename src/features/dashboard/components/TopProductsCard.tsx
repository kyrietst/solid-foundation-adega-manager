import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { TrendingUp, Package, ExternalLink } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface TopProduct {
  product_id: string;
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

interface TopProductsCardProps {
  className?: string;
  period?: number; // days
  limit?: number;
  useCurrentMonth?: boolean; // Use current month instead of last N days
}

export function TopProductsCard({ className, period = 30, limit = 5, useCurrentMonth = true }: TopProductsCardProps) {
  const { data: topProducts, isLoading, error } = useQuery({
    queryKey: ['top-products', period, limit, useCurrentMonth],
    queryFn: async (): Promise<TopProduct[]> => {
      let startDate: Date;
      let endDate: Date;

      if (useCurrentMonth) {
        // Current month from start to now
        startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
      } else {
        // Last N days
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - period);
      }

      const { data, error } = await supabase
        .rpc('get_top_products', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit_count: limit,
          by: 'revenue'
        });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatQuantity = (qty: number) => {
    if (qty >= 1000) {
      return (qty / 1000).toFixed(1) + 'K';
    }
    return qty.toString();
  };

  if (error) {
    return (
      <Card className={cn("border-white/10 bg-black/40 backdrop-blur-xl", className)}>
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Erro - Top Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/10 bg-black/40 backdrop-blur-xl", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            Top {limit} Produtos {useCurrentMonth ? '(Mês Atual)' : `(${period}d)`}
          </CardTitle>
          <a 
            href="/reports?tab=sales&view=top-products" 
            className="text-gray-400 hover:text-amber-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
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
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 ? "bg-amber-500 text-black" :
                    index === 1 ? "bg-gray-400 text-black" :
                    index === 2 ? "bg-amber-600 text-white" :
                    "bg-white/20 text-gray-300"
                  )}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {product.category} • {formatQuantity(product.qty)} vendidos
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-amber-400">
                    {formatCurrency(product.revenue)}
                  </div>
                  <div className="text-xs text-gray-400">
                    receita
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <div className="text-sm text-gray-400 mb-2">Nenhuma venda no período</div>
            <div className="text-xs text-gray-500">
              {useCurrentMonth ? 'Dados do mês atual' : `Dados dos últimos ${period} dias`}
            </div>
          </div>
        )}

        {topProducts && topProducts.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Total: {formatCurrency(topProducts.reduce((sum, p) => sum + p.revenue, 0))}</span>
              <span>{topProducts.reduce((sum, p) => sum + p.qty, 0)} itens vendidos</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}