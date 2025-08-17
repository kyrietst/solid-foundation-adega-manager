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
  cardHeight?: number; // altura fixa do card (para alinhar com outros cards)
}

export function TopProductsCard({ className, period = 30, limit = 5, useCurrentMonth = true, cardHeight }: TopProductsCardProps) {
  const { data: topProducts, isLoading, error } = useQuery({
    queryKey: ['top-products', period, limit, useCurrentMonth],
    queryFn: async (): Promise<TopProduct[]> => {
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('🏆 Top Products - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Produtos top simulados com dados realistas
      const mockTopProducts: TopProduct[] = [
        {
          product_id: '1',
          name: 'Vinho Tinto Reserva Especial 2019',
          category: 'Vinhos Tintos',
          qty: 35,
          revenue: 4287.50
        },
        {
          product_id: '2',
          name: 'Champagne Brut Premium Importado',
          category: 'Espumantes',
          qty: 18,
          revenue: 3420.00
        },
        {
          product_id: '3',
          name: 'Whisky Single Malt 18 Anos',
          category: 'Destilados',
          qty: 12,
          revenue: 3150.80
        },
        {
          product_id: '4',
          name: 'Vinho Branco Sauvignon Blanc',
          category: 'Vinhos Brancos',
          qty: 28,
          revenue: 2890.40
        },
        {
          product_id: '5',
          name: 'Gin Artesanal Premium 750ml',
          category: 'Destilados',
          qty: 22,
          revenue: 2640.75
        }
      ];
      
      return mockTopProducts.slice(0, limit);
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
      <Card className={cn("border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <Package className="h-5 w-5" />
            Erro - Top Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn("bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg hero-spotlight", className)}
      style={cardHeight ? { height: cardHeight } : undefined}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-amber-400 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-400" />
            Top {limit} Produtos {useCurrentMonth ? '(Mês Atual)' : `(${period}d)`}
          </CardTitle>
          <a 
            href="/reports?tab=sales&period=30" 
            className="text-gray-300 hover:text-amber-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent 
        className="space-y-2 text-sm text-gray-200 pb-6" 
        style={cardHeight ? { maxHeight: cardHeight - 80, overflowY: 'auto' } : undefined}
      >
        {isLoading ? (
          <div className="space-y-3 h-[380px]">
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
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <div className="text-sm text-gray-400 mb-2">Nenhuma venda no período</div>
            <div className="text-xs text-gray-500">
              {useCurrentMonth ? 'Dados do mês atual' : `Dados dos últimos ${period} dias`}
            </div>
          </div>
        )}

        {topProducts && topProducts.length > 0 && (
          <div className="pt-4 mt-3 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-semibold text-white">
                  Total: {formatCurrency(topProducts.reduce((sum, p) => sum + p.revenue, 0))}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Receita combinada
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-amber-400">
                  {topProducts.reduce((sum, p) => sum + p.qty, 0)} itens
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  vendidos
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}