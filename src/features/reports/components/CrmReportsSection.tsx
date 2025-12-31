/**
 * CRM Reports Section - Sprint 2
 * Customer analysis with LTV, segmentation, and churn prediction
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Users, TrendingUp, AlertCircle, Heart, DollarSign, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { StandardReportsTable, TableColumn } from './StandardReportsTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DateRange } from 'react-day-picker';
import { useCrmReports } from '@/features/reports/hooks/useCrmReports';

interface CrmReportsSectionProps {
  dateRange?: DateRange;
}

export const CrmReportsSection: React.FC<CrmReportsSectionProps> = ({ dateRange }) => {

  const { summary, retention, topCustomers, segments, birthdays } = useCrmReports(dateRange);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const summaryData = summary.data;
    if (!summaryData || typeof summaryData === 'string') return { total: 0, new: 0, active: 0 };

    // Total: From RPC
    const total = summaryData.total_customers || 0;

    // New: From RPC
    const newCust = summaryData.new_customers || 0;

    // Active: From RPC (Primary source of truth for period)
    const active = summaryData.active_customers || 0;

    return { total, new: newCust, active };
  }, [summary.data]);

  // Churn Analysis
  const churnAnalysis = useMemo(() => {
    const segmentsData = segments.data;
    if (!segmentsData) return { alto: 0, medio: 0, baixo: 0, muito_baixo: 0 };
    const analysis = { alto: 0, medio: 0, baixo: 0, muito_baixo: 0 };
    segmentsData.forEach((s: any) => {
      if (s.segment === 'Em Risco' || s.segment === 'Inativo') analysis.alto += s.count;
      else if (s.segment === 'Regular' && s.retention_rate < 25) analysis.medio += Math.floor(s.count * 0.3);
      else if (s.segment === 'Regular' && s.retention_rate < 50) analysis.baixo += Math.floor(s.count * 0.4);
      else analysis.muito_baixo += s.count;
    });
    return analysis;
  }, [segments.data]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const loadingSummary = summary.isLoading;
  const loadingRetention = retention.isLoading;
  const retentionData = retention.data;
  const loadingTopCustomers = topCustomers.isLoading;
  const topCustomersData = topCustomers.data;
  const segmentsData = segments.data;
  const customersBirthday = birthdays.data;

  // Columns
  const customerColumns: TableColumn[] = [
    { key: 'customer_name', label: 'Cliente', width: 'w-[200px]', render: (v) => <span className="text-white font-medium">{v as string}</span> },
    { key: 'total_spent', label: 'Gasto no Período', width: 'w-[150px]', render: (v) => <span className="text-emerald-400 font-medium">{formatCurrency(v as number)}</span> },
    { key: 'total_orders', label: 'Pedidos', width: 'w-[100px]', render: (v) => <span className="text-blue-400">{v as number}</span> },
    { key: 'avg_order_value', label: 'Ticket Médio', width: 'w-[150px]', render: (v) => <span className="text-yellow-400">{formatCurrency(v as number)}</span> },
  ];

  const segmentColumns: TableColumn[] = [
    { key: 'segment', label: 'Segmento', width: 'w-[200px]', render: (v) => <span className="text-white font-medium">{v as string}</span> },
    { key: 'count', label: 'Clientes', width: 'w-[120px]', render: (v) => <span className="text-blue-400 font-medium">{v as number}</span> },
    { key: 'avg_ltv', label: 'LTV Médio', width: 'w-[180px]', render: (v) => <span className="text-emerald-400">{formatCurrency(v as number)}</span> },
    { key: 'retention_rate', label: 'Retenção', width: 'w-[160px]', render: (v) => <span className={(v as number) > 50 ? 'text-emerald-400' : 'text-red-400'}>{(v as number).toFixed(1)}%</span> },
  ];

  const cardClass = "bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg transition-all duration-300 hover:border-white/20";

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Clientes</p>
              <div className="text-2xl font-bold text-white">
                {loadingSummary ? <LoadingSpinner size="sm" /> : metrics.total}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Novos Clientes</p>
              <div className="text-2xl font-bold text-white">
                {loadingSummary ? <LoadingSpinner size="sm" /> : metrics.new}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Heart className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Clientes Ativos</p>
              <div className="text-2xl font-bold text-white">
                {loadingRetention ? <LoadingSpinner size="sm" /> : metrics.active}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Segmentação de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segments.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="segment" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white text-lg">Tendência de Retenção</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(retention.data as any[]) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="retained" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lost" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Top Clientes (Período)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] p-0">
            <StandardReportsTable
              data={(topCustomers.data as any[]) || []}
              columns={customerColumns}
              title=""
              searchFields={['customer_name']}
              initialSortField="total_spent"
              initialSortDirection="desc"
              height="h-full"
              maxRows={10}
            />
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              Análise de Risco (Churn)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
                <div className="text-2xl font-bold text-red-400">{churnAnalysis.alto}</div>
                <div className="text-sm text-red-300">Alto Risco</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                <div className="text-2xl font-bold text-yellow-400">{churnAnalysis.medio}</div>
                <div className="text-sm text-yellow-300">Médio Risco</div>
              </div>
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
                <div className="text-2xl font-bold text-orange-400">{churnAnalysis.baixo}</div>
                <div className="text-sm text-orange-300">Baixo Risco</div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-emerald-400">{churnAnalysis.muito_baixo}</div>
                <div className="text-sm text-emerald-300">Seguro</div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Aniversariantes
              </h4>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Hoje: <span className="text-white font-bold">{birthdays.data?.filter((c: any) => {
                  if (!c.birthday) return false;
                  const d = new Date(c.birthday);
                  const today = new Date();
                  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
                }).length || 0}</span></span>
                <span>Este Mês: <span className="text-white font-bold">{birthdays.data?.filter((c: any) => {
                  if (!c.birthday) return false;
                  const d = new Date(c.birthday);
                  const today = new Date();
                  return d.getMonth() === today.getMonth();
                }).length || 0}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};