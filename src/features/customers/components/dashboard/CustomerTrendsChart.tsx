import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface CustomerTrendsChartProps {
    data: any[];
    isLoading: boolean;
    error: Error | null;
}

export const CustomerTrendsChart: React.FC<CustomerTrendsChartProps> = ({ data, isLoading, error }) => {
    return (
        <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300 col-span-2">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Tendências de Clientes
                    {isLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 ml-2"></div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="h-80 flex flex-col items-center justify-center">
                        <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
                        <p className="text-red-400 font-medium mb-2">Erro ao carregar tendências</p>
                        <p className="text-gray-400 text-sm text-center">
                            Dados usando fallback baseado em estatísticas reais
                        </p>
                    </div>
                ) : isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <p className="text-gray-400">Carregando dados reais...</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
                                <YAxis tick={{ fill: '#9CA3AF' }} stroke="#6B7280" />
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
                                    formatter={(value, name) => [
                                        `${value}${name === 'LTV Médio' ? '' : ' clientes'}`,
                                        name
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="novos"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    name="Novos Clientes"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ativos"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    name="Clientes Ativos"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ltv"
                                    stroke="#F59E0B"
                                    strokeWidth={3}
                                    name="LTV Médio"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
