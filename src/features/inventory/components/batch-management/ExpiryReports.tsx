/**
 * Relatórios Detalhados de Validade
 * Análises avançadas de perdas, tendências e performance FEFO
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  TrendingDown, 
  Calendar, 
  Package,
  AlertTriangle,
  BarChart3,
  Download,
  Filter,
  DateRange
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Badge } from '@/shared/ui/primitives/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/primitives/table';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { EmptyState } from '@/shared/ui/composite/empty-state';
import { usePagination } from '@/shared/hooks/common/use-pagination';
import { useBatches, useExpiryAlerts } from '@/features/inventory/hooks/useBatches';
import type { ProductBatch, ExpiryAlert } from '@/core/types/inventory.types';
import { cn } from '@/core/config/utils';
import { getValueClasses } from '@/core/config/theme-utils';
import { formatCurrency } from '@/core/config/utils';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ExpiryReports: React.FC = () => {
  // Estados para filtros de relatório
  const [reportFilters, setReportFilters] = useState({
    dateRange: 'month', // week, month, quarter, custom
    startDate: '',
    endDate: '',
    category: '',
    supplier: '',
    reportType: 'overview' // overview, losses, trends, supplier_analysis
  });

  // Queries
  const { 
    data: batches = [], 
    isLoading: batchesLoading 
  } = useBatches({});
  
  const { 
    data: alerts = [], 
    isLoading: alertsLoading 
  } = useExpiryAlerts({});

  // Calcular dados do relatório
  const reportData = useMemo(() => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    // Definir período baseado no filtro
    switch (reportFilters.dateRange) {
      case 'week':
        startDate = subDays(today, 7);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'quarter':
        startDate = subDays(today, 90);
        break;
      case 'custom':
        startDate = reportFilters.startDate ? new Date(reportFilters.startDate) : subDays(today, 30);
        endDate = reportFilters.endDate ? new Date(reportFilters.endDate) : today;
        break;
      default:
        startDate = subDays(today, 30);
    }

    // Filtrar batches por período
    const periodBatches = batches.filter(batch => {
      const batchDate = new Date(batch.created_at);
      return batchDate >= startDate && batchDate <= endDate;
    });

    // Filtrar por categoria se especificado
    const filteredBatches = reportFilters.category 
      ? periodBatches.filter(batch => batch.product_category === reportFilters.category)
      : periodBatches;

    // Filtrar por fornecedor se especificado
    const finalBatches = reportFilters.supplier
      ? filteredBatches.filter(batch => 
          batch.supplier_name?.toLowerCase().includes(reportFilters.supplier.toLowerCase())
        )
      : filteredBatches;

    // Calcular estatísticas
    const totalBatches = finalBatches.length;
    const expiredBatches = finalBatches.filter(b => b.is_expired).length;
    const expiringBatches = finalBatches.filter(b => b.is_expiring_soon).length;
    const activeBatches = finalBatches.filter(b => b.status === 'active').length;

    const totalValue = finalBatches.reduce((sum, b) => 
      sum + (b.total_cost || 0), 0
    );
    
    const expiredValue = finalBatches
      .filter(b => b.is_expired)
      .reduce((sum, b) => sum + (b.available_units * (b.cost_per_unit || 0)), 0);

    const averageShelfLife = finalBatches.length > 0 
      ? finalBatches.reduce((sum, b) => {
          const manufDate = new Date(b.manufacturing_date);
          const expiryDate = new Date(b.expiry_date);
          const shelfDays = Math.ceil((expiryDate.getTime() - manufDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + shelfDays;
        }, 0) / finalBatches.length
      : 0;

    // Análise por fornecedor
    const supplierAnalysis = finalBatches.reduce((acc, batch) => {
      const supplier = batch.supplier_name || 'Sem fornecedor';
      if (!acc[supplier]) {
        acc[supplier] = {
          name: supplier,
          batches: 0,
          expired: 0,
          total_value: 0,
          expired_value: 0,
          average_shelf_life: 0
        };
      }
      
      acc[supplier].batches += 1;
      acc[supplier].total_value += batch.total_cost || 0;
      
      if (batch.is_expired) {
        acc[supplier].expired += 1;
        acc[supplier].expired_value += batch.available_units * (batch.cost_per_unit || 0);
      }

      const manufDate = new Date(batch.manufacturing_date);
      const expiryDate = new Date(batch.expiry_date);
      const shelfDays = Math.ceil((expiryDate.getTime() - manufDate.getTime()) / (1000 * 60 * 60 * 24));
      acc[supplier].average_shelf_life = 
        (acc[supplier].average_shelf_life * (acc[supplier].batches - 1) + shelfDays) / acc[supplier].batches;

      return acc;
    }, {} as Record<string, any>);

    return {
      period: { startDate, endDate },
      batches: finalBatches,
      stats: {
        totalBatches,
        expiredBatches,
        expiringBatches,
        activeBatches,
        totalValue,
        expiredValue,
        lossPercentage: totalValue > 0 ? (expiredValue / totalValue) * 100 : 0,
        averageShelfLife
      },
      supplierAnalysis: Object.values(supplierAnalysis)
    };
  }, [batches, reportFilters]);

  // Paginação
  const {
    currentPage,
    itemsPerPage,
    paginatedItems: paginatedBatches,
    totalPages,
    goToPage,
    setItemsPerPage
  } = usePagination(reportData.batches, { initialItemsPerPage: 15 });

  // Handler para mudança de filtros
  const handleFilterChange = (field: string, value: any) => {
    setReportFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handler para exportar relatório
  const handleExportReport = () => {
    // TODO: Implementar exportação para Excel/PDF
    console.log('Exportar relatório:', reportData);
  };

  const valueClasses = getValueClasses('sm', 'gold');

  if (batchesLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" variant="gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header e Filtros */}
      <Card className="bg-gray-800/50 border-primary-yellow/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-yellow" />
              Relatórios de Validade
            </div>
            <Button
              onClick={handleExportReport}
              className="bg-primary-yellow text-gray-900 hover:bg-primary-yellow/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Período */}
            <div>
              <Label className="text-gray-200">Período</Label>
              <Select 
                value={reportFilters.dateRange} 
                onValueChange={(value) => handleFilterChange('dateRange', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-primary-yellow/30">
                  <SelectItem value="week" className="text-gray-200">Última Semana</SelectItem>
                  <SelectItem value="month" className="text-gray-200">Este Mês</SelectItem>
                  <SelectItem value="quarter" className="text-gray-200">Último Trimestre</SelectItem>
                  <SelectItem value="custom" className="text-gray-200">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Datas customizadas */}
            {reportFilters.dateRange === 'custom' && (
              <>
                <div>
                  <Label className="text-gray-200">Data Inicial</Label>
                  <Input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="bg-gray-800/50 border-primary-yellow/30 text-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Data Final</Label>
                  <Input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="bg-gray-800/50 border-primary-yellow/30 text-gray-200"
                  />
                </div>
              </>
            )}

            {/* Tipo de Relatório */}
            <div>
              <Label className="text-gray-200">Tipo de Relatório</Label>
              <Select 
                value={reportFilters.reportType} 
                onValueChange={(value) => handleFilterChange('reportType', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-primary-yellow/30 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-primary-yellow/30">
                  <SelectItem value="overview" className="text-gray-200">Visão Geral</SelectItem>
                  <SelectItem value="losses" className="text-gray-200">Análise de Perdas</SelectItem>
                  <SelectItem value="trends" className="text-gray-200">Tendências</SelectItem>
                  <SelectItem value="supplier_analysis" className="text-gray-200">Por Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lotes no Período"
          value={reportData.stats.totalBatches.toString()}
          icon={Package}
          variant="default"
        />
        
        <StatCard
          title="Taxa de Perdas"
          value={`${reportData.stats.lossPercentage.toFixed(1)}%`}
          icon={TrendingDown}
          variant={reportData.stats.lossPercentage > 10 ? "error" : "warning"}
          subtitle={formatCurrency(reportData.stats.expiredValue)}
        />
        
        <StatCard
          title="Vida Útil Média"
          value={`${Math.round(reportData.stats.averageShelfLife)} dias`}
          icon={Calendar}
          variant="purple"
        />
        
        <StatCard
          title="Valor Total"
          value={formatCurrency(reportData.stats.totalValue)}
          icon={BarChart3}
          variant="success"
        />
      </div>

      {/* Relatório por Tipo */}
      {reportFilters.reportType === 'supplier_analysis' ? (
        
        /* Análise por Fornecedor */
        <Card className="bg-gray-800/50 border-primary-yellow/30">
          <CardHeader>
            <CardTitle className="text-gray-100">Análise por Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Fornecedor</TableHead>
                    <TableHead className="text-gray-300">Lotes</TableHead>
                    <TableHead className="text-gray-300">Vencidos</TableHead>
                    <TableHead className="text-gray-300">Taxa Perda</TableHead>
                    <TableHead className="text-gray-300">Valor Total</TableHead>
                    <TableHead className="text-gray-300">Perdas R$</TableHead>
                    <TableHead className="text-gray-300">Vida Útil Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.supplierAnalysis.map((supplier: any, index: number) => {
                    const lossRate = supplier.batches > 0 ? (supplier.expired / supplier.batches) * 100 : 0;
                    
                    return (
                      <TableRow key={index} className="border-gray-700 hover:bg-gray-800/30">
                        <TableCell>
                          <p className="text-gray-200 font-medium">{supplier.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className={cn(valueClasses)}>{supplier.batches}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-accent-red">{supplier.expired}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            lossRate > 20 ? "bg-accent-red/20 text-accent-red border-accent-red/50" :
                            lossRate > 10 ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" :
                            "bg-accent-green/20 text-accent-green border-accent-green/50"
                          )}>
                            {lossRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className={cn(valueClasses)}>
                            {formatCurrency(supplier.total_value)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-accent-red">
                            {formatCurrency(supplier.expired_value)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className={cn(valueClasses)}>
                            {Math.round(supplier.average_shelf_life)} dias
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
      ) : (
        
        /* Relatório Detalhado de Lotes */
        <Card className="bg-gray-800/50 border-primary-yellow/30">
          <CardHeader>
            <CardTitle className="text-gray-100">
              {reportFilters.reportType === 'losses' ? 'Análise de Perdas' :
               reportFilters.reportType === 'trends' ? 'Tendências de Vencimento' :
               'Lotes Detalhados'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportData.batches.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] py-12 px-8">
                <div className="max-w-sm w-full text-center space-y-6">
                  {/* Ícone principal */}
                  <div className="mx-auto w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-600/30 backdrop-blur-sm">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Nenhum lote encontrado</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Não há lotes no período selecionado
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Tabela de Lotes */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Lote</TableHead>
                        <TableHead className="text-gray-300">Produto</TableHead>
                        <TableHead className="text-gray-300">Fornecedor</TableHead>
                        <TableHead className="text-gray-300">Fabricação</TableHead>
                        <TableHead className="text-gray-300">Validade</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Unidades</TableHead>
                        <TableHead className="text-gray-300">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBatches.map((batch) => (
                        <TableRow key={batch.id} className="border-gray-700 hover:bg-gray-800/30">
                          <TableCell>
                            <p className="text-gray-200 font-medium">{batch.batch_code}</p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-gray-200">{batch.product_name}</p>
                              <p className="text-xs text-gray-400">{batch.product_category}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-gray-200">{batch.supplier_name || '-'}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-gray-200">
                              {format(new Date(batch.manufacturing_date), 'dd/MM/yyyy', { locale: ptBR })}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-gray-200">
                                {format(new Date(batch.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </p>
                              <p className={cn(
                                "text-xs",
                                batch.is_expired ? "text-accent-red" :
                                batch.is_expiring_soon ? "text-yellow-500" : "text-gray-400"
                              )}>
                                {batch.is_expired ? 'Vencido' :
                                 batch.is_expiring_soon ? 'Vencendo' : 'Ativo'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              batch.status === 'expired' ? "bg-accent-red/20 text-accent-red" :
                              batch.status === 'sold_out' ? "bg-gray-500/20 text-gray-400" :
                              "bg-accent-green/20 text-accent-green"
                            )}>
                              {batch.status === 'expired' ? 'Vencido' :
                               batch.status === 'sold_out' ? 'Esgotado' : 'Ativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <p className={cn(valueClasses)}>
                              {batch.available_units}/{batch.total_units}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className={cn(valueClasses)}>
                              {formatCurrency(batch.total_cost || 0)}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
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
                    itemsPerPageOptions={[10, 15, 25, 50]}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};