/**
 * @fileoverview Componente de Performance de Entregadores com Radar Chart
 * Exibe métricas de performance individual dos entregadores
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Badge } from '@/shared/ui/primitives/badge';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { 
  Users, Star, Clock, Target, TrendingUp, Award,
  CheckCircle, AlertCircle, User
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

interface DeliveryPersonPerformanceProps {
  selectedPeriod: '7d' | '30d' | '90d';
  className?: string;
}

interface DeliveryPersonStats {
  id: string;
  name: string;
  totalDeliveries: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  customerRating: number;
  efficiency: number;
  completionRate: number;
}

interface RadarDataPoint {
  metric: string;
  value: number;
  fullMark: 100;
}

export const DeliveryPersonPerformance = ({ 
  selectedPeriod, 
  className 
}: DeliveryPersonPerformanceProps) => {
  const [selectedPerson, setSelectedPerson] = useState<string>('all');

  // Query para estatísticas de entregadores
  const { data: deliveryPersonsStats = [], isLoading } = useQuery({
    queryKey: ['delivery-persons-performance', selectedPeriod],
    queryFn: async (): Promise<DeliveryPersonStats[]> => {
      console.log('👥 Carregando performance de entregadores...');
      
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      
      // Buscar dados de performance dos entregadores
      const { data: performanceData, error } = await supabase.rpc('get_delivery_person_performance', {
        p_days: days
      });

      if (error) {
        console.warn('⚠️ RPC não disponível, buscando dados manualmente');
        
        // Fallback: buscar dados manualmente
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            delivery_person_id,
            delivery_status,
            delivery_started_at,
            delivery_completed_at,
            final_amount,
            created_at,
            profiles:delivery_person_id (
              id,
              name
            )
          `)
          .eq('delivery_type', 'delivery')
          .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
          .not('delivery_person_id', 'is', null);

        if (salesError) throw salesError;

        // Processar dados manualmente
        const personStats = new Map<string, any>();
        
        salesData?.forEach(sale => {
          const personId = sale.delivery_person_id;
          const person = sale.profiles;
          
          if (!personId || !person) return;
          
          if (!personStats.has(personId)) {
            personStats.set(personId, {
              id: personId,
              name: person.name,
              totalDeliveries: 0,
              completedDeliveries: 0,
              totalDeliveryTime: 0,
              onTimeDeliveries: 0,
              totalRevenue: 0
            });
          }
          
          const stats = personStats.get(personId);
          stats.totalDeliveries++;
          stats.totalRevenue += parseFloat(sale.final_amount || '0');
          
          if (sale.delivery_status === 'delivered') {
            stats.completedDeliveries++;
            
            if (sale.delivery_started_at && sale.delivery_completed_at) {
              const deliveryTime = (new Date(sale.delivery_completed_at).getTime() - 
                                  new Date(sale.delivery_started_at).getTime()) / (1000 * 60);
              stats.totalDeliveryTime += deliveryTime;
              
              // Considerar "on time" se entregue em menos de 45 minutos
              if (deliveryTime <= 45) {
                stats.onTimeDeliveries++;
              }
            }
          }
        });
        
        return Array.from(personStats.values()).map(stats => ({
          id: stats.id,
          name: stats.name,
          totalDeliveries: stats.totalDeliveries,
          avgDeliveryTime: stats.completedDeliveries > 0 ? stats.totalDeliveryTime / stats.completedDeliveries : 0,
          onTimeRate: stats.completedDeliveries > 0 ? (stats.onTimeDeliveries / stats.completedDeliveries) * 100 : 0,
          customerRating: 4.5, // Default rating until customer feedback system is implemented
          efficiency: stats.totalDeliveries > 0 ? (stats.completedDeliveries / stats.totalDeliveries) * 100 : 0,
          completionRate: stats.totalDeliveries > 0 ? (stats.completedDeliveries / stats.totalDeliveries) * 100 : 0
        }));
      }

      // Mapear dados da stored procedure para o formato esperado
      return (performanceData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        totalDeliveries: parseInt(item.total_deliveries) || 0,
        avgDeliveryTime: parseFloat(item.avg_delivery_time) || 0,
        onTimeRate: parseFloat(item.on_time_rate) || 0,
        customerRating: parseFloat(item.customer_rating) || 4.5,
        efficiency: parseFloat(item.efficiency) || 0,
        completionRate: parseFloat(item.efficiency) || 0 // Usando efficiency como completion rate
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Preparar dados para o radar chart
  const radarData = React.useMemo(() => {
    if (selectedPerson === 'all') {
      // Mostrar média de todos os entregadores
      if (deliveryPersonsStats.length === 0) return [];
      
      const avgStats = deliveryPersonsStats.reduce((acc, person) => ({
        onTimeRate: acc.onTimeRate + (person.onTimeRate || 0),
        efficiency: acc.efficiency + (person.efficiency || 0),
        customerRating: acc.customerRating + (person.customerRating || 0),
        completionRate: acc.completionRate + (person.completionRate || 0),
        deliverySpeed: acc.deliverySpeed + (person.avgDeliveryTime > 0 ? Math.max(0, 100 - person.avgDeliveryTime) : 50)
      }), { onTimeRate: 0, efficiency: 0, customerRating: 0, completionRate: 0, deliverySpeed: 0 });

      const count = deliveryPersonsStats.length;
      
      return [
        { metric: 'Pontualidade', value: Math.round(avgStats.onTimeRate / count), fullMark: 100 },
        { metric: 'Eficiência', value: Math.round(avgStats.efficiency / count), fullMark: 100 },
        { metric: 'Avaliação', value: Math.round((avgStats.customerRating / count) * 20), fullMark: 100 },
        { metric: 'Conclusão', value: Math.round(avgStats.completionRate / count), fullMark: 100 },
        { metric: 'Velocidade', value: Math.round(avgStats.deliverySpeed / count), fullMark: 100 }
      ];
    } else {
      // Mostrar dados de um entregador específico
      const person = deliveryPersonsStats.find(p => p.id === selectedPerson);
      if (!person) return [];
      
      return [
        { metric: 'Pontualidade', value: Math.round(person.onTimeRate || 0), fullMark: 100 },
        { metric: 'Eficiência', value: Math.round(person.efficiency || 0), fullMark: 100 },
        { metric: 'Avaliação', value: Math.round((person.customerRating || 0) * 20), fullMark: 100 },
        { metric: 'Conclusão', value: Math.round(person.completionRate || 0), fullMark: 100 },
        { metric: 'Velocidade', value: Math.round(Math.max(0, 100 - (person.avgDeliveryTime || 0))), fullMark: 100 }
      ];
    }
  }, [deliveryPersonsStats, selectedPerson]);

  // Obter estatísticas do entregador selecionado
  const selectedPersonStats = React.useMemo(() => {
    if (selectedPerson === 'all') {
      const totalDeliveries = deliveryPersonsStats.reduce((acc, p) => acc + (p.totalDeliveries || 0), 0);
      const avgOnTime = deliveryPersonsStats.length > 0 
        ? deliveryPersonsStats.reduce((acc, p) => acc + (p.onTimeRate || 0), 0) / deliveryPersonsStats.length 
        : 0;
      const avgRating = deliveryPersonsStats.length > 0
        ? deliveryPersonsStats.reduce((acc, p) => acc + (p.customerRating || 0), 0) / deliveryPersonsStats.length
        : 0;
      
      return {
        name: 'Média Geral',
        totalDeliveries,
        onTimeRate: avgOnTime,
        customerRating: avgRating,
        efficiency: deliveryPersonsStats.length > 0
          ? deliveryPersonsStats.reduce((acc, p) => acc + (p.efficiency || 0), 0) / deliveryPersonsStats.length
          : 0
      };
    }
    
    const person = deliveryPersonsStats.find(p => p.id === selectedPerson);
    if (!person) {
      return {
        name: 'Entregador não encontrado',
        totalDeliveries: 0,
        onTimeRate: 0,
        customerRating: 0,
        efficiency: 0
      };
    }
    
    return {
      name: person.name || 'Nome não disponível',
      totalDeliveries: person.totalDeliveries || 0,
      onTimeRate: person.onTimeRate || 0,
      customerRating: person.customerRating || 0,
      efficiency: person.efficiency || 0
    };
  }, [deliveryPersonsStats, selectedPerson]);

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBadgeColor = (value: number) => {
    if (value >= 80) return 'bg-green-600';
    if (value >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  if (isLoading) {
    return (
      <Card className={cn("bg-gray-800/30 border-gray-700/40 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Performance de Entregadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-gray-400">Carregando dados de performance...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deliveryPersonsStats.length === 0) {
    return (
      <Card className={cn("bg-gray-800/30 border-gray-700/40 backdrop-blur-sm", className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Performance de Entregadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 rounded-full bg-gray-700/30">
              <User className="h-12 w-12 text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Nenhum Entregador Ativo</h3>
              <p className="text-gray-400 text-sm">
                Dados de performance aparecerão quando entregadores forem atribuídos às entregas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-gray-800/30 border-gray-700/40 backdrop-blur-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            Performance de Entregadores
          </CardTitle>
          
          <Select value={selectedPerson} onValueChange={setSelectedPerson}>
            <SelectTrigger className="w-48 bg-black/40 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <SelectItem value="all" className="text-white hover:bg-white/10">
                Todos os Entregadores
              </SelectItem>
              {deliveryPersonsStats.map(person => (
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
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any) => [`${value}%`, 'Performance']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Estatísticas do Entregador */}
          <div className="space-y-4">
            {selectedPersonStats && (
              <>
                <div className="text-center pb-4 border-b border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {selectedPersonStats.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">
                      {selectedPersonStats.totalDeliveries} entregas
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Pontualidade</span>
                    </div>
                    <Badge className={cn("font-semibold", getPerformanceBadgeColor(selectedPersonStats.onTimeRate || 0))}>
                      {(selectedPersonStats.onTimeRate || 0).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">Avaliação</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-white font-semibold">
                        {(selectedPersonStats.customerRating || 0).toFixed(1)}
                      </span>
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Eficiência</span>
                    </div>
                    <span className={cn("font-semibold", getPerformanceColor(selectedPersonStats.efficiency || 0))}>
                      {(selectedPersonStats.efficiency || 0).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-600/30">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      {(selectedPersonStats.onTimeRate || 0) >= 80 ? (
                        <Badge className="bg-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Excelente
                        </Badge>
                      ) : (selectedPersonStats.onTimeRate || 0) >= 60 ? (
                        <Badge className="bg-yellow-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Bom
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Atenção
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryPersonPerformance;