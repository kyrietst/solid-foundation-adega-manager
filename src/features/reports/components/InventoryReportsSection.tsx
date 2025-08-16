/**
 * Inventory Reports Section - Sprint 2
 * Advanced inventory analysis with DOH, turnover, and dead stock
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Package, TrendingDown, AlertTriangle, BarChart3, Download } from 'lucide-react';
import { StandardReportsTable, TableColumn } from './StandardReportsTable';

interface InventoryKpi {
  product_id: string;
  name: string;
  category: string;
  stock: number;
  avg_daily_sales: number;
  doh: number | null;
  turnover: number | null;
  is_critical: boolean;
  is_dead_stock: boolean;
}

interface InventoryReportsSectionProps {
  period?: number;
}

export const InventoryReportsSection: React.FC<InventoryReportsSectionProps> = ({ period = 60 }) => {
  const windowDays = period;

  // Inventory KPIs Query
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory-kpis', windowDays],
    queryFn: async (): Promise<InventoryKpi[]> => {
      const { data, error } = await supabase
        .rpc('get_inventory_kpis', { window_days: windowDays });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Inventory Movements Query
  const { data: movements, isLoading: loadingMovements } = useQuery({
    queryKey: ['inventory-movements', windowDays],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - windowDays);

      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          id,
          date,
          type,
          quantity,
          reason,
          products!inner(name, category),
          users!inner(full_name)
        `)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2);
  };

  const getDohStatus = (doh: number | null) => {
    if (!doh) return 'text-gray-400';
    if (doh < 30) return 'text-green-400'; // Fast moving
    if (doh < 90) return 'text-yellow-400'; // Medium
    return 'text-red-400'; // Slow moving
  };

  const getTurnoverStatus = (turnover: number | null) => {
    if (!turnover) return 'text-gray-400';
    if (turnover > 0.5) return 'text-green-400'; // High turnover
    if (turnover > 0.2) return 'text-yellow-400'; // Medium
    return 'text-red-400'; // Low turnover
  };

  const inventoryColumns: TableColumn[] = [
    {
      key: 'name',
      label: 'Produto',
      width: 'w-[200px]',
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          <div className="text-sm text-gray-400">{row.category}</div>
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Estoque',
      width: 'w-[100px]',
      render: (value, row) => {
        const isCritical = row.is_critical;
        return (
          <div className={`font-medium ${isCritical ? 'text-red-400' : 'text-white'}`}>
            {value}
            {isCritical && <AlertTriangle className="h-3 w-3 inline ml-1" />}
          </div>
        );
      },
    },
    {
      key: 'avg_daily_sales',
      label: 'Vendas/Dia',
      width: 'w-[120px]',
      render: (value) => (
        <span className="text-blue-400">
          {formatNumber(value)}
        </span>
      ),
    },
    {
      key: 'doh',
      label: 'DOH (dias)',
      width: 'w-[120px]',
      render: (value) => (
        <span className={getDohStatus(value)}>
          {value ? Math.round(value) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'turnover',
      label: 'Giro',
      width: 'w-[100px]',
      render: (value) => (
        <span className={getTurnoverStatus(value)}>
          {formatNumber(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-[120px]',
      sortable: false,
      render: (_, row) => {
        const isCritical = row.is_critical;
        const isDeadStock = row.is_dead_stock;
        
        if (isDeadStock) {
          return <span className="text-red-400 text-xs font-medium">DEAD STOCK</span>;
        }
        if (isCritical) {
          return <span className="text-yellow-400 text-xs font-medium">CRÍTICO</span>;
        }
        return <span className="text-green-400 text-xs font-medium">OK</span>;
      },
    },
  ];

  const movementColumns: TableColumn[] = [
    {
      key: 'date',
      label: 'Data',
      width: 'w-[120px]',
      render: (value) => (
        <span className="text-white">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      width: 'w-[100px]',
      render: (value) => {
        const colors = {
          'in': 'text-green-400',
          'out': 'text-red-400',
          'fiado': 'text-yellow-400',
          'devolucao': 'text-blue-400'
        };
        return (
          <span className={colors[value as keyof typeof colors] || 'text-white'}>
            {value.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'products',
      label: 'Produto',
      width: 'w-[200px]',
      render: (value) => (
        <div>
          <div className="font-medium text-white">{value?.name}</div>
          <div className="text-sm text-gray-400">{value?.category}</div>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantidade',
      width: 'w-[100px]',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'reason',
      label: 'Motivo',
      width: 'w-[150px]',
      render: (value) => (
        <span className="text-gray-400 text-sm">{value || 'N/A'}</span>
      ),
    },
    {
      key: 'users',
      label: 'Usuário',
      width: 'w-[120px]',
      render: (value) => (
        <span className="text-blue-400">{value?.full_name}</span>
      ),
    },
  ];

  // Summary calculations
  const summary = {
    total_products: inventoryData?.length || 0,
    critical_stock: inventoryData?.filter(item => item.is_critical).length || 0,
    dead_stock: inventoryData?.filter(item => item.is_dead_stock).length || 0,
    fast_moving: inventoryData?.filter(item => item.doh && item.doh < 30).length || 0,
    medium_moving: inventoryData?.filter(item => item.doh && item.doh >= 30 && item.doh < 90).length || 0,
    slow_moving: inventoryData?.filter(item => item.doh && item.doh >= 90).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards com glassmorphism padronizado */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="h-6 w-6 text-blue-400 mx-auto mb-2 transition-all duration-300" />
              <div className="text-2xl font-bold text-white">
                {isLoading ? <LoadingSpinner size="sm" color="yellow" /> : summary.total_products}
              </div>
              <p className="text-xs text-gray-400">Total Produtos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-400/30 hover:bg-gray-700/40">
          <CardContent className="p-4">
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2 transition-all duration-300" />
              <div className="text-2xl font-bold text-red-400">
                {isLoading ? <LoadingSpinner size="sm" color="yellow" /> : summary.critical_stock}
              </div>
              <p className="text-xs text-gray-400">Crítico</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/10 hover:border-gray-400/30 hover:bg-gray-700/40">
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingDown className="h-6 w-6 text-gray-400 mx-auto mb-2 transition-all duration-300" />
              <div className="text-2xl font-bold text-gray-400">
                {isLoading ? <LoadingSpinner size="sm" color="yellow" /> : summary.dead_stock}
              </div>
              <p className="text-xs text-gray-400">Dead Stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 hover:bg-gray-700/40">
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-green-400 mx-auto mb-2 transition-all duration-300" />
              <div className="text-2xl font-bold text-green-400">
                {isLoading ? <LoadingSpinner size="sm" color="yellow" /> : summary.fast_moving}
              </div>
              <p className="text-xs text-gray-400">Giro Rápido</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 hover:border-yellow-400/30 hover:bg-gray-700/40">
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-yellow-400 mx-auto mb-2 transition-all duration-300" />
              <div className="text-2xl font-bold text-yellow-400">
                {isLoading ? <LoadingSpinner size="sm" color="yellow" /> : summary.medium_moving}
              </div>
              <p className="text-xs text-gray-400">Giro Médio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-400/30 hover:bg-gray-700/40">
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-red-400 mx-auto mb-2 transition-all duration-300" />
              <div className="text-2xl font-bold text-red-400">
                {isLoading ? <LoadingSpinner size="sm" color="yellow" /> : summary.slow_moving}
              </div>
              <p className="text-xs text-gray-400">Giro Lento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Analysis Table */}
      <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Análise de Estoque (DOH & Giro)</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" variant="blue" />
            </div>
          ) : (
            <StandardReportsTable
              data={inventoryData || []}
              columns={inventoryColumns}
              title="Análise de Estoque"
              searchFields={['name', 'category']}
              initialSortField="doh"
              initialSortDirection="asc"
              height="h-full"
              maxRows={50}
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 hover:bg-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          {loadingMovements ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" variant="blue" />
            </div>
          ) : (
            <StandardReportsTable
              data={movements || []}
              columns={movementColumns}
              title="Movimentações"
              searchFields={['reason']}
              initialSortField="date"
              initialSortDirection="desc"
              height="h-full"
              maxRows={30}
            />
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 hover:bg-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Legenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-300">
            <span className="font-semibold">DOH (Days on Hand):</span> Dias de estoque com base na venda média diária
          </div>
          <div className="text-sm text-gray-300">
            <span className="font-semibold">Giro:</span> Taxa de rotatividade do produto no período
          </div>
          <div className="text-sm text-gray-300">
            <span className="text-green-400">Giro Rápido:</span> DOH {'<'} 30 dias | 
            <span className="text-yellow-400 ml-2">Giro Médio:</span> DOH 30-90 dias | 
            <span className="text-red-400 ml-2">Giro Lento:</span> DOH {'>'} 90 dias
          </div>
        </CardContent>
      </Card>
    </div>
  );
};