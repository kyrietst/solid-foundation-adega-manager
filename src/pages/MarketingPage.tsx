import React from 'react';
import { ProfitabilityTable } from '@/features/marketing/components/ProfitabilityTable';
import { Target } from 'lucide-react';

export default function MarketingPage() {
    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <Target className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Inteligência de Marketing</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Análise de margens e lucratividade dos últimos 60 dias
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid de 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna 1: Top Produtos por Lucro Bruto */}
                <ProfitabilityTable
                    limit={10}
                    sortBy="profit"
                    title="Top 10 por Lucro Bruto"
                    className="h-[700px]"
                />

                {/* Coluna 2: Top Produtos por Margem % */}
                <ProfitabilityTable
                    limit={10}
                    sortBy="margin"
                    title="Top 10 por Margem %"
                    className="h-[700px]"
                />
            </div>

            {/* Footer Info */}
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-gray-400 text-center">
                    💡 <span className="text-purple-400 font-semibold">Dica:</span> Produtos com alta margem ({">"} 50%)
                    aparecem em <span className="text-emerald-400">verde</span>.
                    Margens baixas ({"<"} 20%) aparecem em <span className="text-red-400">vermelho</span>.
                </p>
            </div>
        </div>
    );
}
