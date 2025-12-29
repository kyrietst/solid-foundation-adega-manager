
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Badge } from '@/shared/ui/primitives/badge';
import { Input } from '@/shared/ui/primitives/input';
import { ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CustomerPurchasesTabProps {
    filteredPurchases: any[];
    isLoadingPurchases: boolean;
    purchaseFilter: string;
    onFilterChange: (value: string) => void;
    selectedPeriod: string;
    onPeriodChange: (value: string) => void;
    formatDate: (date: string | null) => string;
}

export const CustomerPurchasesTab: React.FC<CustomerPurchasesTabProps> = ({
    filteredPurchases,
    isLoadingPurchases,
    purchaseFilter,
    onFilterChange,
    selectedPeriod,
    onPeriodChange,
    formatDate
}) => {
    return (
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-sm text-gray-200 font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-blue-500" />
                        Histórico de Compras ({filteredPurchases.length})
                    </div>
                </CardTitle>

                {/* Filtros */}
                <div className="flex gap-2 mt-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Filtrar por ID ou status..."
                            value={purchaseFilter}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                        />
                    </div>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => onPeriodChange(e.target.value)}
                        className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm"
                    >
                        <option value="all">Todos os períodos</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="365">Último ano</option>
                    </select>
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingPurchases ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                ) : filteredPurchases.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredPurchases.map((purchase) => (
                            <div key={purchase.id} className="p-4 rounded-lg bg-gray-700/30 border border-gray-600/30">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-medium text-white">#{purchase.id?.slice(-8)}</span>
                                        <Badge
                                            variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                                            className="ml-2"
                                        >
                                            {purchase.status}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-400">
                                            {formatCurrency(purchase.total || 0)}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {formatDate(purchase.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-gray-400">
                        {purchaseFilter || selectedPeriod !== 'all'
                            ? 'Nenhuma compra encontrada com os filtros aplicados'
                            : 'Nenhuma compra registrada'
                        }
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
