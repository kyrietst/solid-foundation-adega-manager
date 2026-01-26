import React, { useMemo } from 'react';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp,
    ShoppingCart, Flame, CheckCircle, AlertCircle
} from 'lucide-react';
import { StatCard } from '@/shared/ui/composite/stat-card'; // Keep for main KPI
import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { GlassIconBadge } from '@/shared/ui/composite/GlassIconBadge';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { useInventoryHealth, InventoryHealthProduct } from '../hooks/useInventoryHealth';
import { DateRange } from 'react-day-picker';
import { DataTable, TableColumn } from '@/shared/ui/layout/DataTable';

interface InventoryHealthDashboardProps {
    dateRange?: DateRange;
}

export const InventoryHealthDashboard: React.FC<InventoryHealthDashboardProps> = ({ dateRange }) => {
    const { data, isLoading } = useInventoryHealth(dateRange);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const replenishmentColumns: TableColumn<InventoryHealthProduct>[] = useMemo(() => [
        {
            key: 'name',
            title: 'Produto',
            className: 'font-medium text-white',
            render: (_val: unknown, item: InventoryHealthProduct) => (
                <div className="flex flex-col">
                    <span>{item.name}</span>
                    {item.units_sold_30d !== undefined && item.units_sold_30d > 0 && (
                        <span className="text-[10px] text-blue-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {item.units_sold_30d} vendidos (30d)
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'total_units',
            title: 'Atual',
            align: 'center',
            className: 'font-bold text-white',
            render: (val: unknown) => <span className={cn(Number(val) === 0 ? "text-red-400" : "text-white")}>{Number(val)}</span>
        },
        {
            key: 'minimum_stock',
            title: 'Mínimo',
            align: 'center',
            className: 'text-gray-400'
        },
        {
            key: 'status',
            title: 'Status',
            align: 'right',
            render: (_val: unknown, item: InventoryHealthProduct) => (
                <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold tracking-wider",
                    item.total_units === 0
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                )}>
                    {item.total_units === 0 ? "ESGOTADO" : "BAIXO"}
                </span>
            )
        }
    ], []);

    const deadStockColumns: TableColumn<InventoryHealthProduct>[] = useMemo(() => [
        {
            key: 'name',
            title: 'Produto',
            className: 'font-medium text-white'
        },
        {
            key: 'total_units',
            title: 'Qtd.',
            align: 'center',
            className: 'text-gray-300'
        },
        {
            key: 'stuck_value',
            title: 'Valor Parado',
            align: 'right',
            className: 'font-bold text-orange-400',
            render: (val: unknown) => formatCurrency(Number(val))
        },
        {
            key: 'id', // Action column
            title: 'Ação',
            align: 'right',
            render: () => (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                >
                    Criar Promoção
                </Button>
            )
        }
    ], []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const { replenishment, deadStock, topMovers, totalStockValue } = data || {
        replenishment: [], deadStock: [], topMovers: [], totalStockValue: 0
    };

    return (
        <div className="space-y-8 pb-10">

            {/* 1. KPIs Principais - Standardized Metrics Strip */}
            <section className="w-full mb-8">
              <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2 border-b border-white/5 pb-8">

                {/* Metric 1: Patrimônio Total */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Patrimônio em Estoque</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {formatCurrency(totalStockValue)}
                    </span>
                    <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      <Package className="h-3 w-3 mr-1" />
                      Ativo
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Metric 2: Reposição (Alert) */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Reposição Urgente</span>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-bold tracking-tight", replenishment.length > 0 ? "text-amber-500" : "text-white")}>
                      {replenishment.length}
                    </span>
                    <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Crítico
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Metric 3: Encalhe (Dead Stock) */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Estoque Parado</span>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-bold tracking-tight", deadStock.length > 0 ? "text-red-500" : "text-white")}>
                      {deadStock.length}
                    </span>
                     <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                      <Flame className="h-3 w-3 mr-1" />
                      Risco
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Metric 4: Giro (Top Movers) */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Produtos em Giro</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {topMovers.length}
                    </span>
                    <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Top 5
                    </span>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. Tabelas Detalhadas - Premium Standard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Tabela: Sugestão de Compra */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-amber-500/10 rounded-lg">
                                <ShoppingCart className="w-5 h-5 text-amber-500" />
                             </div>
                             <h3 className="text-base font-semibold text-white">Sugestão de Compra</h3>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 tracking-wide">
                            Ordem Crítica
                        </span>
                    </div>

                    {/* Content */}
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                                <tr className="text-[10px] uppercase tracking-wider text-zinc-500">
                                    <th className="px-6 py-4 font-medium">Produto</th>
                                    <th className="px-6 py-4 font-medium text-center">Atual</th>
                                    <th className="px-6 py-4 font-medium text-center">Mínimo</th>
                                    <th className="px-6 py-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {replenishment.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                                            <CheckCircle className="w-8 h-8 text-green-500/50" />
                                            <span>Estoque saudável! Nenhum item crítico.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    replenishment.map((item) => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-3 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">{item.name}</span>
                                                    {item.units_sold_30d !== undefined && item.units_sold_30d > 0 && (
                                                        <span className="text-[10px] text-blue-400/70 flex items-center gap-1 mt-0.5">
                                                            <TrendingUp className="w-3 h-3" />
                                                            {item.units_sold_30d} vendidos (30d)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 align-middle text-center">
                                                <span className={cn("font-bold", item.total_units === 0 ? "text-red-400" : "text-zinc-300")}>
                                                    {item.total_units}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 align-middle text-center">
                                                <span className="text-zinc-500">{item.minimum_stock}</span>
                                            </td>
                                            <td className="px-6 py-3 align-middle text-right">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center border",
                                                    item.total_units === 0
                                                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                )}>
                                                    {item.total_units === 0 ? "Esgotado" : "Baixo"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabela: Queima de Estoque (Dead Stock) */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
                    {/* Header */}
                    <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Flame className="w-5 h-5 text-orange-500" />
                             </div>
                             <h3 className="text-base font-semibold text-white">Encalhados</h3>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 tracking-wide">
                            Valor Parado
                        </span>
                    </div>

                     {/* Content */}
                     <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/[0.02] border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
                                <tr className="text-[10px] uppercase tracking-wider text-zinc-500">
                                    <th className="px-6 py-4 font-medium">Produto</th>
                                    <th className="px-6 py-4 font-medium text-center">Qtd.</th>
                                    <th className="px-6 py-4 font-medium text-right">Valor Parado</th>
                                    <th className="px-6 py-4 font-medium text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {deadStock.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 flex flex-col items-center gap-2">
                                            <TrendingUp className="w-8 h-8 text-green-500/50" />
                                            <span>Giro excelente! Nenhum produto estagnado.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    deadStock.map((item) => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-3 align-middle">
                                                <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                                    {item.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 align-middle text-center text-zinc-400">
                                                {item.total_units}
                                            </td>
                                            <td className="px-6 py-3 align-middle text-right">
                                                <span className="font-bold text-orange-400">
                                                    {formatCurrency(item.stuck_value)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 align-middle text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 px-2"
                                                >
                                                    Criar Promoção
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3. Top Movers (Curva A - Visual) */}
            <GlassCard className="p-6 border-white/5 bg-gradient-to-br from-black/40 to-black/60">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Giro Rápido (Top 5)
                        <span className="text-xs font-normal text-gray-500 ml-2 border-l border-white/10 pl-2">Curva A</span>
                    </h3>
                </div>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6 pt-4">
                    {topMovers.map((product, idx) => (
                        <div key={idx} className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500 to-transparent opacity-20 group-hover:opacity-40 rounded-xl blur transition duration-500"></div>
                            <div className="relative bg-black/80 rounded-xl p-4 border border-white/10 flex flex-col items-center text-center h-full hover:bg-black/60 transition-colors">
                                <div className="absolute top-2 right-2 text-[10px] font-bold text-white/20 group-hover:text-emerald-500/50">#{idx + 1}</div>
                                
                                <GlassIconBadge 
                                    icon={Package} 
                                    variant="green" 
                                    size="md" 
                                    className="mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                />

                                <h4 className="font-bold text-white text-sm line-clamp-2 min-h-[40px] mb-2 px-2">
                                    {product.name}
                                </h4>
                                
                                <div className="w-full bg-white/5 rounded-lg py-2 px-3 mt-auto">
                                    <p className="text-xs text-emerald-300 font-bold mb-1">
                                        {product.units_sold_30d} vendidos
                                    </p>
                                    <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${Math.min(100, (product.total_units / (product.minimum_stock * 3)) * 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                        <span>Estoque: {product.total_units}</span>
                                        <span>Min: {product.minimum_stock}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {topMovers.length === 0 && (
                        <div className="col-span-full py-8 text-center text-gray-500">
                            Ainda não há dados de vendas suficientes para calcular o Top 5.
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};


