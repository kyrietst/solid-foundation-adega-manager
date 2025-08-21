/**
 * @fileoverview Relatório completo de comparação Delivery vs Presencial
 * Análise detalhada, gráficos avançados e insights estratégicos
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter
} from 'recharts';
import { 
  Truck, Store, TrendingUp, TrendingDown, DollarSign, 
  ShoppingCart, Users, Clock, Target, Download, Filter,
  BarChart3, PieChart as PieChartIcon, Calendar, MapPin,
  Award, AlertTriangle, CheckCircle, Zap
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliveryVsPresencialReportProps {
  className?: string;
}

interface ComparisonData {
  delivery_orders: number;
  delivery_revenue: number;
  delivery_avg_ticket: number;
  instore_orders: number;
  instore_revenue: number;
  instore_avg_ticket: number;
  delivery_growth_rate: number;
  instore_growth_rate: number;
}

interface TrendData {
  date: string;
  delivery_orders: number;
  delivery_revenue: number;
  instore_orders: number;
  instore_revenue: number;
}

export const DeliveryVsPresencialReport = ({ className }: DeliveryVsPresencialReportProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

  // Query para dados comparativos
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['delivery-vs-instore-complete', selectedPeriod],
    queryFn: async (): Promise<ComparisonData> => {
      const { data, error } = await supabase.rpc('get_delivery_vs_instore_comparison', {
        p_days: days
      });

      if (error) throw error;

      return data[0] || {
        delivery_orders: 0,
        delivery_revenue: 0,
        delivery_avg_ticket: 0,
        instore_orders: 0,
        instore_revenue: 0,
        instore_avg_ticket: 0,
        delivery_growth_rate: 0,
        instore_growth_rate: 0
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query para tendências diárias (simulação para o exemplo)
  const { data: trends = [], isLoading: isLoadingTrends } = useQuery({
    queryKey: ['delivery-vs-instore-trends', selectedPeriod],
    queryFn: async (): Promise<TrendData[]> => {
      // Simulação de dados de tendência por enquanto
      return Array.from({ length: 14 }, (_, i) => {
        const date = subDays(new Date(), 13 - i);
        return {
          date: format(date, 'dd/MM', { locale: ptBR }),
          delivery_orders: Math.floor(Math.random() * 15) + 5,
          delivery_revenue: Math.floor(Math.random() * 2000) + 800,
          instore_orders: Math.floor(Math.random() * 25) + 15,
          instore_revenue: Math.floor(Math.random() * 3000) + 1500,
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !comparison) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-600/30 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-600/30 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calcular totais e métricas
  const totalOrders = comparison.delivery_orders + comparison.instore_orders;
  const totalRevenue = comparison.delivery_revenue + comparison.instore_revenue;
  const deliveryShare = totalRevenue > 0 ? (comparison.delivery_revenue / totalRevenue) * 100 : 0;
  const instoreShare = 100 - deliveryShare;

  // Dados para gráficos
  const comparisonChartData = [
    {
      channel: 'Delivery',
      orders: comparison.delivery_orders,
      revenue: comparison.delivery_revenue,
      avgTicket: comparison.delivery_avg_ticket,
      growth: comparison.delivery_growth_rate,
    },
    {
      channel: 'Presencial', 
      orders: comparison.instore_orders,
      revenue: comparison.instore_revenue,
      avgTicket: comparison.instore_avg_ticket,
      growth: comparison.instore_growth_rate,
    }
  ];

  const pieData = [
    { name: 'Delivery', value: comparison.delivery_revenue, percentage: deliveryShare },
    { name: 'Presencial', value: comparison.instore_revenue, percentage: instoreShare },
  ];

  const radarData = [{
    metric: 'Volume',
    delivery: comparison.delivery_orders > 0 ? (comparison.delivery_orders / totalOrders) * 100 : 0,
    presencial: comparison.instore_orders > 0 ? (comparison.instore_orders / totalOrders) * 100 : 0,
  }, {
    metric: 'Receita',
    delivery: deliveryShare,
    presencial: instoreShare,
  }, {
    metric: 'Ticket Médio',
    delivery: comparison.delivery_avg_ticket > 0 ? Math.min((comparison.delivery_avg_ticket / 500) * 100, 100) : 0,
    presencial: comparison.instore_avg_ticket > 0 ? Math.min((comparison.instore_avg_ticket / 500) * 100, 100) : 0,
  }, {
    metric: 'Crescimento',
    delivery: Math.max(comparison.delivery_growth_rate + 50, 0),
    presencial: Math.max(comparison.instore_growth_rate + 50, 0),
  }];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Relatório Delivery vs Presencial
          </h2>
          <p className="text-gray-400">
            Análise completa de performance entre canais de venda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32 bg-black/40 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <SelectItem value="7d" className="text-white hover:bg-white/10">7 dias</SelectItem>
              <SelectItem value="30d" className="text-white hover:bg-white/10">30 dias</SelectItem>
              <SelectItem value="90d" className="text-white hover:bg-white/10">90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-black/40 border-white/30 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principais */}
      <div id="delivery-overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Pedidos</p>
                <p className="text-2xl font-bold text-white">{totalOrders}</p>
                <p className="text-xs text-blue-400">
                  Delivery: {comparison.delivery_orders} | Presencial: {comparison.instore_orders}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card id="revenue-analysis" className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">
                    Delivery: {deliveryShare.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card id="ticket-analysis" className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ticket Médio Delivery</p>
                <p className="text-2xl font-bold text-white">
                  R$ {comparison.delivery_avg_ticket.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {comparison.delivery_avg_ticket > comparison.instore_avg_ticket ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={cn(
                    "text-xs",
                    comparison.delivery_avg_ticket > comparison.instore_avg_ticket ? "text-green-400" : "text-red-400"
                  )}>
                    vs R$ {comparison.instore_avg_ticket.toFixed(2)}
                  </span>
                </div>
              </div>
              <Truck className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card id="instore-overview" className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Canal Líder</p>
                <p className="text-2xl font-bold text-white">
                  {comparison.delivery_revenue > comparison.instore_revenue ? 'Delivery' : 'Presencial'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Award className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">
                    {Math.max(deliveryShare, instoreShare).toFixed(1)}% receita
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com análises detalhadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Visão Geral</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600">Tendências</TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-600">Análise</TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de barras comparativo */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Volume de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="channel" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" name="Pedidos" />
                    <Bar dataKey="revenue" fill="#10b981" name="Receita (R$)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico pizza de distribuição */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-400" />
                  Distribuição de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Comparativo detalhado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery */}
            <Card className="bg-blue-900/10 border-blue-400/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-400" />
                  Canal Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-800/20 rounded">
                    <ShoppingCart className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Pedidos</p>
                    <p className="text-xl font-bold text-white">
                      {comparison.delivery_orders}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-800/20 rounded">
                    <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Receita</p>
                    <p className="text-xl font-bold text-green-400">
                      R$ {comparison.delivery_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-800/20 rounded">
                    <span className="text-gray-400">Ticket Médio</span>
                    <span className="text-white font-semibold">
                      R$ {comparison.delivery_avg_ticket.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-800/20 rounded">
                    <span className="text-gray-400">Participação</span>
                    <Badge className="bg-blue-600">
                      {deliveryShare.toFixed(1)}% da receita
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-800/20 rounded">
                    <span className="text-gray-400">Crescimento</span>
                    <div className="flex items-center gap-2">
                      {comparison.delivery_growth_rate >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className={cn(
                        "font-semibold",
                        comparison.delivery_growth_rate >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {comparison.delivery_growth_rate >= 0 ? '+' : ''}{comparison.delivery_growth_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Presencial */}
            <Card className="bg-green-900/10 border-green-400/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Store className="h-5 w-5 text-green-400" />
                  Canal Presencial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-800/20 rounded">
                    <ShoppingCart className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Pedidos</p>
                    <p className="text-xl font-bold text-white">
                      {comparison.instore_orders}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-800/20 rounded">
                    <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Receita</p>
                    <p className="text-xl font-bold text-green-400">
                      R$ {comparison.instore_revenue.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-800/20 rounded">
                    <span className="text-gray-400">Ticket Médio</span>
                    <span className="text-white font-semibold">
                      R$ {comparison.instore_avg_ticket.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-800/20 rounded">
                    <span className="text-gray-400">Participação</span>
                    <Badge className="bg-green-600">
                      {instoreShare.toFixed(1)}% da receita
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-800/20 rounded">
                    <span className="text-gray-400">Crescimento</span>
                    <div className="flex items-center gap-2">
                      {comparison.instore_growth_rate >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      <span className={cn(
                        "font-semibold",
                        comparison.instore_growth_rate >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {comparison.instore_growth_rate >= 0 ? '+' : ''}{comparison.instore_growth_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendência de pedidos */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Tendência de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="delivery_orders" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Delivery"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="instore_orders" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Presencial"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendência de receita */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Tendência de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <defs>
                      <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="instoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="delivery_revenue" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="url(#deliveryGradient)"
                      name="Delivery"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="instore_revenue" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="url(#instoreGradient)"
                      name="Presencial"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análise radar */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Análise Multidimensional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af' }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <Radar
                      name="Delivery"
                      dataKey="delivery"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Radar
                      name="Presencial"
                      dataKey="presencial"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Correlação ticket vs volume */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Correlação Volume vs Ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="orders" 
                      stroke="#9ca3af"
                      label={{ value: 'Pedidos', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      dataKey="avgTicket" 
                      stroke="#9ca3af"
                      label={{ value: 'Ticket Médio (R$)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'avgTicket') return [`R$ ${value.toFixed(2)}`, 'Ticket Médio'];
                        return [value, name];
                      }}
                    />
                    <Scatter dataKey="avgTicket" fill="#8b5cf6" />
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-400">
                    Posição ideal: mais pedidos + maior ticket médio (canto superior direito)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Insights estratégicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.delivery_avg_ticket > comparison.instore_avg_ticket && (
                    <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Delivery Premium</p>
                        <p className="text-sm text-gray-400">
                          Ticket médio {((comparison.delivery_avg_ticket / comparison.instore_avg_ticket - 1) * 100).toFixed(1)}% maior
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {deliveryShare > 25 && (
                    <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Canal Estratégico</p>
                        <p className="text-sm text-gray-400">
                          Delivery representa {deliveryShare.toFixed(1)}% da receita
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {comparison.delivery_growth_rate > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Crescimento Delivery</p>
                        <p className="text-sm text-gray-400">
                          +{comparison.delivery_growth_rate.toFixed(1)}% no período
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {comparison.instore_avg_ticket > comparison.delivery_avg_ticket && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Melhorar Ticket Delivery</p>
                        <p className="text-sm text-gray-400">
                          Ticket presencial {((comparison.instore_avg_ticket / comparison.delivery_avg_ticket - 1) * 100).toFixed(1)}% maior
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {deliveryShare < 30 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Expandir Delivery</p>
                        <p className="text-sm text-gray-400">
                          Potential para aumentar participação de {deliveryShare.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {comparison.delivery_growth_rate < comparison.instore_growth_rate && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Acelerar Delivery</p>
                        <p className="text-sm text-gray-400">
                          Presencial crescendo {(comparison.instore_growth_rate - comparison.delivery_growth_rate).toFixed(1)}% mais
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recomendações estratégicas */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-gray-600 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Curto Prazo (1-3 meses)</h5>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Otimizar zonas com maior potencial</li>
                    <li>• Melhorar tempo de entrega médio</li>
                    <li>• Implementar promoções delivery</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Médio Prazo (3-6 meses)</h5>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Expandir área de cobertura</li>
                    <li>• Aumentar equipe de entregadores</li>
                    <li>• Desenvolver programa de fidelidade</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Longo Prazo (6+ meses)</h5>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Automatizar operações delivery</li>
                    <li>• Integrar com apps terceiros</li>
                    <li>• Análise preditiva de demanda</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryVsPresencialReport;