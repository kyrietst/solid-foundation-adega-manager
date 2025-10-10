/**
 * @fileoverview Relatório detalhado de performance dos entregadores
 * Ranking, métricas individuais e comparativos de eficiência
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
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Users, Star, Clock, Target, Trophy, TrendingUp, 
  Package, DollarSign, MapPin, Download, Filter,
  Medal, Award, Crown, User
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDeliveryReportExport } from '../hooks/useDeliveryReports';

interface DeliveryPersonReportProps {
  className?: string;
}

interface DeliveryPersonStats {
  id: string;
  name: string;
  total_deliveries: number;
  avg_delivery_time: number;
  on_time_rate: number;
  customer_rating: number;
  total_revenue: number;
  efficiency: number;
}

interface DeliveryPersonDetail {
  person_id: string;
  person_name: string;
  date: string;
  deliveries_count: number;
  total_time: number;
  avg_time: number;
  on_time_count: number;
  revenue: number;
}

export const DeliveryPersonReport = ({ className }: DeliveryPersonReportProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'ranking' | 'details' | 'comparison'>('ranking');

  // Hook para exportação
  const exportReport = useDeliveryReportExport();

  const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

  // Query para estatísticas gerais dos entregadores
  const { data: deliveryPersons = [], isLoading } = useQuery({
    queryKey: ['delivery-persons-performance', selectedPeriod],
    queryFn: async (): Promise<DeliveryPersonStats[]> => {
      console.log('👥 Carregando performance de entregadores...');
      
      const { data, error } = await supabase.rpc('get_delivery_person_performance', {
        p_days: days
      });

      if (error) {
        console.error('❌ Erro ao carregar performance:', error);
        throw error;
      }

      console.log('✅ Performance carregada:', data);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Query para detalhes diários de um entregador específico
  const { data: personDetails = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ['delivery-person-details', selectedPerson, selectedPeriod],
    queryFn: async (): Promise<DeliveryPersonDetail[]> => {
      if (selectedPerson === 'all') return [];
      
      console.log(`📊 Carregando detalhes do entregador ${selectedPerson}...`);
      
      const { data, error } = await supabase.rpc('get_delivery_person_daily_details', {
        p_person_id: selectedPerson,
        p_days: days
      });

      if (error) {
        console.error('❌ Erro ao carregar detalhes:', error);
        throw error;
      }

      return data || [];
    },
    enabled: selectedPerson !== 'all',
    staleTime: 5 * 60 * 1000,
  });

  // Função para obter badge de ranking
  const getRankingBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-300" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  // Função para obter cor de performance
  const getPerformanceColor = (value: number, type: 'efficiency' | 'onTime' | 'rating') => {
    switch (type) {
      case 'efficiency':
        if (value >= 8) return 'text-green-400';
        if (value >= 6) return 'text-yellow-400';
        return 'text-red-400';
      case 'onTime':
        if (value >= 0.85) return 'text-green-400';
        if (value >= 0.70) return 'text-yellow-400';
        return 'text-red-400';
      case 'rating':
        if (value >= 4.5) return 'text-green-400';
        if (value >= 3.5) return 'text-yellow-400';
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  // Dados para gráfico radar de comparação
  const radarData = deliveryPersons.slice(0, 3).map(person => ({
    name: person.name.split(' ')[0], // Primeiro nome
    efficiency: person.efficiency,
    punctuality: person.on_time_rate * 10, // Escala para 10
    volume: (person.total_deliveries / Math.max(...deliveryPersons.map(p => p.total_deliveries))) * 10,
    revenue: (person.total_revenue / Math.max(...deliveryPersons.map(p => p.total_revenue))) * 10,
  }));

  // Dados para gráfico de barras de comparação
  const comparisonData = deliveryPersons.map(person => ({
    name: person.name.split(' ')[0],
    deliveries: person.total_deliveries,
    efficiency: person.efficiency,
    onTimeRate: person.on_time_rate * 100,
    revenue: person.total_revenue,
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Relatório de Entregadores</h3>
          <p className="text-gray-400">Performance individual e comparativos</p>
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
              <SelectItem value="ranking" className="text-white hover:bg-white/10">Ranking</SelectItem>
              <SelectItem value="details" className="text-white hover:bg-white/10">Detalhes</SelectItem>
              <SelectItem value="comparison" className="text-white hover:bg-white/10">Comparação</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport.mutate({
              reportType: 'delivery_performance',
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-600/30 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-600/30 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-600/30 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : deliveryPersons.length === 0 ? (
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhum entregador ativo
            </h3>
            <p className="text-gray-400">
              Não há dados de entregadores no período selecionado
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'ranking' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {deliveryPersons.map((person, index) => (
                <Card 
                  key={person.id} 
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
                        {getRankingBadge(index)}
                        <div>
                          <h4 className="text-white font-semibold">{person.name}</h4>
                          <p className="text-sm text-gray-400">{person.total_deliveries} entregas</p>
                        </div>
                      </div>
                      <Badge 
                        className={cn(
                          "font-semibold",
                          person.efficiency >= 8 ? "bg-green-600" : 
                          person.efficiency >= 6 ? "bg-yellow-600" : "bg-red-600"
                        )}
                      >
                        {person.efficiency.toFixed(1)}★
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Tempo Médio</p>
                        <p className="text-sm font-semibold text-white">
                          {formatTime(person.avg_delivery_time)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pontualidade</p>
                        <p className={cn(
                          "text-sm font-semibold",
                          getPerformanceColor(person.on_time_rate, 'onTime')
                        )}>
                          {(person.on_time_rate * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Avaliação</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className={cn(
                            "text-sm font-semibold",
                            getPerformanceColor(person.customer_rating, 'rating')
                          )}>
                            {person.customer_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Receita</p>
                        <p className="text-sm font-semibold text-green-400">
                          R$ {person.total_revenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'comparison' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de barras comparativo */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-400" />
                    Comparativo de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{
                          color: '#E5E7EB',
                          fontWeight: '600'
                        }}
                      />
                      <Bar dataKey="deliveries" fill="#3b82f6" name="Entregas" />
                      <Bar dataKey="efficiency" fill="#8b5cf6" name="Eficiência" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico radar dos top 3 */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Radar Top 3
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="name" className="text-xs" tick={{ fill: '#9ca3af' }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 10]} 
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                      />
                      <Radar
                        name="Efficiency"
                        dataKey="efficiency"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Punctuality"
                        dataKey="punctuality"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{
                          color: '#E5E7EB',
                          fontWeight: '600'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {viewMode === 'details' && selectedPerson !== 'all' && (
            <div className="space-y-6">
              {/* Seletor de entregador */}
              <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <User className="h-8 w-8 text-blue-400" />
                    <div className="flex-1">
                      <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                        <SelectTrigger className="bg-black/40 border-white/30 text-white">
                          <SelectValue placeholder="Selecione um entregador" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                          <SelectItem value="all" className="text-white hover:bg-white/10">
                            Todos os entregadores
                          </SelectItem>
                          {deliveryPersons.map((person) => (
                            <SelectItem 
                              key={person.id} 
                              value={person.id} 
                              className="text-white hover:bg-white/10"
                            >
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detalhes diários */}
              {isLoadingDetails ? (
                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-600/30 rounded w-1/4"></div>
                      <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-12 bg-gray-600/30 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Detalhes Diários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {personDetails.map((detail, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-700/20 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-400">Data</p>
                              <p className="text-sm font-medium text-white">
                                {new Date(detail.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-xs text-gray-400">Entregas</p>
                              <p className="text-lg font-semibold text-blue-400">
                                {detail.deliveries_count}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs text-gray-400">Tempo Médio</p>
                              <p className="text-sm font-semibold text-white">
                                {formatTime(detail.avg_time)}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs text-gray-400">Pontualidade</p>
                              <p className="text-sm font-semibold text-green-400">
                                {detail.on_time_count}/{detail.deliveries_count}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <p className="text-xs text-gray-400">Receita</p>
                              <p className="text-sm font-semibold text-green-400">
                                R$ {detail.revenue.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryPersonReport;