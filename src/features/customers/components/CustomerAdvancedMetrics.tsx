
import React from 'react';
import { Package, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CustomerAdvancedMetricsProps {
    metrics: any; // Using loose typing to match existing patterns and avoid deep type imports for now
}

export const CustomerAdvancedMetrics: React.FC<CustomerAdvancedMetricsProps> = ({ metrics }) => {
    if (!metrics) return null;

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Métricas Avançadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card: Itens por Compra */}
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700/50 transition-colors">
                            <Package className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Métrica</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-white tracking-tight block mb-1">
                            {metrics?.avg_items_per_purchase ? metrics.avg_items_per_purchase.toFixed(1) : '0'}
                        </span>
                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                            📦 {metrics?.total_products_bought || 0} total itens
                        </p>
                    </div>
                </div>

                {/* Card: Ticket Médio */}
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500/60">Financeiro</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-emerald-400 tracking-tight block mb-1">
                            {formatCurrency(metrics?.avg_purchase_value || 0)}
                        </span>
                        <p className="text-xs text-emerald-500/60 flex items-center gap-1">
                            💵 Por compra real
                        </p>
                    </div>
                </div>

                {/* Card: Categoria Favorita */}
                <div className="flex flex-col gap-4 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-500/60">Preferência</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-amber-400 tracking-tight block mb-1 truncate">
                            {metrics?.calculated_favorite_category || 'N/A'}
                        </span>
                        <p className="text-xs text-amber-500/60 flex items-center gap-1">
                            {metrics?.data_sync_status?.preferences_synced ? '📊 Sincronizado' : '⚠️ Desatualizado'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
