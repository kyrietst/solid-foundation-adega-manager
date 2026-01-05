
import React from 'react';
import { CustomerInsights } from '../CustomerInsights';


interface CustomerAITabProps {
    customer: any;
    insights: any[];
    isLoadingInsights: boolean;
}

export const CustomerAITab: React.FC<CustomerAITabProps> = ({
    customer,
    insights,
    isLoadingInsights
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/* Current AI Insights - Functional */}
            <div className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm rounded-lg">
                <CustomerInsights
                    customerId={customer.id}
                    insights={insights}
                    isLoading={isLoadingInsights}
                />
            </div>
        </div>
    );
};
