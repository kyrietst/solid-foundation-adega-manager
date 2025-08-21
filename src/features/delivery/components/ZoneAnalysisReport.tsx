/**
 * @fileoverview Relatório de análise por zonas de entrega
 * Performance, rentabilidade e insights por área geográfica
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import { 
  MapPin, DollarSign, Clock, Target, TrendingUp, 
  Package, Users, Award, AlertTriangle, CheckCircle,
  Download, Filter, Map, BarChart3
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDeliveryReportExport } from '../hooks/useDeliveryReports';

interface ZoneAnalysisReportProps {
  className?: string;
}

interface ZoneStats {
  zone_name: string;
  order_count: number;
  revenue: number;
  avg_delivery_time: number;
  on_time_rate: number;
}

interface ZoneDetail {
  zone_id: string;
  zone_name: string;
  delivery_fee: number;
  avg_distance: number;
  peak_hours: string;
  customer_density: number;
  repeat_rate: number;
}

export const ZoneAnalysisReport = ({ className }: ZoneAnalysisReportProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'heatmap'>('overview');

  // Hook para exportação
  const exportReport = useDeliveryReportExport();

  const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

  // Query para estatísticas das zonas
  const { data: zoneStats = [], isLoading } = useQuery({
    queryKey: ['zone-performance', selectedPeriod],
    queryFn: async (): Promise<ZoneStats[]> => {
      console.log('🗺️ Carregando performance das zonas...');
      
      const { data, error } = await supabase.rpc('get_zone_performance', {
        p_days: days
      });

      if (error) {
        console.error('❌ Erro ao carregar zonas:', error);
        throw error;
      }

      console.log('✅ Performance das zonas carregada:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query para detalhes específicos das zonas
  const { data: zoneDetails = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ['zone-details', selectedPeriod],
    queryFn: async (): Promise<ZoneDetail[]> => {
      console.log('📊 Carregando detalhes das zonas...');
      
      const { data, error } = await supabase.rpc('get_zone_detailed_analysis', {
        p_days: days
      });

      if (error) {
        console.error('❌ Erro ao carregar detalhes das zonas:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Funções de análise
  const getZoneRanking = () => {
    return [...zoneStats]
      .sort((a, b) => b.revenue - a.revenue)
      .map((zone, index) => ({ ...zone, ranking: index + 1 }));
  };

  const getZonePerformanceColor = (rate: number) => {
    if (rate >= 0.85) return 'text-green-400';
    if (rate >= 0.70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Dados para gráficos
  const revenueChartData = zoneStats.map(zone => ({
    zone: zone.zone_name.length > 10 ? zone.zone_name.substring(0, 10) + '...' : zone.zone_name,
    revenue: zone.revenue,
    orders: zone.order_count,
  }));

  const timeVsRevenueData = zoneStats.map(zone => ({
    zone: zone.zone_name,
    time: zone.avg_delivery_time,
    revenue: zone.revenue,
    efficiency: zone.on_time_rate * 100,
  }));

  const pieChartData = zoneStats.map(zone => ({
    name: zone.zone_name,
    value: zone.revenue,
    count: zone.order_count,
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  const rankedZones = getZoneRanking();

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Análise por Zonas</h3>
          <p className="text-gray-400">Performance e rentabilidade por área de entrega</p>
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

          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-40 bg-black/40 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <SelectItem value="overview" className="text-white hover:bg-white/10">Visão Geral</SelectItem>
              <SelectItem value="details" className="text-white hover:bg-white/10">Detalhes</SelectItem>
              <SelectItem value="heatmap" className="text-white hover:bg-white/10">Mapa de Calor</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport.mutate({
              reportType: 'zone_analysis',
              format: 'csv',
              period: selectedPeriod,
            })}
            disabled={exportReport.isPending}
            className="bg-black/40 border-white/30 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            {exportReport.isPending ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-600/30 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-600/30 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-600/30 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : zoneStats.length === 0 ? (
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhuma zona com dados
            </h3>
            <p className="text-gray-400">
              Não há dados de entregas por zona no período selecionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'overview' && (
            <div className="space-y-6">
              {/* Top 3 zonas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rankedZones.slice(0, 3).map((zone, index) => (
                  <Card 
                    key={zone.zone_name}
                    className={cn(
                      "bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300",
                      index === 0 && "border-yellow-400/50 shadow-yellow-400/20 shadow-lg",
                      index === 1 && "border-gray-300/50 shadow-gray-300/20 shadow-lg",
                      index === 2 && "border-amber-600/50 shadow-amber-600/20 shadow-lg"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {index === 0 && <Award className="h-6 w-6 text-yellow-400" />}
                          {index === 1 && <Award className="h-6 w-6 text-gray-300" />}
                          {index === 2 && <Award className="h-6 w-6 text-amber-600" />}
                          <div>
                            <h4 className="text-white font-semibold">{zone.zone_name}</h4>
                            <p className="text-sm text-gray-400">#{zone.ranking} em receita</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Receita</p>
                          <p className="text-lg font-semibold text-green-400">
                            R$ {zone.revenue.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Pedidos</p>
                          <p className="text-lg font-semibold text-blue-400">
                            {zone.order_count}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Tempo Médio</p>
                          <p className="text-sm font-semibold text-white">
                            {formatTime(zone.avg_delivery_time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Pontualidade</p>
                          <p className={cn(
                            "text-sm font-semibold",
                            getZonePerformanceColor(zone.on_time_rate)
                          )}>
                            {(zone.on_time_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Gráficos comparativos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Receita por Zona
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="zone" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="revenue" fill="#10b981" name="Receita (R$)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      Distribuição de Receita
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {viewMode === 'details' && (
            <div className="space-y-6">
              {/* Tabela detalhada de zonas */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Map className="h-5 w-5 text-green-400" />
                    Análise Detalhada por Zona
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rankedZones.map((zone, index) => (
                      <div 
                        key={zone.zone_name}
                        className="p-4 bg-gray-700/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              index < 3 ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black" : "bg-gray-600 text-white"
                            )}>
                              #{zone.ranking}
                            </div>
                            <div>
                              <h4 className="text-white font-semibold">{zone.zone_name}</h4>
                              <p className="text-sm text-gray-400">
                                {zone.order_count} pedidos no período
                              </p>
                            </div>
                          </div>
                          
                          <Badge className={cn(
                            "font-semibold",
                            zone.on_time_rate >= 0.85 ? "bg-green-600" :
                            zone.on_time_rate >= 0.70 ? "bg-yellow-600" : "bg-red-600"
                          )}>
                            {(zone.on_time_rate * 100).toFixed(1)}% Pontual
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-green-900/20 rounded">
                            <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Receita</p>
                            <p className="text-sm font-semibold text-green-400">
                              R$ {zone.revenue.toFixed(2)}
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-blue-900/20 rounded">
                            <Package className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Volume</p>
                            <p className="text-sm font-semibold text-blue-400">
                              {zone.order_count} pedidos
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-900/20 rounded">
                            <Clock className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Tempo Médio</p>
                            <p className="text-sm font-semibold text-orange-400">
                              {formatTime(zone.avg_delivery_time)}
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-900/20 rounded">
                            <Target className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-400">Ticket Médio</p>
                            <p className="text-sm font-semibold text-purple-400">
                              R$ {(zone.revenue / zone.order_count).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === 'heatmap' && (
            <div className="space-y-6">
              {/* Análise de correlação tempo x receita */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-400" />
                    Correlação: Tempo vs Receita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart data={timeVsRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#9ca3af" 
                        label={{ value: 'Tempo Médio (min)', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        dataKey="revenue" 
                        stroke="#9ca3af"
                        label={{ value: 'Receita (R$)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'revenue') return [`R$ ${value.toFixed(2)}`, 'Receita'];
                          if (name === 'time') return [`${formatTime(value)}`, 'Tempo Médio'];
                          return [value, name];
                        }}
                      />
                      <Scatter dataKey="revenue" fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                      Cada ponto representa uma zona. Zonas ideais: baixo tempo + alta receita (canto superior esquerdo)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Insights automáticos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      Zonas de Alto Potencial
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rankedZones
                        .filter(zone => zone.on_time_rate > 0.8 && zone.revenue > 500)
                        .slice(0, 3)
                        .map((zone) => (
                          <div key={zone.zone_name} className="flex items-center justify-between p-3 bg-green-900/20 rounded">
                            <div>
                              <p className="text-white font-medium">{zone.zone_name}</p>
                              <p className="text-xs text-gray-400">
                                Alta pontualidade + boa receita
                              </p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      Zonas que Precisam de Atenção
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rankedZones
                        .filter(zone => zone.on_time_rate < 0.7 || zone.avg_delivery_time > 60)
                        .slice(0, 3)
                        .map((zone) => (
                          <div key={zone.zone_name} className="flex items-center justify-between p-3 bg-yellow-900/20 rounded">
                            <div>
                              <p className="text-white font-medium">{zone.zone_name}</p>
                              <p className="text-xs text-gray-400">
                                {zone.on_time_rate < 0.7 ? 'Baixa pontualidade' : 'Tempo elevado'}
                              </p>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ZoneAnalysisReport;