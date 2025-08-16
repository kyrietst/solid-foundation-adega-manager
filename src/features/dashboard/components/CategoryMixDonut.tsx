import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface CategoryMix {
  category: string;
  revenue: number;
}

interface CategoryMixDonutProps {
  className?: string;
  period?: number; // days
  showTotal?: boolean; // exibir bloco Total dentro do card (default: false)
}

const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple  
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f43f5e', // rose
];

export function CategoryMixDonut({ className, period = 30, showTotal = false }: CategoryMixDonutProps) {
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ['category-mix', period],
    queryFn: async (): Promise<CategoryMix[]> => {
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('🥧 Category Mix - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Mix de categorias simulado com percentuais realistas
      const mockCategoryData: CategoryMix[] = [
        { category: 'Vinhos', revenue: 8750.30 },
        { category: 'Destilados', revenue: 6420.80 },
        { category: 'Cervejas', revenue: 4680.50 },
        { category: 'Espumantes', revenue: 3920.40 },
        { category: 'Licor', revenue: 2890.70 },
        { category: 'Refrigerante', revenue: 1650.90 }
      ];
      
      return mockCategoryData;
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCompact = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toFixed(0);
  };

  const data = categoryData && categoryData.length > 0 ? categoryData : fallbackData || [];
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const hasRealSalesData = categoryData && categoryData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
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
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
  };

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
            href="/reports?tab=categories" 
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
        ) : data && data.length > 0 ? (
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={110}
                    innerRadius={55}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {data.map((entry, index) => (
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
              {data.map((entry, index) => (
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
}