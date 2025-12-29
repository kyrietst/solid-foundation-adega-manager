import React from 'react';
import { cn, formatCurrency } from '@/core/config/utils';
import { LucideIcon } from 'lucide-react';

interface TurnoverAnalysis {
    rate: string;
    label: string;
    color: string;
    icon: LucideIcon;
    description: string;
}

interface ProductTurnoverCardProps {
    analytics: {
        turnoverRate: string;
        avgSales: number;
        daysOfStock: number;
        stockStatus: {
            status: string;
            label: string;
            color: string;
        };
    } | undefined;
    turnoverAnalysis: TurnoverAnalysis;
    className?: string;
}

export const ProductTurnoverCard: React.FC<ProductTurnoverCardProps> = ({
    analytics,
    turnoverAnalysis,
    className
}) => {
    const TurnoverIcon = turnoverAnalysis.icon;

    return (
        <div className={cn("bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 space-y-4", className)}>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <TurnoverIcon className={cn("h-4 w-4", turnoverAnalysis.color)} />
                Análise de Giro
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {/* Giro Status */}
                <div className="col-span-2 bg-gray-900/40 p-3 rounded border border-gray-700/30 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-gray-500 uppercase">Classificação</div>
                        <div className={cn("font-bold text-sm", turnoverAnalysis.color)}>
                            {turnoverAnalysis.label}
                        </div>
                    </div>
                    <div className={cn("text-xs px-2 py-1 rounded bg-gray-800 border border-gray-700 opacity-80", turnoverAnalysis.color)}>
                        {turnoverAnalysis.rate}
                    </div>
                </div>

                {/* Vendas Média */}
                <div className="bg-gray-900/40 p-3 rounded border border-gray-700/30">
                    <div className="text-xs text-gray-500 mb-1">Média Mensal</div>
                    <div className="font-mono font-medium text-white">
                        {analytics ? analytics.avgSales.toFixed(1) : '--'} <span className="text-xs text-gray-500">un/mês</span>
                    </div>
                </div>

                {/* Cobertura de Estoque */}
                <div className="bg-gray-900/40 p-3 rounded border border-gray-700/30">
                    <div className="text-xs text-gray-500 mb-1">Cobertura</div>
                    <div className={cn(
                        "font-mono font-medium",
                        analytics?.stockStatus.color.replace('bg-', 'text-').split(' ')[0]
                    )}>
                        {analytics ? `${analytics.daysOfStock} dias` : '--'}
                    </div>
                </div>
            </div>

            {/* Sugestão de Ação */}
            <div className="text-xs text-gray-500 bg-gray-900/20 p-2 rounded border border-dashed border-gray-700/50">
                💡 <span className="italic">{turnoverAnalysis.description}</span>
            </div>
        </div>
    );
};
