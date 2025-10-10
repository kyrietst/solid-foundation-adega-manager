/**
 * Financial Reports Section - Sprint 2
 * Financial analysis with aging, DSO, and payment methods
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { DollarSign, Clock, CreditCard, AlertTriangle, Download, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { StandardReportsTable, TableColumn } from './StandardReportsTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { usePermissions } from '@/shared/hooks/auth/usePermissions';
import { SensitiveData } from '@/shared/ui/composite';
import { DREReport } from './DREReport';
import { chartTheme } from '@/shared/ui/composite/ChartTheme';

interface FinancialMetrics {
  current_amount: number;
  d0_30: number;
  d31_60: number;
  d61_90: number;
  d90_plus: number;
  dso: number;
}

interface FinancialReportsSectionProps {
  period?: number;
}

export const FinancialReportsSection: React.FC<FinancialReportsSectionProps> = ({ period = 90 }) => {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const windowDays = period;
  const { canViewFinancialData } = usePermissions();

  // Lê filtros da URL para navegação de alertas
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filterParam = searchParams.get('filter');
    
    if (filterParam && ['overdue-30', 'overdue', 'all'].includes(filterParam)) {
      setActiveFilter(filterParam);
    }
  }, [location.search]);

  // Dashboard financial metrics (restaurado) - agora com período dinâmico
  const { financials, isLoadingFinancials } = useDashboardData(windowDays);
  const { sensitiveMetrics } = useDashboardMetrics(undefined, financials);

  // Financial Metrics Query (restaurado)
  const { data: financialMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['financial-metrics', windowDays],
    queryFn: async (): Promise<FinancialMetrics> => {
      const { data, error } = await supabase
        .rpc('get_financial_metrics', { window_days: windowDays });

      if (error) throw error;
      return data?.[0] || {
        current_amount: 0,
        d0_30: 0,
        d31_60: 0,
        d61_90: 0,
        d90_plus: 0,
        dso: 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Accounts Receivable Query com filtros baseados na URL
  const { data: accountsReceivable, isLoading: loadingAR } = useQuery({
    queryKey: ['accounts-receivable', activeFilter],
    queryFn: async () => {
      let query = supabase
        .from('accounts_receivable')
        .select(`
          *,
          customers!inner(name)
        `)
        .eq('status', 'open')
        .order('due_date', { ascending: true });

      // Aplicar filtros baseados no activeFilter
      if (activeFilter === 'overdue' || activeFilter === 'overdue-30') {
        query = query.lt('due_date', new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      const processedData = (data || []).map((ar: any) => ({
        ...ar,
        customer_name: ar.customers?.name,
        payment_method: 'Não informado', // Como não há sale_id associado
        sale_date: ar.created_at, // Usar data de criação do AR
        days_overdue: Math.max(0, Math.floor(
          (new Date().getTime() - new Date(ar.due_date).getTime()) / (1000 * 60 * 60 * 24)
        ))
      }));

      // Filtro adicional para overdue-30 (mais de 30 dias)
      if (activeFilter === 'overdue-30') {
        return processedData.filter(item => item.days_overdue > 30);
      }

      return processedData;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Payment Methods Analysis (restaurado)
  const { data: paymentAnalysis, isLoading: loadingPayments } = useQuery({
    queryKey: ['payment-methods-analysis', windowDays],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);

      const { data, error } = await supabase
        .from('sales')
        .select('payment_method, final_amount, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'completed')
        .gt('final_amount', 0);

      if (error) throw error;

      const analysis = (data || []).reduce((acc: any, sale) => {
        const method = sale.payment_method || 'Não informado';
        if (!acc[method]) {
          acc[method] = {
            method,
            count: 0,
            total_amount: 0,
            avg_amount: 0
          };
        }
        acc[method].count += 1;
        acc[method].total_amount += Number(sale.final_amount || 0);
        return acc;
      }, {});

      return Object.values(analysis).map((item: any) => ({
        ...item,
        avg_amount: item.count > 0 ? item.total_amount / item.count : 0
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getOverdueStatus = (daysOverdue: number) => {
    if (daysOverdue === 0) return { label: 'Em dia', color: 'text-green-400' };
    if (daysOverdue <= 30) return { label: `${daysOverdue}d atraso`, color: 'text-yellow-400' };
    if (daysOverdue <= 60) return { label: `${daysOverdue}d atraso`, color: 'text-orange-400' };
    return { label: `${daysOverdue}d atraso`, color: 'text-red-400' };
  };

  // Prepare aging data for chart
  const agingData = [
    { period: 'Atual', amount: financialMetrics?.current_amount || 0, color: '#10b981' },
    { period: '0-30d', amount: financialMetrics?.d0_30 || 0, color: '#f59e0b' },
    { period: '31-60d', amount: financialMetrics?.d31_60 || 0, color: '#f97316' },
    { period: '61-90d', amount: financialMetrics?.d61_90 || 0, color: '#ef4444' },
    { period: '90+d', amount: financialMetrics?.d90_plus || 0, color: '#991b1b' }
  ];

  // Usar paleta padronizada para relatórios financeiros
  const COLORS = chartTheme.financial;

  const arColumns: TableColumn[] = [
    {
      key: 'customer_name',
      label: 'Cliente',
      width: 'w-[250px]',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Valor',
      width: 'w-[180px]',
      render: (value) => (
        <span className="text-green-400 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'due_date',
      label: 'Vencimento',
      width: 'w-[160px]',
      render: (value) => (
        <span className="text-white">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'days_overdue',
      label: 'Status',
      width: 'w-[150px]',
      render: (value) => {
        const status = getOverdueStatus(value);
        return (
          <span className={status.color}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: 'payment_method',
      label: 'Método',
      width: 'w-[160px]',
      render: (value) => (
        <span className="text-blue-400">{value}</span>
      ),
    },
  ];

  const paymentColumns: TableColumn[] = [
    {
      key: 'method',
      label: 'Método de Pagamento',
      width: 'w-[280px]',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'count',
      label: 'Quantidade',
      width: 'w-[150px]',
      render: (value) => (
        <span className="text-blue-400 font-medium">{value}</span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      width: 'w-[180px]',
      render: (value) => (
        <span className="text-green-400 font-medium">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'avg_amount',
      label: 'Ticket Médio',
      width: 'w-[180px]',
      render: (value) => (
        <span className="text-purple-400">
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  // Calculate totals and percentages
  const totalReceivable = (financialMetrics?.current_amount || 0) + 
                          (financialMetrics?.d0_30 || 0) + 
                          (financialMetrics?.d31_60 || 0) + 
                          (financialMetrics?.d61_90 || 0) + 
                          (financialMetrics?.d90_plus || 0);

  const overdueAmount = (financialMetrics?.d0_30 || 0) + 
                        (financialMetrics?.d31_60 || 0) + 
                        (financialMetrics?.d61_90 || 0) + 
                        (financialMetrics?.d90_plus || 0);

  const overduePercentage = totalReceivable > 0 ? (overdueAmount / totalReceivable) * 100 : 0;

  // Verificar permissões financeiras
  if (!canViewFinancialData) {
    return (
      <SensitiveData type="financial">
        <div></div>
      </SensitiveData>
    );
  }

  return (
    <div className="space-y-6">
      {/* Principal Financial KPIs (moved from dashboard) */}
      {sensitiveMetrics && sensitiveMetrics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Métricas Financeiras Principais</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sensitiveMetrics.map((metric, index) => {
              const Icon = metric.icon;
              
              // Cores baseadas no accent
              const accentColorMap = {
                amber: { icon: 'text-amber-300', border: 'border-amber-400/50' },
                blue: { icon: 'text-blue-300', border: 'border-blue-400/50' },
                green: { icon: 'text-emerald-300', border: 'border-emerald-400/50' },
                purple: { icon: 'text-purple-300', border: 'border-purple-400/50' },
                red: { icon: 'text-red-300', border: 'border-red-400/50' },
              };

              const variantColorMap = {
                default: { icon: 'text-amber-300', border: 'border-amber-400/50' },
                success: { icon: 'text-emerald-300', border: 'border-emerald-400/50' },
                warning: { icon: 'text-amber-300', border: 'border-amber-400/50' },
                error: { icon: 'text-red-300', border: 'border-red-400/50' },
              };

              const colors = metric.accent 
                ? accentColorMap[metric.accent] 
                : variantColorMap[metric.variant || 'default'];

              const iconColorClass = colors.icon;
              const borderColorClass = colors.border;

              return (
                <Card 
                  key={index}
                  className={`bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg ${borderColorClass} hover:border-white/40 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:bg-gray-700/40`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-8 w-8 ${iconColorClass}`} />
                      <div>
                        <p className="text-sm text-gray-400">{metric.title}</p>
                        <div className="text-2xl font-bold text-white">
                          {isLoadingFinancials ? <LoadingSpinner size="sm" variant="gold" /> : metric.value}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* DRE - Demonstrativo de Resultado */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Demonstrativo de Resultado (DRE)</h3>
        <DREReport />
      </div>

      {/* Receivables Analysis Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Análise de Recebíveis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 hover:bg-gray-700/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-400 transition-all duration-300" />
              <div>
                <p className="text-sm text-gray-400">Total a Receber</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(totalReceivable)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-400/30 hover:bg-gray-700/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400 transition-all duration-300" />
              <div>
                <p className="text-sm text-gray-400">Em Atraso</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(overdueAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-400/30 hover:bg-gray-700/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-orange-400 transition-all duration-300" />
              <div>
                <p className="text-sm text-gray-400">% Atraso</p>
                <p className="text-2xl font-bold text-orange-400">
                  {overduePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-400 transition-all duration-300" />
              <div>
                <p className="text-sm text-gray-400">DSO</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(financialMetrics?.dso || 0).toFixed(0)} dias
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Analysis Chart */}
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 hover:bg-gray-700/40">
          <CardHeader>
            <CardTitle className="text-white">Análise de Aging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{
                      color: '#E5E7EB',
                      fontWeight: '600'
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                  />
                  <Bar dataKey="amount">
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
          <CardHeader>
            <CardTitle className="text-white">Distribuição por Método</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentAnalysis || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total_amount"
                    label={({ method, percent }) => `${method} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(paymentAnalysis || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{
                      color: '#E5E7EB',
                      fontWeight: '600'
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="space-y-6">
        {/* Accounts Receivable */}
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-400/30 hover:bg-gray-700/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                Contas a Receber
                {activeFilter !== 'all' && (
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                    {activeFilter === 'overdue-30' ? 'Atraso +30 dias' : 
                     activeFilter === 'overdue' ? 'Em atraso' : 'Filtrado'}
                  </span>
                )}
              </CardTitle>
              {activeFilter !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                  className="text-xs h-7 border-gray-500/50 text-gray-300 hover:bg-gray-600/50"
                >
                  Limpar Filtro
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-80">
            {loadingAR ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" variant="red" />
              </div>
            ) : (
              <StandardReportsTable
                data={accountsReceivable || []}
                columns={arColumns}
                title="Contas a Receber"
                searchFields={['customer_name', 'payment_method']}
                initialSortField="days_overdue"
                initialSortDirection="desc"
                height="h-full"
                maxRows={25}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Analysis */}
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
          <CardHeader>
            <CardTitle className="text-white">Análise Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" variant="blue" />
              </div>
            ) : (
              <StandardReportsTable
                data={paymentAnalysis || []}
                columns={paymentColumns}
                title="Métodos de Pagamento"
                searchFields={['method']}
                initialSortField="total_amount"
                initialSortDirection="desc"
                height="h-full"
                maxRows={15}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary & Insights */}
      <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 hover:bg-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">Situação Atual</h4>
              <p className="text-sm text-gray-300">
                {formatCurrency(financialMetrics?.current_amount || 0)} em contas em dia
              </p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-semibold text-yellow-400 mb-2">Atenção Necessária</h4>
              <p className="text-sm text-gray-300">
                {formatCurrency((financialMetrics?.d0_30 || 0) + (financialMetrics?.d31_60 || 0))} em atraso recente
              </p>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <h4 className="font-semibold text-red-400 mb-2">Urgente</h4>
              <p className="text-sm text-gray-300">
                {formatCurrency((financialMetrics?.d61_90 || 0) + (financialMetrics?.d90_plus || 0))} em atraso crítico
              </p>
            </div>
          </div>

          <div className="text-sm text-gray-400 space-y-1 mt-6">
            <p><span className="font-semibold">DSO (Days Sales Outstanding):</span> Tempo médio para receber vendas</p>
            <p><span className="font-semibold">Aging:</span> Classificação por tempo de vencimento</p>
            <p><span className="font-semibold">Meta DSO:</span> Idealmente ≤ 30 dias para fluxo de caixa saudável</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};