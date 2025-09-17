import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { chartTheme } from '@/shared/ui/composite/ChartTheme';

interface CategoryMix {
  category: string;
  revenue: number;
}

interface CategoryMixDonutProps {
  className?: string;
  period?: number; // days
  showTotal?: boolean; // exibir bloco Total dentro do card (default: false)
}

// Usar paleta padronizada para análise de vendas
const COLORS = chartTheme.sales;

export const CategoryMixDonut = React.memo(function CategoryMixDonut({ className, period = 30, showTotal = false }: CategoryMixDonutProps) {
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ['category-mix', period],
    queryFn: async (): Promise<CategoryMix[]> => {
      try {
        // Buscar vendas por categoria dos últimos X dias
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            sale_items(
              quantity,
              unit_price,
              products(category)
            )
          `)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (salesError) throw salesError;

        // Calcular receita por categoria
        const categoryRevenue: { [key: string]: number } = {};
        
        salesData?.forEach(sale => {
          sale.sale_items?.forEach((item: any) => {
            const category = item.products?.category || 'Sem Categoria';
            const revenue = (item.quantity || 0) * (item.unit_price || 0);
            categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
          });
        });

        return Object.entries(categoryRevenue)
          .map(([category, revenue]) => ({ category, revenue }))
          .sort((a, b) => b.revenue - a.revenue);
      } catch (error) {
        console.error('Erro ao buscar mix de categorias:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Fallback: get category distribution from products if no sales data
  const { data: fallbackData } = useQuery({
    queryKey: ['products-by-category'],
    queryFn: async (): Promise<CategoryMix[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('category, price, stock_quantity')
        .gt('stock_quantity', 0);

      if (error) throw error;
      
      const categoryTotals = (data || []).reduce((acc: any, product: any) => {
        const category = product.category || 'Sem Categoria';
        const value = Number(product.price || 0) * Number(product.stock_quantity || 0);
        acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {});

      return Object.entries(categoryTotals).map(([category, revenue]) => ({
        category,
        revenue: revenue as number
      }));
    },
    enabled: !categoryData || categoryData.length === 0,
    staleTime: 10 * 60 * 1000,
  });

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const formatCompact = useCallback((value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  }, []);

  // ✅ Context7 Pattern: Memoizar dados processados para evitar recalculo
  const processedData = useMemo(() => {
    return categoryData && categoryData.length > 0 ? categoryData : fallbackData || [];
  }, [categoryData, fallbackData]);

  // ✅ Context7 Pattern: Memoizar cálculos pesados
  const totalRevenue = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.revenue, 0);
  }, [processedData]);

  const hasRealSalesData = useMemo(() => {
    return categoryData && categoryData.length > 0;
  }, [categoryData]);

  // ✅ Context7 Pattern: Memoizar componentes customizados do chart
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalRevenue > 0 ? (data.value / totalRevenue) * 100 : 0;

      return (
        <div className="bg-black/95 backdrop-blur-xl border border-white/30 rounded-xl p-3 shadow-2xl">
          <p className="text-sm text-white font-semibold">{data.payload.category}</p>
          <p className="text-xs text-amber-300 font-semibold">
            {formatCurrency(data.value)} ({percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  }, [totalRevenue, formatCurrency]);

  const renderCustomizedLabel = useCallback(({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Hide labels for slices smaller than 5%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }, []);

  if (error) {
    return (
      <Card className={cn("border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Erro - Mix Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-bold tracking-tight flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-amber-300" />
            Mix por Categoria
            {!hasRealSalesData && (
              <span className="text-xs text-gray-300 ml-2">(Estoque)</span>
            )}
          </CardTitle>
          <a 
            href="/reports?tab=inventory&period=30" 
            className="text-gray-300 hover:text-amber-300 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-gray-200">
        {isLoading ? (
          <div className="h-[460px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
          </div>
        ) : processedData && processedData.length > 0 ? (
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={110}
                    innerRadius={55}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {processedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {processedData.map((entry, index) => (
                <div key={entry.category} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate font-medium">{entry.category}</div>
                    <div className="text-sm text-gray-400 font-medium">
                      {formatCompact(entry.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total - opcional (vamos mover para o card de Alertas) */}
            {showTotal && (
              <div className="pt-3 border-t border-white/10 text-center">
                <div className="text-sm text-gray-400">Total</div>
                <div className="text-lg font-semibold text-amber-400">
                  {formatCurrency(totalRevenue)}
                </div>
                {!hasRealSalesData && (
                  <div className="text-xs text-gray-500 mt-1">
                    Baseado no valor do estoque
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-[460px] flex flex-col items-center justify-center text-center">
            <PieChartIcon className="h-12 w-12 text-gray-600 mb-3" />
            <div className="text-sm text-gray-400 mb-2">Nenhum dado disponível</div>
            <div className="text-xs text-gray-500">
              {hasRealSalesData 
                ? `Sem vendas nos últimos ${period} dias`
                : 'Sem produtos cadastrados'
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});