import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface AtRiskCustomer {
    id: string;
    name: string;
    risk_level: string;
    daysSinceLastPurchase: number | null;
    riskReason: string;
    ltv: number;
    segment: string;
}

interface AtRiskCustomersListProps {
    customers: AtRiskCustomer[];
}

export const AtRiskCustomersList: React.FC<AtRiskCustomersListProps> = ({ customers }) => {
    return (
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-400/30 transition-all duration-300">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Clientes em Risco ({customers.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {customers.map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/5 transition-colors duration-200">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-white">{customer.name}</p>
                                    <Badge
                                        variant={customer.risk_level === 'alto' ? 'destructive' : customer.risk_level === 'medio' ? 'secondary' : 'default'}
                                        className="text-xs"
                                    >
                                        {customer.risk_level}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400 mb-1">
                                    {customer.daysSinceLastPurchase !== null
                                        ? `${customer.daysSinceLastPurchase} dias sem comprar`
                                        : 'Nunca realizou compra'
                                    }
                                </p>
                                <p className="text-xs text-orange-300 opacity-90">
                                    📋 {customer.riskReason}
                                </p>
                            </div>
                            <div className="text-right ml-4">
                                <p className="text-sm text-green-400 font-medium">
                                    {formatCurrency(customer.ltv)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {customer.segment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
