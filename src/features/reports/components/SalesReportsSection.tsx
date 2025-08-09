/**
 * Sales Reports Section - Sprint 2
 * Comprehensive sales analysis with filters and metrics
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, CreditCard, Download, Filter } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface SalesFilters {
  period: string;
  category: string;
  paymentMethod: string;
}

export const SalesReportsSection: React.FC = () => {
  const [filters, setFilters] = useState<SalesFilters>({
    period: '30',
    category: 'all',
    paymentMethod: 'all'
  });

  const [showFilters, setShowFilters] = useState(false);

  // Sales Metrics Query
  const { data: salesMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['sales-metrics', filters.period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(filters.period));

      const { data, error } = await supabase
        .rpc('get_sales_metrics', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return data?.[0] || { total_revenue: 0, total_sales: 0, average_ticket: 0 };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Top Products Query
  const { data: topProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['top-products', filters.period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(filters.period));

      const { data, error } = await supabase
        .rpc('get_top_products', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          limit_count: 10,
          by: 'revenue'
        });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sales by Category Query
  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ['sales-by-category', filters.period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(filters.period));

      const { data, error } = await supabase
        .rpc('get_sales_by_category', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return (data || []).map((item: any) => ({
        category: item.category_name,
        revenue: Number(item.total_revenue || 0)
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sales by Payment Method Query
  const { data: paymentData, isLoading: loadingPayments } = useQuery({
    queryKey: ['sales-by-payment', filters.period],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(filters.period));

      const { data, error } = await supabase
        .rpc('get_sales_by_payment_method', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) throw error;
      return (data || []).map((item: any) => ({
        method: item.payment_method,
        count: Number(item.total_sales || 0)
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

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-400" />
              Filtros de Vendas
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-400 hover:text-white"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Período</label>
                <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger className="bg-black/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                    <SelectItem value="365">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Categoria</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-black/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="vinho">Vinho</SelectItem>
                    <SelectItem value="gin">Gin</SelectItem>
                    <SelectItem value="whisky">Whisky</SelectItem>
                    <SelectItem value="vodka">Vodka</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">Método de Pagamento</label>
                <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger className="bg-black/50 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os métodos</SelectItem>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="fiado">Fiado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sales Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">
                  {loadingMetrics ? '...' : formatCurrency(salesMetrics?.total_revenue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Total de Vendas</p>
                <p className="text-2xl font-bold text-white">
                  {loadingMetrics ? '...' : (salesMetrics?.total_sales || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Ticket Médio</p>
                <p className="text-2xl font-bold text-white">
                  {loadingMetrics ? '...' : formatCurrency(salesMetrics?.average_ticket || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Top 10 Produtos (Receita)</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts?.slice(0, 8) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Vendas por Categoria</CardTitle>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {(categoryData || []).map((entry, index) => (
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
                    formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-amber-400" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV - Vendas
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV - Produtos
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV - Categorias
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};