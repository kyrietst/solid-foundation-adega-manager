/**
 * Dashboard de Qualidade de Dados
 * Visão geral da completude e qualidade dos dados de clientes
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Progress } from '@/shared/ui/primitives/progress';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Users,
  Target,
  PieChart,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { 
  useDataQualityMetrics,
  useCompletenessStats,
  useDataQualityAlerts,
  useQualityTrend
} from '../hooks/useDataQuality';
import type { CustomerData } from '../utils/completeness-calculator';

interface DataQualityDashboardProps {
  customers: CustomerData[];
  onViewDetails?: () => void;
  onFixIssues?: (fieldKey: string) => void;
  className?: string;
}

const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  customers,
  onViewDetails,
  onFixIssues,
  className
}) => {
  const metrics = useDataQualityMetrics(customers);
  const stats = useCompletenessStats(customers);
  const alerts = useDataQualityAlerts(customers);
  const trend = useQualityTrend(customers);

  if (customers.length === 0) {
    return (
      <Card className={cn("bg-black/50 backdrop-blur-sm border-white/10", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <Users className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-gray-400">Nenhum cliente encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completude Média"
          value={`${metrics.averageCompleteness}%`}
          icon={BarChart3}
          variant={metrics.averageCompleteness >= 70 ? 'success' : metrics.averageCompleteness >= 50 ? 'warning' : 'error'}
          trend={trend.trend > 0 ? { direction: 'up', value: trend.improvement } : trend.trend < 0 ? { direction: 'down', value: trend.improvement } : undefined}
        />
        
        <StatCard
          title="Perfis Completos"
          value={metrics.completeProfiles.toString()}
          subtitle={`${Math.round((metrics.completeProfiles / metrics.totalCustomers) * 100)}% do total`}
          icon={CheckCircle2}
          variant="success"
        />
        
        <StatCard
          title="Precisam de Atenção"
          value={metrics.poorQualityProfiles.toString()}
          subtitle={`${Math.round((metrics.poorQualityProfiles / metrics.totalCustomers) * 100)}% com baixa qualidade`}
          icon={AlertTriangle}
          variant="error"
        />
        
        <StatCard
          title="Oportunidades"
          value={stats.improvementOpportunities.length.toString()}
          subtitle="Campos para melhorar"
          icon={Target}
          variant="purple"
        />
      </div>

      {/* Alertas Críticos */}
      {alerts.length > 0 && (
        <Card className="bg-black/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Alertas de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg border",
                  alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-medium text-sm",
                      alert.type === 'critical' ? 'text-red-400' :
                      alert.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    )}>
                      {alert.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                    {alert.action && (
                      <p className="text-xs text-gray-300 mt-2">
                        💡 <strong>Ação:</strong> {alert.action}
                      </p>
                    )}
                  </div>
                  {alert.count && (
                    <Badge variant="outline" className="ml-2">
                      {alert.count}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Qualidade */}
        <Card className="bg-black/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PieChart className="h-5 w-5 text-purple-400" />
              Distribuição de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.completenessDistribution.map((range, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    {range.label} ({range.range})
                  </span>
                  <span className="text-sm font-medium text-white">
                    {range.count} clientes
                  </span>
                </div>
                <Progress
                  value={(range.count / stats.totalCustomers) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{Math.round((range.count / stats.totalCustomers) * 100)}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Campos Ausentes */}
        <Card className="bg-black/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-orange-400" />
              Principais Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.improvementOpportunities.slice(0, 5).map((opportunity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    {opportunity.fieldKey.charAt(0).toUpperCase() + opportunity.fieldKey.slice(1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {opportunity.percentage}% ausente
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFixIssues?.(opportunity.fieldKey)}
                      className="text-xs h-6 px-2 text-blue-400 hover:text-blue-300"
                    >
                      Corrigir
                    </Button>
                  </div>
                </div>
                <Progress
                  value={opportunity.percentage}
                  className="h-1.5"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tendência de Qualidade */}
      {trend.trendDirection !== 'stable' && (
        <Card className="bg-black/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              {trend.trendDirection === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
              Tendência de Qualidade ({trend.period})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-gray-300">
                  A qualidade dos dados está{' '}
                  <span className={cn(
                    "font-medium",
                    trend.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {trend.trendDirection === 'up' ? 'melhorando' : 'piorando'}
                  </span>
                </p>
                <p className="text-xs text-gray-400">
                  Variação de {trend.improvement} em relação ao período anterior
                </p>
              </div>
              <div className={cn(
                "text-2xl font-bold",
                trend.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'
              )}>
                {trend.improvement}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      {stats.topIncompleteCustomers.length > 0 && (
        <Card className="bg-black/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-400" />
                Ações Recomendadas
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewDetails}
                className="text-xs"
              >
                Ver Detalhes
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <h4 className="text-sm font-medium text-yellow-400">Prioridade Alta</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.topIncompleteCustomers.filter(c => c.priority === 'high').length} clientes com campos críticos ausentes
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <h4 className="text-sm font-medium text-blue-400">Oportunidade</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Completar {stats.improvementOpportunities[0]?.fieldKey || 'campos'} pode impactar {stats.improvementOpportunities[0]?.missingCount || 0} perfis
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataQualityDashboard;