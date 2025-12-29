
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CustomerFinanceCardProps {
    metrics: any; // Ideally strictly typed, but keeping compatibility for now
}

export const CustomerFinanceCard: React.FC<CustomerFinanceCardProps> = ({ metrics }) => {
    return (
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-green/60 hover:scale-[1.02] hover:shadow-xl hover:bg-black/80 transition-all duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-white font-semibold text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-accent-green" />
                    Resumo Financeiro
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between min-h-[44px]">
                    <span className="text-gray-200 font-medium text-sm">Valor Total (LTV)</span>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-accent-green">
                            {formatCurrency(metrics?.lifetime_value_calculated || 0)}
                            {metrics && !metrics.data_sync_status.ltv_synced && (
                                <span className="text-xs text-yellow-400 ml-1">⚠️</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-300 font-medium">
                            {`${metrics?.total_purchases || 0} compras reais`}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between min-h-[40px]">
                    <span className="text-gray-200 font-medium text-sm">Ticket Médio</span>
                    <div className="text-xl font-bold text-accent-purple">
                        {formatCurrency(metrics?.avg_purchase_value || 0)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
