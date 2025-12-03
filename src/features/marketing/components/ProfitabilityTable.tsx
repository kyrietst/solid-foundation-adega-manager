import React, { useMemo, useCallback } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { DollarSign, RefreshCw, Package } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useMarginIntelligence } from '../hooks/useMarginIntelligence';

interface ProfitabilityTableProps {
    className?: string;
    limit?: number;
    sortBy?: 'profit' | 'margin';
    title?: string;
}

export const ProfitabilityTable = React.memo(function ProfitabilityTable({
    className,
    limit = 10,
    sortBy = 'profit',
    title
}: ProfitabilityTableProps) {
    const { data: products, isLoading, error, refetch } = useMarginIntelligence({
        limit,
        sortBy
    });

    // ✅ Memoizar funções de formatação
    const formatCurrency = useCallback((value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }, []);

    const formatPercent = useCallback((value: number) => {
        return `${value.toFixed(1)}%`;
    }, []);

    const formatQuantity = useCallback((qty: number) => {
        if (qty >= 1000) {
            return (qty / 1000).toFixed(1) + 'K';
        }
        return qty.toString();
    }, []);

    // Determinar cor da margem
    const getMarginColor = useCallback((margin: number) => {
        if (margin >= 50) return 'text-emerald-400';
        if (margin >= 30) return 'text-amber-400';
        if (margin >= 20) return 'text-yellow-400';
        return 'text-red-400';
    }, []);

    const handleRefresh = () => {
        refetch();
    };

    if (error) {
        return (
            <div className={cn(
                "flex flex-col h-full bg-black/60 backdrop-blur-sm border border-red-500/40 rounded-xl shadow-lg p-4",
                className
            )}>
                <p className="text-red-400 text-sm">Erro ao carregar dados de margem</p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg transition-all duration-300",
                className
            )}
        >
            <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-amber-400 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        {title || `Top ${limit} por ${sortBy === 'profit' ? 'Lucro' : 'Margem'}`}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                        title="Atualizar"
                    >
                        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pt-0 px-4 pb-4 flex-1 overflow-auto">
                {isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: limit }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 animate-pulse">
                                <div className="flex-1">
                                    <div className="h-4 bg-white/10 rounded mb-2" />
                                    <div className="h-3 bg-white/5 rounded w-2/3" />
                                </div>
                                <div className="w-16 h-6 bg-white/10 rounded" />
                            </div>
                        ))}
                    </div>
                ) : products && products.length > 0 ? (
                    <div className="space-y-2">
                        {products.map((product, index) => (
                            <div
                                key={`${product.product_name}-${index}`}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={cn(
                                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                        index === 0 ? "bg-amber-500 text-black" :
                                            index === 1 ? "bg-gray-400 text-black" :
                                                index === 2 ? "bg-amber-600 text-white" :
                                                    "bg-white/20 text-gray-300"
                                    )}>
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="text-base font-semibold text-white truncate">
                                            {product.product_name}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {product.category_name} • {product.times_sold} vendas
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex-shrink-0">
                                    <div className="text-base font-bold text-emerald-400">
                                        {formatCurrency(product.gross_profit)}
                                    </div>
                                    <div className={cn("text-sm font-semibold mt-0.5", getMarginColor(product.margin_percent))}>
                                        {formatPercent(product.margin_percent)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                        <Package className="h-8 w-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-400">Nenhuma venda no período</p>
                        <p className="text-xs text-gray-500">Últimos 60 dias</p>
                    </div>
                )}
            </CardContent>
        </div>
    );
});
