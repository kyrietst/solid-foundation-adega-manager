import React from 'react';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { Users, DollarSign, Gift, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CrmMetrics {
    totalCustomers: number;
    newCustomersThisPeriod: number;
    totalLTV: number;
    averageLTV: number;
    upcomingBirthdays: number;
    atRiskCustomers: number;
    churnRate: number;
}

interface CrmStatsCardsProps {
    metrics: CrmMetrics;
    selectedPeriod: number;
    onTotalCustomersClick: () => void;
    onLtvClick: () => void;
    onBirthdaysClick: () => void;
    onRiskClick: () => void;
}

export const CrmStatsCards: React.FC<CrmStatsCardsProps> = ({
    metrics,
    selectedPeriod,
    onTotalCustomersClick,
    onLtvClick,
    onBirthdaysClick,
    onRiskClick
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
                role="button"
                tabIndex={0}
                onClick={onTotalCustomersClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTotalCustomersClick();
                    }
                }}
            >
                <StatCard
                    layout="crm"
                    variant="default"
                    title="Total de Clientes"
                    value={metrics.totalCustomers}
                    description={`📈 +${metrics.newCustomersThisPeriod} nos últimos ${selectedPeriod}d`}
                    icon={Users}
                />
            </div>

            <div
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
                role="button"
                tabIndex={0}
                onClick={onLtvClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onLtvClick();
                    }
                }}
            >
                <StatCard
                    layout="crm"
                    variant="success"
                    title="LTV Total"
                    value={formatCurrency(metrics.totalLTV)}
                    description={`💰 Média: ${formatCurrency(metrics.averageLTV)}`}
                    icon={DollarSign}
                />
            </div>

            <div
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20"
                role="button"
                tabIndex={0}
                onClick={onBirthdaysClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onBirthdaysClick();
                    }
                }}
            >
                <StatCard
                    layout="crm"
                    variant="warning"
                    title="Aniversários"
                    value={metrics.upcomingBirthdays}
                    description={`🎂 Próximos ${Math.max(selectedPeriod, 30)} dias`}
                    icon={Gift}
                />
            </div>

            <div
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20"
                role="button"
                tabIndex={0}
                onClick={onRiskClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRiskClick();
                    }
                }}
            >
                <StatCard
                    layout="crm"
                    variant="error"
                    title="Em Risco"
                    value={metrics.atRiskCustomers}
                    description={`⚠️ ${metrics.churnRate.toFixed(1)}% churn rate`}
                    icon={AlertTriangle}
                />
            </div>
        </div>
    );
};
