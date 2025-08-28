import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardExpenses } from '../hooks/useDashboardExpenses';
import { Calculator, TrendingUp, BarChart3 } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface FinancialChartData {
  period: string;
  period_label: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  netMargin: number;
}

interface FinancialChartSectionProps {
  className?: string;
  contentHeight?: number;
  cardHeight?: number;
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

export function FinancialChartSection({ className, contentHeight = 360, cardHeight }: FinancialChartSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  const { data: expensesData } = useDashboardExpenses(selectedPeriod);

  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['financial-trends', selectedPeriod, expensesData?.total_expenses],
    queryFn: async (): Promise<FinancialChartData[]> => {
      console.log(`💰 Financial Trends Chart - Calculando dados reais para ${selectedPeriod} dias`);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - selectedPeriod);

      // Buscar vendas do período
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('final_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null)
        .order('created_at', { ascending: true });

      if (salesError) {
        console.error('❌ Erro ao buscar vendas para gráfico financeiro:', salesError);
        throw salesError;
      }

      // Buscar despesas do período
      const { data: expensesDataRaw, error: expensesError } = await supabase
        .from('operational_expenses')
        .select('amount, expense_date')
        .gte('expense_date', startDate.toISOString().split('T')[0])
        .lte('expense_date', endDate.toISOString().split('T')[0])
        .order('expense_date', { ascending: true });

      if (expensesError) {
        console.error('❌ Erro ao buscar despesas para gráfico financeiro:', expensesError);
      }

      // Agrupar dados por dia
      const dailyData = new Map<string, { revenue: number; expenses: number }>();

      // Inicializar todos os dias do período
      for (let i = 0; i < selectedPeriod; i++) {
        const date = new Date();
        date.setDate(endDate.getDate() - (selectedPeriod - 1 - i));
        const dateKey = date.toISOString().split('T')[0];
        dailyData.set(dateKey, { revenue: 0, expenses: 0 });
      }

      // Processar vendas
      (salesData || []).forEach(sale => {
        const saleDate = new Date(sale.created_at);
        const dateKey = saleDate.toISOString().split('T')[0];
        const revenue = Number(sale.final_amount) || 0;

        if (dailyData.has(dateKey)) {
          const existing = dailyData.get(dateKey)!;
          existing.revenue += revenue;
        }
      });

      // Processar despesas
      (expensesDataRaw || []).forEach(expense => {
        const expenseDate = new Date(expense.expense_date);
        const dateKey = expenseDate.toISOString().split('T')[0];
        const amount = Number(expense.amount) || 0;

        if (dailyData.has(dateKey)) {
          const existing = dailyData.get(dateKey)!;
          existing.expenses += amount;
        }
      });

      // Converter para formato do gráfico
      const chartData: FinancialChartData[] = Array.from(dailyData.entries()).map(([dateKey, data]) => {
        const netProfit = data.revenue - data.expenses;
        const netMargin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;
        
        return {
          period: dateKey,
          period_label: new Date(dateKey).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          revenue: Math.round(data.revenue * 100) / 100,
          expenses: Math.round(data.expenses * 100) / 100,
          netProfit: Math.round(netProfit * 100) / 100,
          netMargin: Math.round(netMargin * 100) / 100
        };
      });

      console.log(`💰 Gráfico financeiro calculado - ${chartData.length} dias`);
      console.log(`📊 Total receita: R$ ${chartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}`);
      console.log(`💸 Total despesas: R$ ${chartData.reduce((sum, d) => sum + d.expenses, 0).toFixed(2)}`);

      return chartData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !!expensesData, // Aguarda dados de despesas
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

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/95 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-2xl">
          <p className="text-sm mb-2 text-gray-300 font-medium">{formatDate(label)}</p>
          {payload.map((entry: { dataKey: string; value: number; color: string }, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-white font-semibold">
                {entry.dataKey === 'revenue' && 'Receita: '}
                {entry.dataKey === 'expenses' && 'Despesas: '}
                {entry.dataKey === 'netProfit' && 'Lucro Líquido: '}
                {entry.dataKey === 'netMargin' && 'Margem: '}
                {entry.dataKey === 'netMargin' 
                  ? `${entry.value}%`
                  : formatCurrency(entry.value)
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
            <Calculator className="h-5 w-5" />
            Erro ao carregar dados financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados financeiros.</p>
        </CardContent>
      </Card>
    );
  }

  const computedContentHeight = cardHeight ? Math.max(180, cardHeight - 80) : contentHeight;

  return (
    <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)} style={cardHeight ? { height: cardHeight } : undefined}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg tracking-tight flex items-center gap-2 text-emerald-400 font-bold">
            <Calculator className="h-5 w-5" />
            Análise Financeira
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
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 font-semibold" 
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
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 font-semibold" 
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
            <div className="w-8 h-8 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div style={{ height: computedContentHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <ComposedChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                  />
                </ComposedChart>
              ) : (
                <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Legenda e resumo */}
        {financialData && financialData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            {/* Legenda */}
            <div className="flex items-center gap-4 mb-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-300 font-medium">Receita</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-300 font-medium">Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-gray-300 font-medium">Lucro Líquido</span>
              </div>
            </div>
            
            {/* Resumo do período */}
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span className="font-medium">
                {financialData.length} dias • Lucro Total: {formatCurrency(
                  financialData.reduce((sum, item) => sum + item.netProfit, 0)
                )}
              </span>
              <span className="font-medium">
                Margem Média: {(financialData.reduce((sum, item) => sum + item.netMargin, 0) / financialData.length).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}