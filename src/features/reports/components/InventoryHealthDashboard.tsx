import React, { useMemo } from 'react';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp,
    ShoppingCart, Flame, AlertCircle
} from 'lucide-react';
import { StatCard } from '@/shared/ui/composite/stat-card';
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
            className: 'font-medium',
            render: (_val, item) => (
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
            className: 'font-bold'
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
            render: (_val, item) => (
                <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    item.total_units === 0
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
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
            className: 'font-medium'
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
            className: 'font-bold text-orange-300',
            render: (val) => formatCurrency(Number(val))
        },
        {
            key: 'id', // Action column
            title: 'Ação',
            align: 'right',
            render: () => (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                >
                    Promoção
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

            {/* KPIs start */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Patrimônio em Estoque"
                    value={totalStockValue}
                    description="Valor de custo total parado"
                    icon={Package}
                    variant="premium"
                    formatType="currency"
                />

                <StatCard
                    title="Produtos Críticos"
                    value={replenishment.length}
                    description="Abaixo do estoque mínimo"
                    icon={AlertTriangle}
                    variant={replenishment.length > 0 ? "error" : "success"}
                    formatType="number"
                />

                <StatCard
                    title="Produtos sem Giro"
                    value={deadStock.length}
                    description="Sem vendas há 30+ dias"
                    icon={TrendingDown}
                    variant={deadStock.length > 0 ? "warning" : "success"}
                    formatType="number"
                />
            </div>
            {/* KPIs end */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sugestão de Reposição */}
                <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6 flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-400" />
                            Sugestão de Compra (Reposição)
                        </h3>
                        <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                            Ordenado por Giro ({replenishment.length})
                        </span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <DataTable
                            data={replenishment}
                            columns={replenishmentColumns}
                            virtualization={true}
                            rowHeight={50}
                            itemsPerPage={50}
                            emptyTitle="Estoque saudável!"
                            emptyDescription="Nenhum item crítico no momento."
                            emptyIcon={<AlertCircle className="w-8 h-8 opacity-50" />}
                            compact
                            glassEffect={false} // Already in a card
                            variant="default"
                            className="h-full border-none"
                        />
                    </div>
                </div>

                {/* Dead Stock */}
                <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6 flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            O Que Queimar? (Encalhados)
                        </h3>
                        <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                            Valor Parado ({deadStock.length})
                        </span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <DataTable
                            data={deadStock}
                            columns={deadStockColumns}
                            virtualization={true} // Critical: Dead stock can be huge
                            rowHeight={50}
                            itemsPerPage={50}
                            emptyTitle="Ótimo giro!"
                            emptyDescription="Nenhum produto encalhado."
                            emptyIcon={<TrendingUp className="w-8 h-8 opacity-50" />}
                            compact
                            glassEffect={false}
                            variant="default"
                            className="h-full border-none"
                        />
                    </div>
                </div>
            </div>

            {/* Top Movers */}
            <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Giro Rápido (Top 5 Mais Vendidos)
                    </h3>
                    <p className="text-sm text-gray-400">Nunca deixe faltar!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {topMovers.map((product, idx) => (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-4 border border-white/5 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold mb-3">
                                #{idx + 1}
                            </div>
                            <h4 className="font-medium text-white text-sm line-clamp-2 h-10 mb-2">
                                {product.name}
                            </h4>
                            <p className="text-xs text-gray-400 mb-1">
                                {product.units_sold_30d} vendas (30d)
                            </p>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: `${Math.min(100, (product.total_units / (product.minimum_stock * 3)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">
                                Estoque: {product.total_units}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
