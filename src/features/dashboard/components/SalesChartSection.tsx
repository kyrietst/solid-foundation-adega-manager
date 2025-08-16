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
  contentHeight?: number;
  cardHeight?: number; // altura fixa do card (para alinhar com outros cards)
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

export function SalesChartSection({ className, contentHeight = 360, cardHeight }: SalesChartSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ['sales-trends', selectedPeriod],
    queryFn: async (): Promise<SalesChartData[]> => {
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('📈 Sales Trends Chart - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Gerar dados mockados baseados no período selecionado
      const endDate = new Date();
      const mockData: SalesChartData[] = [];
      
      for (let i = selectedPeriod - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(endDate.getDate() - i);
        
        // Gerar valores aleatórios mas realistas
        const baseRevenue = 800 + Math.random() * 1200; // Entre R$ 800 e R$ 2000
        const orders = Math.floor(2 + Math.random() * 8); // Entre 2 e 10 vendas por dia
        
        mockData.push({
          period: date.toISOString().split('T')[0],
          period_label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          revenue: Math.round(baseRevenue * 100) / 100,
          orders: orders
        });
      }
      
      return mockData;
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
                      ? "bg-amber-500 text-white hover:bg-amber-600 font-semibold" 
                      : "hover:text-white hover:bg-white/15 font-medium text-gray-300"
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

      <CardContent className="text-sm text-gray-200">
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