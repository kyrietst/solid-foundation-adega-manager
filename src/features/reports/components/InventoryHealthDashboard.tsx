import React from 'react';
import {
    Package, AlertTriangle, TrendingDown, TrendingUp,
    ShoppingCart, Flame, ArrowRight, AlertCircle
} from 'lucide-react';
import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { useInventoryHealth } from '../hooks/useInventoryHealth';

export const InventoryHealthDashboard: React.FC = () => {
    const { data, isLoading } = useInventoryHealth();

    // Formatação
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

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
            {/* 1. Cabeçalho */}
            <PageHeader
                title="Saúde do Estoque"
                description="Gestão inteligente de compras e queima de estoque."
            />

            {/* 2. KPIs de Patrimônio */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3. O Que Comprar? (Sugestão de Reposição) */}
                <GlassCard className="p-6 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-400" />
                            Sugestão de Compra (Reposição)
                        </h3>
                        <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                            Ordenado por Giro
                        </span>
                    </div>

                    <div className="overflow-auto flex-1 pr-2">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-black/20 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Produto</th>
                                    <th className="px-4 py-3 text-center">Atual</th>
                                    <th className="px-4 py-3 text-center">Mínimo</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {replenishment.map((product, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-white">
                                            <div className="flex flex-col">
                                                <span>{product.name}</span>
                                                {product.units_sold_30d > 0 && (
                                                    <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                                        <TrendingUp className="w-3 h-3" />
                                                        {product.units_sold_30d} vendidos (30d)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-white">
                                            {product.total_units}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-400">
                                            {product.minimum_stock}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                product.total_units === 0
                                                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                            )}>
                                                {product.total_units === 0 ? "ESGOTADO" : "BAIXO"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {replenishment.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="w-8 h-8 opacity-50" />
                                                <p>Estoque saudável! Nenhum item crítico.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* 4. O Que Queimar? (Dead Stock) */}
                <GlassCard className="p-6 flex flex-col h-[500px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            O Que Queimar? (Encalhados)
                        </h3>
                        <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-full">
                            Valor Parado
                        </span>
                    </div>

                    <div className="overflow-auto flex-1 pr-2">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-black/20 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Produto</th>
                                    <th className="px-4 py-3 text-center">Qtd.</th>
                                    <th className="px-4 py-3 text-right">Valor Parado</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {deadStock.map((product, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-300">
                                            {product.total_units}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-orange-300">
                                            {formatCurrency(product.stuck_value)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                                            >
                                                Promoção
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {deadStock.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <TrendingUp className="w-8 h-8 opacity-50" />
                                                <p>Ótimo giro! Nenhum produto encalhado.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* 5. Giro Rápido (Top Movers) */}
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Giro Rápido (Top 5 Mais Vendidos)
                    </h3>
                    <p className="text-sm text-gray-400">Nunca deixe faltar!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {topMovers.map((product, idx) => (
                        <div key={idx} className="bg-black/20 rounded-lg p-4 border border-white/5 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
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
            </GlassCard>
        </div>
    );
};
