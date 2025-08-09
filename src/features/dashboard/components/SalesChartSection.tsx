import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface SalesChartData {
  period: string;
  period_label: string;
  revenue: number;
  orders: number;
}

interface SalesChartSectionProps {
  className?: string;
}

const periodOptions = [
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' }
];

const chartTypes = [
  { value: 'line', label: 'Linha', icon: TrendingUp },
  { value: 'bar', label: 'Barras', icon: BarChart3 }
];

export function SalesChartSection({ className }: SalesChartSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['sales-trends', selectedPeriod],
    queryFn: async (): Promise<SalesChartData[]> => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedPeriod);

      const { data, error } = await supabase
        .rpc('get_sales_trends', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          period_type: 'day'
        });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        period: item.period_start,
        period_label: item.period_label || item.period_start,
        revenue: Number(item.revenue || 0),
        orders: Number(item.orders || 0)
      }));
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
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
          <p className="text-sm text-gray-300 mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-white">
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
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Erro ao carregar dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Não foi possível carregar os dados de vendas.</p>
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
            Tendência de Vendas
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Period selector */}
            <div className="flex bg-white/5 rounded-lg p-1">
              {periodOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPeriod === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(option.value)}
                  className={cn(
                    "text-xs h-7",
                    selectedPeriod === option.value 
                      ? "bg-amber-600 text-white hover:bg-amber-700" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>

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
                      ? "bg-amber-600 text-white hover:bg-amber-700" 
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <type.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              ) : (
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="period"
                    tickFormatter={formatDate}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {salesData && salesData.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>
              {salesData.length} dias • Total: {formatCurrency(
                salesData.reduce((sum, item) => sum + item.revenue, 0)
              )}
            </span>
            <span>
              {salesData.reduce((sum, item) => sum + item.orders, 0)} vendas
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}