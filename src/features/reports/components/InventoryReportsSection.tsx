/**
 * Inventory Reports Section - Sprint 2
 * Advanced inventory analysis with DOH, turnover, and dead stock
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Package, TrendingDown, AlertTriangle, BarChart3, Download } from 'lucide-react';
import ContributorsTable from '@/shared/ui/thirdparty/ruixen-contributors-table';

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

export const InventoryReportsSection: React.FC = () => {
  const [windowDays, setWindowDays] = useState(60);

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

  const inventoryColumns = [
    {
      accessorKey: 'name',
      header: 'Produto',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium text-white">{row.getValue('name')}</div>
          <div className="text-sm text-gray-400">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Estoque',
      cell: ({ row }: any) => {
        const stock = row.getValue('stock') as number;
        const isCritical = row.original.is_critical;
        return (
          <div className={`font-medium ${isCritical ? 'text-red-400' : 'text-white'}`}>
            {stock}
            {isCritical && <AlertTriangle className="h-3 w-3 inline ml-1" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'avg_daily_sales',
      header: 'Vendas/Dia',
      cell: ({ row }: any) => (
        <span className="text-blue-400">
          {formatNumber(row.getValue('avg_daily_sales'))}
        </span>
      ),
    },
    {
      accessorKey: 'doh',
      header: 'DOH (dias)',
      cell: ({ row }: any) => {
        const doh = row.getValue('doh') as number | null;
        return (
          <span className={getDohStatus(doh)}>
            {doh ? Math.round(doh) : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'turnover',
      header: 'Giro',
      cell: ({ row }: any) => {
        const turnover = row.getValue('turnover') as number | null;
        return (
          <span className={getTurnoverStatus(turnover)}>
            {formatNumber(turnover)}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const isCritical = row.original.is_critical;
        const isDeadStock = row.original.is_dead_stock;
        
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

  const movementColumns = [
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }: any) => (
        <span className="text-white">
          {new Date(row.getValue('date')).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }: any) => {
        const type = row.getValue('type') as string;
        const colors = {
          'in': 'text-green-400',
          'out': 'text-red-400',
          'fiado': 'text-yellow-400',
          'devolucao': 'text-blue-400'
        };
        return (
          <span className={colors[type as keyof typeof colors] || 'text-white'}>
            {type.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'products.name',
      header: 'Produto',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium text-white">{row.original.products?.name}</div>
          <div className="text-sm text-gray-400">{row.original.products?.category}</div>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantidade',
      cell: ({ row }: any) => (
        <span className="text-white font-medium">{row.getValue('quantity')}</span>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Motivo',
      cell: ({ row }: any) => (
        <span className="text-gray-400 text-sm">{row.getValue('reason') || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'users.full_name',
      header: 'Usuário',
      cell: ({ row }: any) => (
        <span className="text-blue-400">{row.original.users?.full_name}</span>
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
      {/* Period Selector */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Período de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[30, 60, 90, 180].map((days) => (
              <Button
                key={days}
                variant={windowDays === days ? "default" : "outline"}
                onClick={() => setWindowDays(days)}
                className={windowDays === days ? "bg-amber-600" : ""}
              >
                {days} dias
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{summary.total_products}</p>
              <p className="text-xs text-gray-400">Total Produtos</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">{summary.critical_stock}</p>
              <p className="text-xs text-gray-400">Crítico</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingDown className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-400">{summary.dead_stock}</p>
              <p className="text-xs text-gray-400">Dead Stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-400">{summary.fast_moving}</p>
              <p className="text-xs text-gray-400">Giro Rápido</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-400">{summary.medium_moving}</p>
              <p className="text-xs text-gray-400">Giro Médio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="text-center">
              <BarChart3 className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">{summary.slow_moving}</p>
              <p className="text-xs text-gray-400">Giro Lento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Analysis Table (substituída pela nova tabela 21st.dev para testes) */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Análise de Estoque (DOH & Giro)</CardTitle>
          <Button className="bg-green-600 hover:bg-green-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <ContributorsTable />
        </CardContent>
      </Card>

      {/* Recent Movements (substituída pela nova tabela 21st.dev para testes) */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Movimentações Recentes</CardTitle>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <ContributorsTable />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
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