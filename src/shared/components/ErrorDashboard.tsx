/**
 * Dashboard interno para monitoramento de erros
 * Visualiza estatísticas e tendências de erros da aplicação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/primitives/alert';
import { Progress } from '@/shared/ui/primitives/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useErrorTracking } from '@/lib/error-tracking';
import type { ErrorAggregation } from '@/lib/error-tracking';

interface ErrorDashboardProps {
  className?: string;
}

export const ErrorDashboard: React.FC<ErrorDashboardProps> = ({ className }) => {
  const { getAggregation, resolveError } = useErrorTracking();
  const [aggregation, setAggregation] = useState<ErrorAggregation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  const loadAggregation = async () => {
    setIsLoading(true);
    try {
      const data = await getAggregation(selectedPeriod);
      setAggregation(data);
    } catch (error) {
      console.error('Error loading aggregation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAggregation();
  }, [selectedPeriod]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript': return '🐛';
      case 'network': return '🌐';
      case 'auth': return '🔒';
      case 'business': return '💼';
      case 'validation': return '✅';
      case 'system': return '⚙️';
      default: return '❓';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Carregando dashboard de erros...
      </div>
    );
  }

  if (!aggregation) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados de erro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Erros</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitoramento de erros dos últimos {selectedPeriod} dias
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            <option value={1}>1 dia</option>
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadAggregation}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregation.total}</div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4 mr-1" />
              Últimos {selectedPeriod} dias
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Erros Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {aggregation.bySeverity.critical || 0}
            </div>
            <div className="flex items-center mt-1 text-sm text-red-500">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Requer atenção imediata
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários Afetados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(aggregation.byUser).length}
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              Usuários únicos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {aggregation.total === 0 ? '100' : 
                Math.max(0, 100 - (aggregation.bySeverity.critical || 0) * 10).toFixed(0)
              }%
            </div>
            <div className="flex items-center mt-1 text-sm text-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              Sistema saudável
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Severidade */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Severidade</CardTitle>
          <CardDescription>
            Breakdown dos erros por nível de severidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(['critical', 'high', 'medium', 'low'] as const).map(severity => {
              const count = aggregation.bySeverity[severity] || 0;
              const percentage = aggregation.total > 0 ? (count / aggregation.total) * 100 : 0;
              
              return (
                <div key={severity} className="flex items-center space-x-4">
                  <div className="w-20 text-sm font-medium capitalize">{severity}</div>
                  <div className="flex-1">
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${getSeverityColor(severity)}`}
                    />
                  </div>
                  <div className="w-12 text-sm text-right">{count}</div>
                  <div className="w-12 text-xs text-gray-500 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Erros por Categoria</CardTitle>
            <CardDescription>Tipos de erro mais comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(aggregation.byCategory)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="capitalize">{category}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Componentes com Mais Erros</CardTitle>
            <CardDescription>Áreas que precisam de atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(aggregation.byComponent)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([component, count]) => (
                  <div key={component} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {component}
                      </span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Recomendações */}
      {aggregation.bySeverity.critical > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ação Requerida</AlertTitle>
          <AlertDescription>
            Há {aggregation.bySeverity.critical} erro(s) crítico(s) que requerem atenção imediata.
            Verifique os logs detalhados e corrija os problemas.
          </AlertDescription>
        </Alert>
      )}

      {aggregation.total === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sistema Saudável</AlertTitle>
          <AlertDescription>
            Nenhum erro reportado nos últimos {selectedPeriod} dias. 
            O sistema está funcionando perfeitamente! 🎉
          </AlertDescription>
        </Alert>
      )}

      {/* Footer com informações técnicas */}
      <div className="text-xs text-gray-500 border-t pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <strong>Período:</strong> {selectedPeriod} dias
          </div>
          <div>
            <strong>Última atualização:</strong> {new Date().toLocaleTimeString()}
          </div>
          <div>
            <strong>Usuários únicos:</strong> {Object.keys(aggregation.byUser).length}
          </div>
          <div>
            <strong>Categorias:</strong> {Object.keys(aggregation.byCategory).length}
          </div>
        </div>
      </div>
    </div>
  );
};