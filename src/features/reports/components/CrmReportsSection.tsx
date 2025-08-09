/**
 * CRM Reports Section - Sprint 2
 * Customer analysis with LTV, segmentation, and churn prediction
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Users, TrendingUp, AlertCircle, Heart, DollarSign, Download } from 'lucide-react';
import { DataTable } from '@/shared/ui/layout/DataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface CustomerMetrics {
  total_customers: number;
  new_customers: number;
  active_customers: number;
}

export const CrmReportsSection: React.FC = () => {
  const [windowDays, setWindowDays] = useState(30);

  // Customer Metrics Query
  const { data: customerMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['customer-metrics', windowDays],
    queryFn: async (): Promise<CustomerMetrics> => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);

      const { data, error } = await supabase
        .rpc('get_customer_metrics', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return data?.[0] || { total_customers: 0, new_customers: 0, active_customers: 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Top Customers Query
  const { data: topCustomers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['top-customers', windowDays],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);

      const { data, error } = await supabase
        .rpc('get_top_customers', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit_count: 20
        });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Customer Segmentation Analysis
  const { data: segments, isLoading: loadingSegments } = useQuery({
    queryKey: ['customer-segments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('segment, lifetime_value, last_purchase_date, purchase_frequency')
        .not('segment', 'is', null);

      if (error) throw error;

      const segmentAnalysis = (data || []).reduce((acc: any, customer) => {
        const segment = customer.segment || 'Indefinido';
        if (!acc[segment]) {
          acc[segment] = {
            segment,
            count: 0,
            total_ltv: 0,
            recent_active: 0
          };
        }
        acc[segment].count += 1;
        acc[segment].total_ltv += Number(customer.lifetime_value || 0);
        
        // Check if customer purchased in last 30 days
        if (customer.last_purchase_date) {
          const daysSinceLastPurchase = Math.floor(
            (new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastPurchase <= 30) {
            acc[segment].recent_active += 1;
          }
        }
        
        return acc;
      }, {});

      return Object.values(segmentAnalysis).map((seg: any) => ({
        ...seg,
        avg_ltv: seg.count > 0 ? seg.total_ltv / seg.count : 0,
        retention_rate: seg.count > 0 ? (seg.recent_active / seg.count) * 100 : 0
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

  // Customer Retention Data
  const { data: retentionData, isLoading: loadingRetention } = useQuery({
    queryKey: ['customer-retention', windowDays],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (windowDays * 6)); // Show 6 periods

      const { data, error } = await supabase
        .rpc('get_customer_retention', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getChurnRisk = (lastPurchase: string | null, frequency: string | null) => {
    if (!lastPurchase) return { level: 'Alto', color: 'text-red-400' };
    
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - new Date(lastPurchase).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastPurchase > 90) return { level: 'Alto', color: 'text-red-400' };
    if (daysSinceLastPurchase > 60) return { level: 'Médio', color: 'text-yellow-400' };
    if (daysSinceLastPurchase > 30) return { level: 'Baixo', color: 'text-orange-400' };
    return { level: 'Muito Baixo', color: 'text-green-400' };
  };

  const customerColumns = [
    {
      accessorKey: 'customer_name',
      header: 'Cliente',
      cell: ({ row }: any) => (
        <span className="text-white font-medium">{row.getValue('customer_name')}</span>
      ),
    },
    {
      accessorKey: 'total_spent',
      header: 'LTV Total',
      cell: ({ row }: any) => (
        <span className="text-green-400 font-medium">
          {formatCurrency(row.getValue('total_spent'))}
        </span>
      ),
    },
  ];

  const segmentColumns = [
    {
      accessorKey: 'segment',
      header: 'Segmento',
      cell: ({ row }: any) => (
        <span className="text-white font-medium">{row.getValue('segment')}</span>
      ),
    },
    {
      accessorKey: 'count',
      header: 'Clientes',
      cell: ({ row }: any) => (
        <span className="text-blue-400 font-medium">{row.getValue('count')}</span>
      ),
    },
    {
      accessorKey: 'avg_ltv',
      header: 'LTV Médio',
      cell: ({ row }: any) => (
        <span className="text-green-400">
          {formatCurrency(row.getValue('avg_ltv'))}
        </span>
      ),
    },
    {
      accessorKey: 'retention_rate',
      header: 'Taxa Retenção',
      cell: ({ row }: any) => {
        const rate = row.getValue('retention_rate') as number;
        const color = rate > 50 ? 'text-green-400' : rate > 25 ? 'text-yellow-400' : 'text-red-400';
        return (
          <span className={color}>
            {rate.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  // Calculate churn risk analysis
  const churnAnalysis = {
    alto: 0,
    medio: 0,
    baixo: 0,
    muito_baixo: 0
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Período de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[30, 60, 90, 180].map((days) => (
              <Button
                key={days}
                variant={windowDays === days ? "default" : "outline"}
                onClick={() => setWindowDays(days)}
                className={windowDays === days ? "bg-amber-600" : ""}
              >
                {days} dias
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Total de Clientes</p>
                <p className="text-2xl font-bold text-white">
                  {loadingMetrics ? '...' : (customerMetrics?.total_customers || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Novos Clientes</p>
                <p className="text-2xl font-bold text-white">
                  {loadingMetrics ? '...' : (customerMetrics?.new_customers || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Clientes Ativos</p>
                <p className="text-2xl font-bold text-white">
                  {loadingMetrics ? '...' : (customerMetrics?.active_customers || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Segmentação de Clientes</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segments || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="segment" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" name="Clientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Retention Trend */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Tendência de Retenção</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData || []}>
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
                  />
                  <Line 
                    type="monotone" 
                    dataKey="retained" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Retidos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lost" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Perdidos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Top Clientes por LTV</CardTitle>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={customerColumns}
              data={topCustomers || []}
              isLoading={loadingCustomers}
              searchKey="customer_name"
              searchPlaceholder="Buscar cliente..."
            />
          </CardContent>
        </Card>

        {/* Segment Analysis */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Análise por Segmento</CardTitle>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={segmentColumns}
              data={segments || []}
              isLoading={loadingSegments}
              searchKey="segment"
              searchPlaceholder="Buscar segmento..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Churn Risk Analysis */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-400" />
            Análise de Risco de Churn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{churnAnalysis.alto}</p>
              <p className="text-sm text-red-400">Alto Risco</p>
              <p className="text-xs text-gray-400">{'>'} 90 dias sem comprar</p>
            </div>
            <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-2xl font-bold text-yellow-400">{churnAnalysis.medio}</p>
              <p className="text-sm text-yellow-400">Médio Risco</p>
              <p className="text-xs text-gray-400">60-90 dias</p>
            </div>
            <div className="text-center p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-400">{churnAnalysis.baixo}</p>
              <p className="text-sm text-orange-400">Baixo Risco</p>
              <p className="text-xs text-gray-400">30-60 dias</p>
            </div>
            <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{churnAnalysis.muito_baixo}</p>
              <p className="text-sm text-green-400">Muito Baixo</p>
              <p className="text-xs text-gray-400">{'<'} 30 dias</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 space-y-1">
            <p><span className="font-semibold">LTV:</span> Lifetime Value - Valor total gasto pelo cliente</p>
            <p><span className="font-semibold">Segmentação:</span> Baseada em LTV e frequência de compra</p>
            <p><span className="font-semibold">Churn Risk:</span> Probabilidade de perda do cliente baseada no último pedido</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};