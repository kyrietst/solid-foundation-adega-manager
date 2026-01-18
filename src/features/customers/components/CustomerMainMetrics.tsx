
import React from 'react';
import { CustomerFinanceCard } from './cards/CustomerFinanceCard';
import { CustomerActivityCard } from './cards/CustomerActivityCard';
import { CustomerPreferencesCard } from './cards/CustomerPreferencesCard';
import { CustomerContactCard } from './cards/CustomerContactCard';

interface CustomerMainMetricsProps {
    metrics: any;
    customer: any;
    customerStatus: string;
    profileCompleteness: string; // "15%"
    onSendWhatsApp: () => void;
    onSendEmail: () => void;
}

const getDerivedCustomerStatus = (metrics: any, segment: string) => {
    if (!metrics) {
        return {
            status: 'Carregando...',
            className: 'border-gray-500/30 text-gray-400',
            engagementLevel: 'Calculando...'
        };
    }

    const daysSinceLastPurchase = metrics.days_since_last_purchase;
    const totalPurchases = metrics.total_purchases || 0;
    const lifetimeValue = metrics.lifetime_value_calculated || 0;

    if (totalPurchases === 0) {
        return {
            status: 'Novo',
            className: 'border-blue-500/30 text-blue-400',
            engagementLevel: 'Baixo'
        };
    }

    if (lifetimeValue >= 1000 && totalPurchases >= 5) {
        return {
            status: 'VIP',
            className: 'border-yellow-500/30 text-yellow-400',
            engagementLevel: 'Alto'
        };
    }

    if (daysSinceLastPurchase !== undefined) {
        if (daysSinceLastPurchase <= 30) {
            return {
                status: 'Ativo',
                className: 'border-green-500/30 text-green-400',
                engagementLevel: 'Alto'
            };
        }
        if (daysSinceLastPurchase <= 90) {
            return {
                status: 'Regular',
                className: 'border-yellow-500/30 text-yellow-400',
                engagementLevel: 'Médio'
            };
        }
        return {
            status: 'Dormindo',
            className: 'border-red-500/30 text-red-400',
            engagementLevel: 'Baixo'
        };
    }

    return {
        status: segment || 'Indefinido',
        className: 'border-gray-500/30 text-gray-400',
        engagementLevel: 'Baixo'
    };
};

export const CustomerMainMetrics: React.FC<CustomerMainMetricsProps> = ({
    metrics,
    customer,
    customerStatus: segment, // Renaming prop to reflect it is just the segment string
    profileCompleteness,
    onSendWhatsApp,
    onSendEmail
}) => {
    const derivedStatus = getDerivedCustomerStatus(metrics, segment);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
            <CustomerFinanceCard metrics={metrics} />
            <CustomerActivityCard metrics={metrics} customerStatus={derivedStatus} />
            <CustomerPreferencesCard metrics={metrics} segment={customer.segment || ''} />
            <CustomerContactCard
                customer={customer}
                profileCompleteness={profileCompleteness}
                onSendWhatsApp={onSendWhatsApp}
                onSendEmail={onSendEmail}
            />
        </div>
    );
};
