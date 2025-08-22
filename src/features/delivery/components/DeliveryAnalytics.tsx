/**
 * @fileoverview Componente de analytics especializados para o sistema de delivery
 * Exibe métricas avançadas, gráficos e comparativos de performance
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/primitives/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, MapPin, Truck, Star, 
  DollarSign, Package, Target, AlertCircle, CheckCircle,
  Users, Calendar, Download, Filter
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { DeliveryPersonReport } from './DeliveryPersonReport';
import { ZoneAnalysisReport } from './ZoneAnalysisReport';
import { DeliveryPersonPerformance } from './DeliveryPersonPerformance';
import { useDeliveryReportExport } from '../hooks/useDeliveryReports';

interface DeliveryAnalyticsProps {
  className?: string;
}

interface DeliveryKPIs {
  totalOrders: number;
  totalRevenue: number;
  avgDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
  avgOrderValue: number;
  deliveryFeeRevenue: number;
  topZone: {
    zoneName: string;
    revenue: number;
    orderCount: number;
  };
  revenueGrowthRate: number;
  deliveryTimeImprovement: number;
}

interface DeliveryPersonStats {
  id: string;
  name: string;
  totalDeliveries: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  customerRating: number;
  totalRevenue: number;
  efficiency: number;
}

interface ZoneStats {
  zone_name: string;
  order_count: number;
  revenue: number;
  avg_delivery_time: number;
  on_time_rate: number;
}

export const DeliveryAnalytics = ({ className }: DeliveryAnalyticsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Hook para exportação de relatórios
  const exportReport = useDeliveryReportExport();

  // Query para KPIs gerais
  const { data: kpis = {} as DeliveryKPIs, isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['delivery-analytics-kpis', selectedPeriod],
    queryFn: async (): Promise<DeliveryKPIs> => {
      console.log('📊 Carregando KPIs de delivery...');
      
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase.rpc('calculate_delivery_kpis', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_delivery_person_id: null
      });

      if (error) {
        console.error('❌ Erro ao carregar KPIs:', error);
        throw error;
      }

      console.log('✅ KPIs carregados:', data);
      return data || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para estatísticas de entregadores
  const { data: deliveryPersonsStats = [], isLoading: isLoadingPersons } = useQuery({
    queryKey: ['delivery-persons-stats', selectedPeriod],
    queryFn: async (): Promise<DeliveryPersonStats[]> => {
      console.log('👥 Carregando estatísticas de entregadores...');
      
      const { data, error } = await supabase.rpc('get_delivery_person_performance', {
        p_days: selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      });

      if (error) {
        console.error('❌ Erro ao carregar stats de entregadores:', error);
        throw error;
      }

      console.log('✅ Stats de entregadores carregadas:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query para estatísticas de zonas
  const { data: zoneStats = [], isLoading: isLoadingZones } = useQuery({
    queryKey: ['delivery-zones-stats', selectedPeriod],
    queryFn: async (): Promise<ZoneStats[]> => {
      console.log('🗺️ Carregando estatísticas de zonas...');
      
      const { data, error } = await supabase.rpc('get_zone_performance', {
        p_days: selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      });

      if (error) {
        console.error('❌ Erro ao carregar stats de zonas:', error);
        throw error;
      }

      console.log('✅ Stats de zonas carregadas:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Função para obter cor baseada na performance
  const getPerformanceColor = (value: number, threshold: { good: number; average: number }) => {
    if (value >= threshold.good) return 'text-green-400';
    if (value >= threshold.average) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Função para formatar tempo
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Função para exportar relatório baseado na aba ativa
  const handleExport = () => {
    let reportType: 'delivery_summary' | 'delivery_performance' | 'zone_analysis' | 'delivery_timeline';
    
    switch (activeTab) {
      case 'persons':
        reportType = 'delivery_performance';
        break;
      case 'zones':
        reportType = 'zone_analysis';
        break;
      case 'trends':
        reportType = 'delivery_timeline';
        break;
      default:
        reportType = 'delivery_summary';
    }

    exportReport.mutate({
      reportType,
      format: 'csv',
      period: selectedPeriod,
    });
  };

  // Dados para gráficos de zona (mantido para outros componentes)
  const zoneChartData = zoneStats.slice(0, 5).map(zone => ({
    name: zone.zone_name,
    revenue: zone.revenue,
    orders: zone.order_count,
    efficiency: zone.on_time_rate * 100,
  }));

  // Dados de distribuição de tempo - será calculado com dados reais
  const deliveryTimeData = React.useMemo(() => {
    // TODO: Implementar cálculo baseado em dados reais
    // Por enquanto retorna dados vazios até haver entregas reais
    return [
      { timeRange: '0-30min', count: 0, percentage: 0 },
      { timeRange: '30-60min', count: 0, percentage: 0 },
      { timeRange: '60-90min', count: 0, percentage: 0 },
      { timeRange: '90min+', count: 0, percentage: 0 },
    ];
  }, []);

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics de Delivery</h2>
          <p className="text-gray-400">Métricas avançadas e relatórios de performance</p>
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
            onClick={handleExport}
            disabled={exportReport.isPending}
            className="bg-black/40 border-white/30 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportReport.isPending ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Entregas</p>
                <p className="text-2xl font-bold text-white">{kpis.totalOrders || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">+{kpis.revenueGrowthRate?.toFixed(1) || 0}%</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tempo Médio</p>
                <p className="text-2xl font-bold text-white">
                  {formatTime(kpis.avgDeliveryTime || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">
                    -{kpis.deliveryTimeImprovement?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Taxa de Pontualidade</p>
                <p className="text-2xl font-bold text-white">
                  {(kpis.onTimeDeliveryRate * 100 || 0).toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-blue-400">Meta: 85%</span>
                </div>
              </div>
              <CheckCircle className={cn(
                "h-8 w-8",
                getPerformanceColor((kpis.onTimeDeliveryRate || 0) * 100, { good: 85, average: 70 })
              )} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Receita Total</p>
                <p className="text-2xl font-bold text-white">
                  R$ {(kpis.totalRevenue || 0).toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">
                    Taxas: R$ {(kpis.deliveryFeeRevenue || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes análises */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Geral</TabsTrigger>
          <TabsTrigger value="persons" className="data-[state=active]:bg-blue-600">Entregadores</TabsTrigger>
          <TabsTrigger value="zones" className="data-[state=active]:bg-blue-600">Zonas</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-blue-600">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance de Entregadores */}
            <DeliveryPersonPerformance 
              selectedPeriod={selectedPeriod}
              className="lg:col-span-1"
            />

            {/* Distribuição de tempo de entrega */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-400" />
                  Distribuição de Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deliveryTimeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#eab308" />
                      <Cell fill="#f97316" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="persons" className="space-y-6">
          <DeliveryPersonReport />
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <ZoneAnalysisReport />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Crescimento Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Receita de Delivery</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        +{kpis.revenueGrowthRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Tempo de Entrega</span>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        -{kpis.deliveryTimeImprovement?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Satisfação do Cliente</span>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-semibold">
                        {(kpis.customerSatisfaction || 0).toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Indicadores de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Taxa de Pontualidade</span>
                    <Badge className={cn(
                      "font-semibold",
                      (kpis.onTimeDeliveryRate || 0) * 100 >= 85 ? "bg-green-600" : 
                      (kpis.onTimeDeliveryRate || 0) * 100 >= 70 ? "bg-yellow-600" : "bg-red-600"
                    )}>
                      {((kpis.onTimeDeliveryRate || 0) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Ticket Médio</span>
                    <span className="text-white font-semibold">
                      R$ {(kpis.avgOrderValue || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Zona Mais Rentável</span>
                    <span className="text-blue-400 font-semibold">
                      {kpis.topZone?.zoneName || 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryAnalytics;