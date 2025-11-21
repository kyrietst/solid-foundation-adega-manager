import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Calendar, TrendingUp, BarChart3, ExternalLink } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getMonthStartDate, getNowSaoPaulo, getCurrentMonthLabel } from '@/features/dashboard/utils/dateHelpers';

// ✅ MTD Strategy: Dashboard sempre mostra mês atual (dia 01 até hoje)
// Para análise com períodos customizados, use a página de Reports

interface SalesChartData {
  period: string;
  period_label: string;
  revenue: number;
  orders: number;
}

interface SalesChartSectionProps {
  className?: string;
  contentHeight?: number;
  cardHeight?: number; // altura fixa do card (para alinhar com outros cards)
}

const chartTypes = [
  { value: 'line', label: 'Linha', icon: TrendingUp },
  { value: 'bar', label: 'Barras', icon: BarChart3 }
];

export function SalesChartSection({ className, contentHeight = 360, cardHeight }: SalesChartSectionProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const { data: salesData, isLoading, error} = useQuery({
    queryKey: ['sales-trends', 'mtd'],
    queryFn: async (): Promise<SalesChartData[]> => {
      // ✅ MTD Strategy: Sempre do dia 01 do mês atual até hoje (timezone São Paulo)
      const startDate = getMonthStartDate();
      const endDate = getNowSaoPaulo();

      console.log(`📈 Sales Trends Chart - Calculando dados MTD (Month-to-Date)`);
      console.log(`📅 Período MTD: ${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`);

      // ✅ FIX: Buscar TODAS as vendas do período (incluir delivery_type e delivery_status)
      const { data: allSalesData, error } = await supabase
        .from('sales')
        .select('final_amount, created_at, status, delivery_type, delivery_status, delivery')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar dados de vendas para gráfico:', error);
        throw error;
      }

      // ✅ FIX: Aplicar lógica híbrida de status (mesma de useDashboardData)
      const validSales = (allSalesData || []).filter(sale => {
        // Excluir vendas canceladas ou devolvidas
        if (sale.status === 'cancelled' || sale.status === 'returned') {
          return false;
        }

        // Lógica Híbrida:
        // - Presencial: status = 'completed' (venda paga)
        const isPresencialCompleted =
          (sale.status === 'completed') &&
          (sale.delivery_type === 'presencial' || sale.delivery === false);

        // - Delivery: delivery_status = 'delivered' (entrega concluída)
        const isDeliveryDelivered =
          (sale.delivery_type === 'delivery') &&
          (sale.delivery_status === 'delivered');

        return isPresencialCompleted || isDeliveryDelivered;
      });

      console.log(`✅ SalesChartSection - Vendas válidas (lógica híbrida): ${validSales.length} de ${allSalesData?.length || 0} vendas totais`);

      // Agrupar vendas por dia
      const dailyData = new Map<string, { revenue: number; orders: number }>();

      // ✅ FIX TIMEZONE: Helper para converter data para YYYY-MM-DD em timezone SP
      const toSaoPauloDateKey = (date: Date): string => {
        return date.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      };

      // ✅ MTD: Inicializar todos os dias do mês atual até hoje (timezone SP)
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = toSaoPauloDateKey(date);  // ✅ Agora usa timezone SP
        dailyData.set(dateKey, { revenue: 0, orders: 0 });
      }

      console.log(`📅 Gráfico - Dias inicializados (SP): ${Array.from(dailyData.keys()).join(', ')}`);

      // Processar vendas válidas (agora com filtro híbrido aplicado)
      validSales.forEach(sale => {
        const saleDate = new Date(sale.created_at);
        const dateKey = toSaoPauloDateKey(saleDate);  // ✅ Agora usa timezone SP
        const revenue = Number(sale.final_amount) || 0;

        if (dailyData.has(dateKey)) {
          const existing = dailyData.get(dateKey)!;
          existing.revenue += revenue;
          existing.orders += 1;
        } else {
          // ⚠️ Venda fora do período MTD (edge case)
          console.warn(`⚠️ Venda ${sale.id} (${dateKey}) fora do período MTD - ignorada`);
        }
      });

      // Converter para formato do gráfico
      const chartData: SalesChartData[] = Array.from(dailyData.entries()).map(([dateKey, data]) => {
        // ✅ FIX TIMEZONE: Criar data com timezone explícito para evitar deslocamento
        const [year, month, day] = dateKey.split('-').map(Number);
        const displayDate = new Date(year, month - 1, day);  // Mês é 0-indexed

        return {
          period: dateKey,
          period_label: displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          revenue: Math.round(data.revenue * 100) / 100,
          orders: data.orders
        };
      });

      console.log(`📈 Gráfico calculado - ${chartData.length} dias, Total receita: R$ ${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}`);

      return chartData;
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

  const formatDate = (dateStr: string) => {
    try {
      // ✅ FIX TIMEZONE: Parsear YYYY-MM-DD sem deslocamento
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);  // Mês é 0-indexed
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/95 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-2xl">
          <p className="text-sm mb-2 text-gray-300 font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-white font-semibold">
                {entry.dataKey === 'revenue' ? 'Receita: ' : 'Vendas: '}
                {entry.dataKey === 'revenue' 
                  ? formatCurrency(entry.value) 
                  : `${entry.value} vendas`
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className="border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Erro ao carregar dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados de vendas.</p>
        </CardContent>
      </Card>
    );
  }

  const computedContentHeight = cardHeight ? Math.max(180, cardHeight - 80) : contentHeight;

  return (
    <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)} style={cardHeight ? { height: cardHeight } : undefined}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg tracking-tight flex items-center gap-2 text-amber-400 font-bold">
            <TrendingUp className="h-5 w-5" />
            Tendência de Vendas ({getCurrentMonthLabel()})
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Link para Reports para análise detalhada */}
            <a
              href="/reports?tab=sales&period=30"
              className="text-gray-300 hover:text-amber-400 transition-colors"
              title="Ver análise completa em Reports"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            {/* Chart type selector */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {chartTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={chartType === type.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setChartType(type.value)}
                  className={cn(
                    "text-xs h-7",
                    chartType === type.value 
                      ? "bg-amber-500 text-white hover:bg-amber-600 font-semibold" 
                      : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
                  )}
                >
                  <type.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-gray-200 pb-0">
        {isLoading ? (
          <div style={{ height: computedContentHeight }} className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div style={{ height: computedContentHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis 
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke="#d1d5db"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#d1d5db"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    dot={{ fill: '#fbbf24', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis 
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke="#d1d5db"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#d1d5db"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="#fbbf24"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {salesData && salesData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="font-medium">
                {salesData.length} dias • Total: {formatCurrency(
                  salesData.reduce((sum, item) => sum + item.revenue, 0)
                )}
              </span>
              <span className="font-medium">
                {salesData.reduce((sum, item) => sum + item.orders, 0)} vendas
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}