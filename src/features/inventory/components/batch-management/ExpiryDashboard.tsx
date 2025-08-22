/**
 * Dashboard de Controle de Validade
 * Visão geral de alertas e estatísticas de vencimento
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Bell,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { EmptyState } from '@/shared/ui/composite/empty-state';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useExpiryStats, useExpiryAlerts, useMonitorAlerts } from '@/features/inventory/hooks/useBatches';
import type { ExpiryAlert } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';
import { formatCurrency } from '@/core/config/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ExpiryDashboard: React.FC = () => {
  // Estados locais
  const [alertFilters, setAlertFilters] = useState({
    status: 'active',
    priority: ''
  });

  // Queries
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useExpiryStats();
  
  const { 
    data: alerts = [], 
    isLoading: alertsLoading, 
    error: alertsError 
  } = useExpiryAlerts({
    status: alertFilters.status || undefined,
    priority: alertFilters.priority ? parseInt(alertFilters.priority) : undefined
  });

  const monitorMutation = useMonitorAlerts();

  // Paginação para alertas
  const {
    currentPage,
    itemsPerPage,
    paginatedItems: paginatedAlerts,
    totalPages,
    goToPage,
    setItemsPerPage
  } = usePagination(alerts, { initialItemsPerPage: 10 });

  // Handler para executar monitoramento
  const handleMonitorAlerts = () => {
    monitorMutation.mutate();
  };

  // Função para obter informações visuais do alerta
  const getAlertInfo = (alert: ExpiryAlert) => {
    switch (alert.alert_type) {
      case 'expired':
        return {
          icon: XCircle,
          className: 'text-accent-red bg-accent-red/10 border-accent-red/30',
          priority: 'CRÍTICO'
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          className: 'text-accent-red bg-accent-red/10 border-accent-red/30',
          priority: 'CRÍTICO'
        };
      case 'urgent':
        return {
          icon: Clock,
          className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
          priority: 'URGENTE'
        };
      case 'warning':
        return {
          icon: Bell,
          className: 'text-accent-blue bg-accent-blue/10 border-accent-blue/30',
          priority: 'ATENÇÃO'
        };
      default:
        return {
          icon: Bell,
          className: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
          priority: 'INFO'
        };
    }
  };

  const valueClasses = getValueClasses('md', 'gold');

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" variant="gold" />
      </div>
    );
  }

  if (statsError) {
    return (
      <Alert className="border-accent-red/50 bg-accent-red/10">
        <AlertTriangle className="h-4 w-4 text-accent-red" />
        <AlertDescription className="text-accent-red">
          Erro ao carregar dashboard: {statsError.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Dashboard de Validade</h1>
          <p className="text-gray-400 mt-1">
            Controle de prazos de validade e sistema FEFO
          </p>
        </div>
        <Button
          onClick={handleMonitorAlerts}
          disabled={monitorMutation.isPending}
          className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90"
        >
          {monitorMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" variant="dark" className="mr-2" />
              Verificando...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Verificar Alertas
            </>
          )}
        </Button>
      </div>

      {/* Estatísticas Principais */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Lotes Ativos"
            value={stats.total_active_batches.toString()}
            icon={Package}
            variant="default"
          />
          
          <StatCard
            title="Vencendo Esta Semana"
            value={stats.expiring_week.toString()}
            icon={Clock}
            variant="warning"
            subtitle={`${stats.expiring_today} hoje`}
          />
          
          <StatCard
            title="Alertas Críticos"
            value={stats.critical_alerts.toString()}
            icon={AlertTriangle}
            variant="error"
            subtitle={`${stats.active_alerts} total`}
          />
          
          <StatCard
            title="Valor em Risco"
            value={formatCurrency(stats.total_expired_value)}
            icon={DollarSign}
            variant="purple"
            subtitle="Produtos vencidos"
          />
        </div>
      )}

      {/* Resumo Rápido */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/30 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-500 text-sm font-medium">Vencendo Hoje</p>
                  <p className="text-yellow-500 text-2xl font-bold">{stats.expiring_today}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Requer ação imediata
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/30 border-accent-red/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-red text-sm font-medium">Lotes Vencidos</p>
                  <p className="text-accent-red text-2xl font-bold">{stats.expired_batches}</p>
                </div>
                <XCircle className="h-8 w-8 text-accent-red" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Remover do estoque
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/30 border-accent-green/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-accent-green text-sm font-medium">Produtos Rastreados</p>
                  <p className="text-accent-green text-2xl font-bold">{stats.products_with_batches}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-accent-green" />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Com controle de validade
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Vencimento */}
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-yellow" />
              Alertas de Vencimento
            </div>
            <div className="flex gap-2">
              <Select 
                value={alertFilters.status} 
                onValueChange={(value) => setAlertFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-40 bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-primary-yellow/30">
                  <SelectItem value="active" className="text-gray-200">Ativos</SelectItem>
                  <SelectItem value="acknowledged" className="text-gray-200">Reconhecidos</SelectItem>
                  <SelectItem value="resolved" className="text-gray-200">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={alertFilters.priority} 
                onValueChange={(value) => setAlertFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-40 bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-primary-yellow/30">
                  <SelectItem value="" className="text-gray-200">Todas</SelectItem>
                  <SelectItem value="4" className="text-gray-200">Crítica (4+)</SelectItem>
                  <SelectItem value="3" className="text-gray-200">Alta (3+)</SelectItem>
                  <SelectItem value="2" className="text-gray-200">Média (2+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner size="md" variant="gold" />
            </div>
          ) : alertsError ? (
            <Alert className="border-accent-red/50 bg-accent-red/10">
              <AlertTriangle className="h-4 w-4 text-accent-red" />
              <AlertDescription className="text-accent-red">
                Erro ao carregar alertas: {alertsError.message}
              </AlertDescription>
            </Alert>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] py-12 px-8">
              <div className="max-w-sm w-full text-center space-y-6">
                {/* Ícone principal */}
                <div className="mx-auto w-20 h-20 bg-green-800/50 rounded-full flex items-center justify-center border-2 border-green-600/30 backdrop-blur-sm">
                  <CheckCircle2 className="h-10 w-10 text-green-400" />
                </div>
                
                {/* Conteúdo */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Nenhum alerta encontrado</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Não há alertas de vencimento com os filtros aplicados
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Lista de Alertas */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Produto</TableHead>
                      <TableHead className="text-gray-300">Lote</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Vencimento</TableHead>
                      <TableHead className="text-gray-300">Unidades</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAlerts.map((alert) => {
                      const alertInfo = getAlertInfo(alert);
                      const AlertIcon = alertInfo.icon;
                      
                      return (
                        <TableRow key={alert.id} className="border-gray-700 hover:bg-gray-800/30">
                          <TableCell>
                            <div>
                              <p className="text-gray-200 font-medium">{alert.product_name}</p>
                              <p className="text-xs text-gray-400">{alert.product_category}</p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <p className="text-gray-200">{alert.product_batches?.batch_code}</p>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AlertIcon className="h-4 w-4" />
                              <Badge className={alertInfo.className}>
                                {alertInfo.priority}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              <p className="text-gray-200">
                                {format(new Date(alert.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                              <p className={cn(
                                "text-xs",
                                alert.days_until_expiry < 0 ? "text-accent-red" :
                                alert.days_until_expiry <= 3 ? "text-yellow-500" : "text-gray-400"
                              )}>
                                {alert.days_until_expiry < 0 
                                  ? `Vencido há ${Math.abs(alert.days_until_expiry)} dias`
                                  : alert.days_until_expiry === 0 
                                  ? 'Vence hoje'
                                  : `${alert.days_until_expiry} dias`
                                }
                              </p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <p className={cn(valueClasses)}>{alert.affected_units}</p>
                          </TableCell>
                          
                          <TableCell>
                            <p className={cn(valueClasses)}>
                              {formatCurrency(alert.estimated_loss_value)}
                            </p>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-2">
                              {alert.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Reconhecer
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  itemsPerPageOptions={[5, 10, 20]}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};