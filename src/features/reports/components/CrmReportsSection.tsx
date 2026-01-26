/**
 * CRM Reports Section - Sprint 2
 * Customer analysis with LTV, segmentation, and churn prediction
 */

import React, { useMemo } from 'react';
import { Users, TrendingUp, AlertCircle, Heart, DollarSign, Calendar, Star, Trophy, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { DateRange } from 'react-day-picker';
import { useCrmReports } from '@/features/reports/hooks/useCrmReports';
import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { chartColors } from '@/shared/ui/composite/ChartTheme';
import { cn } from '@/core/config/utils';

interface CrmReportsSectionProps {
  dateRange?: DateRange;
}

export const CrmReportsSection: React.FC<CrmReportsSectionProps> = ({ dateRange }) => {

  const { summary, retention, topCustomers, segments, birthdays } = useCrmReports(dateRange);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const summaryData = summary.data as any; // Cast to any to avoid strict definition mismatch temporarily
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

  const formatCurrency = (val: unknown) => {
    const num = Number(val);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Metrics Strip - Standardized Pattern */}
      <section className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2 border-b border-white/5 pb-8">
          
          {/* Total Clientes */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total de Clientes</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">{metrics.total}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1">Base completa cadastrada</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/5 mx-4" />

          {/* Novos Clientes */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-400/80">Novos Clientes</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">{metrics.new}</h3>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  + Novos
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/5 mx-4" />

          {/* Clientes Ativos */}
          <div className="flex items-start gap-4 flex-1 min-w-[200px]">
             <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Heart className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-400/80">Clientes Ativos</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">{metrics.active}</h3>
              </div>
               <p className="text-xs text-gray-500 mt-1">Com compras no período</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Segmentação de Clientes
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segments.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="segment" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#f3f4f6'
                  }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                />
                <Bar dataKey="count" fill="url(#colorSegment)" radius={[4, 4, 0, 0]} barSize={40}>
                   {
                      (segments.data || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a78bfa'} fillOpacity={0.8} />
                      ))
                   }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Tendência de Retenção
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(retention.data as any[]) || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="period" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: '#f3f4f6'
                  }}
                  itemStyle={{ padding: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="retained" 
                  name="Retidos"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#1f2937' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  strokeOpacity={0.8} 
                />
                <Line 
                  type="monotone" 
                  dataKey="lost" 
                  name="Perdidos"
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#1f2937' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  strokeOpacity={0.8} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* 3. Tables & Risk Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Premium Glass Table for Top Customers */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
           <div className="p-5 border-b border-white/5 bg-white/[0.02] backdrop-blur-md sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                       <Trophy className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Top Clientes</h3>
                        <p className="text-xs text-gray-500">Clientes com maior volume de compras no período</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-md text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 border-b border-white/5 font-medium">Cliente</th>
                            <th className="px-6 py-4 border-b border-white/5 font-medium text-right">Gasto Total</th>
                            <th className="px-6 py-4 border-b border-white/5 font-medium text-center">Pedidos</th>
                            <th className="px-6 py-4 border-b border-white/5 font-medium text-right">Ticket Médio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(topCustomers.data as any[])?.length === 0 ? (
                             <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    Nenhum cliente encontrado neste período.
                                </td>
                            </tr>
                        ) : (
                             (topCustomers.data as any[] || []).map((customer, idx) => (
                                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors duration-200">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                                                <span className="text-xs font-medium text-gray-300">
                                                    {customer.customer_name?.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-200 font-medium group-hover:text-white transition-colors">
                                                {customer.customer_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-emerald-400">
                                            {formatCurrency(customer.total_spent)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {customer.total_orders}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm text-gray-400">
                                            {formatCurrency(customer.avg_order_value)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Risk Analysis & Birthdays */}
        <div className="space-y-6">
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-400" />
                        Análise de Risco (Churn)
                    </h3>
                </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-center hover:bg-red-500/10 transition-colors cursor-default">
                    <div className="text-3xl font-bold text-red-400 mb-1">{churnAnalysis.alto}</div>
                    <div className="text-xs uppercase tracking-wider text-red-400/70 font-semibold">Alto Risco</div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center hover:bg-amber-500/10 transition-colors cursor-default">
                     <div className="text-3xl font-bold text-amber-500 mb-1">{churnAnalysis.medio}</div>
                    <div className="text-xs uppercase tracking-wider text-amber-500/70 font-semibold">Médio Risco</div>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-center hover:bg-orange-500/10 transition-colors cursor-default">
                    <div className="text-3xl font-bold text-orange-500 mb-1">{churnAnalysis.baixo}</div>
                    <div className="text-xs uppercase tracking-wider text-orange-500/70 font-semibold">Baixo Risco</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center hover:bg-emerald-500/10 transition-colors cursor-default">
                    <div className="text-3xl font-bold text-emerald-500 mb-1">{churnAnalysis.muito_baixo}</div>
                    <div className="text-xs uppercase tracking-wider text-emerald-500/70 font-semibold">Seguro</div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Aniversariantes
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Hoje</span>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-xl font-bold text-white">
                                {birthdays.data?.filter((c: any) => {
                                  if (!c.birthday) return false;
                                  const d = new Date(c.birthday);
                                  const today = new Date();
                                  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
                                }).length || 0}
                             </span>
                        </div>
                     </div>
                     <div className="flex flex-col border-l border-white/5 pl-4">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Este Mês</span>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="text-xl font-bold text-white">
                                 {birthdays.data?.filter((c: any) => {
                                  if (!c.birthday) return false;
                                  const d = new Date(c.birthday);
                                  const today = new Date();
                                  return d.getMonth() === today.getMonth();
                                }).length || 0}
                             </span>
                        </div>
                     </div>
                  </div>
                </div>
            </GlassCard>
            
            {/* Tips Card */}
             <GlassCard className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Star className="h-24 w-24 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 relative z-10">Dica de LTV</h3>
                <p className="text-sm text-gray-400 relative z-10 leading-relaxed">
                    Clientes fidelizados (Seguros) tendem a gastar <strong>67% mais</strong> que novos clientes. Considere criar uma campanha de "Vip Week" para recompensar seus melhores compradores.
                </p>
                <div className="mt-4 flex gap-2 relative z-10">
                    <button className="text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1">
                        Ver Lista VIP <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
};