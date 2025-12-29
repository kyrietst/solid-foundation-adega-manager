
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { TrendingUp } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/core/config/utils';

interface CustomerAnalyticsTabProps {
    ltvChartData: any[];
    customer: any;
    purchases: any[];
}

export const CustomerAnalyticsTab: React.FC<CustomerAnalyticsTabProps> = ({
    ltvChartData,
    customer,
    purchases
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Evolução LTV */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm col-span-2">
                <CardHeader>
                    <CardTitle className="text-sm text-gray-200 font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Evolução do Lifetime Value
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {ltvChartData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={ltvChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        stroke="#6B7280"
                                    />
                                    <YAxis
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        stroke="#6B7280"
                                        tickFormatter={(value) => `R$ ${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#F3F4F6'
                                        }}
                                        labelStyle={{
                                            color: '#E5E7EB',
                                            fontWeight: '600'
                                        }}
                                        formatter={(value: any, name: any) => [
                                            formatCurrency(Number(value)),
                                            name === 'ltv' ? 'LTV Acumulado' : name
                                        ]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="ltv"
                                        stroke="#F59E0B"
                                        strokeWidth={3}
                                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <p className="text-gray-400">Dados insuficientes para o gráfico</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Estatísticas Detalhadas */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-sm text-gray-200 font-medium">
                        Métricas Detalhadas
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Média por compra:</span>
                        <span className="font-medium text-green-400">
                            {purchases.length > 0
                                ? formatCurrency((customer.lifetime_value || 0) / purchases.length)
                                : 'N/A'
                            }
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Total de compras:</span>
                        <span className="font-medium text-blue-400">{purchases.length}</span>
                    </div>
                    {/* <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Insights de IA:</span>
                        <span className="font-medium text-purple-400">0</span>
                    </div> */}
                </CardContent>
            </Card>
        </div>
    );
};
