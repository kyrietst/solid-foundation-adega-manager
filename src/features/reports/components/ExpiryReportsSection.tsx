/**
 * Seção de Relatórios de Vencimento
 * Sistema completo de controle de validade com alertas e estatísticas
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Input } from '@/shared/ui/primitives/input';
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Package, 
  DollarSign, 
  Search,
  FileSpreadsheet,
  RefreshCw,
  Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { EmptyState } from '@/shared/ui/composite/empty-state';

interface ExpiryAlert {
  batch_id: string;
  product_id: string;
  product_name: string;
  batch_code: string;
  expiry_date: string;
  days_until_expiry: number;
  affected_units: number;
  estimated_loss_value: number;
  alert_level: number;
  supplier_name: string;
  category: string;
}

interface ExpiryStats {
  total_batches_monitored: number;
  critical_7_days: number;
  warning_15_days: number;
  attention_30_days: number;
  total_units_at_risk: number;
  total_value_at_risk: number;
  expired_batches: number;
  expired_value: number;
}

export const ExpiryReportsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  // Query para alertas de vencimento
  const { data: expiryAlerts, isLoading: alertsLoading, refetch: refetchAlerts } = useQuery<ExpiryAlert[]>({
    queryKey: ['expiry-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expiry_alerts_30_days', { limit_count: 100 });
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Query para estatísticas
  const { data: expiryStats, isLoading: statsLoading } = useQuery<ExpiryStats[]>({
    queryKey: ['expiry-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_expiry_statistics');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const stats = expiryStats?.[0];

  // Filtros dos alertas
  const filteredAlerts = useMemo(() => {
    if (!expiryAlerts) return [];
    
    return expiryAlerts.filter(alert => {
      const matchesSearch = !searchTerm || 
        alert.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.batch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filterLevel === null || alert.alert_level === filterLevel;
      
      return matchesSearch && matchesLevel;
    });
  }, [expiryAlerts, searchTerm, filterLevel]);

  // Função para obter classe de badge baseada no nível de alerta
  const getAlertBadge = (level: number, days: number) => {
    switch (level) {
      case 3:
        return <Badge variant="destructive">Crítico - {days} dias</Badge>;
      case 2:
        return <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">Atenção - {days} dias</Badge>;
      case 1:
        return <Badge variant="outline" className="border-blue-500/30 text-blue-300">Monitorar - {days} dias</Badge>;
      default:
        return <Badge variant="outline">{days} dias</Badge>;
    }
  };

  // Função para exportar dados
  const handleExport = () => {
    if (!filteredAlerts || filteredAlerts.length === 0) return;
    
    const csvContent = [
      ['Produto', 'Lote', 'Vencimento', 'Dias até Vencimento', 'Unidades', 'Valor Estimado', 'Fornecedor', 'Categoria'],
      ...filteredAlerts.map(alert => [
        alert.product_name,
        alert.batch_code,
        new Date(alert.expiry_date).toLocaleDateString('pt-BR'),
        alert.days_until_expiry.toString(),
        alert.affected_units.toString(),
        `R$ ${alert.estimated_loss_value?.toFixed(2) || '0,00'}`,
        alert.supplier_name || '',
        alert.category || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alertas_vencimento_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (alertsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Lotes Críticos"
            value={stats.critical_7_days}
            subtitle="≤ 7 dias"
            icon={AlertTriangle}
            variant="error"
          />
          <StatCard
            title="Lotes em Atenção"
            value={stats.warning_15_days}
            subtitle="8-15 dias"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Lotes Monitorados"
            value={stats.attention_30_days}
            subtitle="16-30 dias"
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Valor em Risco"
            value={`R$ ${stats.total_value_at_risk?.toFixed(2) || '0,00'}`}
            subtitle={`${stats.total_units_at_risk || 0} unidades`}
            icon={DollarSign}
            variant="purple"
          />
        </div>
      )}

      {/* Controles e Filtros */}
      <Card className="bg-black/60 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Calendar className="h-5 w-5 text-primary-yellow" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por produto, lote ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-primary-yellow/30 text-gray-200"
                />
              </div>
            </div>

            {/* Filtro por Nível */}
            <div className="flex gap-2">
              <Button
                variant={filterLevel === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterLevel(null)}
                className="text-xs"
              >
                Todos
              </Button>
              <Button
                variant={filterLevel === 3 ? "destructive" : "outline"}
                size="sm"
                onClick={() => setFilterLevel(3)}
                className="text-xs"
              >
                Críticos
              </Button>
              <Button
                variant={filterLevel === 2 ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilterLevel(2)}
                className="text-xs"
              >
                Atenção
              </Button>
              <Button
                variant={filterLevel === 1 ? "outline" : "outline"}
                size="sm"
                onClick={() => setFilterLevel(1)}
                className="text-xs"
              >
                Monitorar
              </Button>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAlerts()}
                className="border-primary-yellow/30 text-primary-yellow hover:bg-primary-yellow/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!filteredAlerts || filteredAlerts.length === 0}
                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredAlerts && filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.batch_id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-primary-yellow/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-100">{alert.product_name}</h4>
                      {getAlertBadge(alert.alert_level, alert.days_until_expiry)}
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Lote: <span className="text-gray-300 font-mono">{alert.batch_code}</span></p>
                      <p>Vencimento: <span className="text-gray-300">{new Date(alert.expiry_date).toLocaleDateString('pt-BR')}</span></p>
                      {alert.supplier_name && (
                        <p>Fornecedor: <span className="text-gray-300">{alert.supplier_name}</span></p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-100">
                      {alert.affected_units} un.
                    </div>
                    <div className="text-sm text-gray-400">
                      R$ {alert.estimated_loss_value?.toFixed(2) || '0,00'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="Nenhum alerta encontrado"
                description="Não há produtos com vencimento próximo ou que atendam aos filtros aplicados."
                icon={Calendar}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};