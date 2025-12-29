import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { PieChart, BarChart3 } from 'lucide-react';
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/core/config/utils';

interface SegmentData {
    segment: string;
    count: number;
    ltv: number;
    percentage: number;
    color: string;
}

interface SegmentDistributionChartsProps {
    segmentData: SegmentData[];
}

export const SegmentDistributionCharts: React.FC<SegmentDistributionChartsProps> = ({ segmentData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - Segmentos */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/30 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-500" />
                        Distribuição por Segmento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        {/* Gráfico */}
                        <div className="flex-1 h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        dataKey="count"
                                        data={segmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {segmentData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke={entry.color}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#F3F4F6',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                                        }}
                                        labelStyle={{
                                            color: '#E5E7EB',
                                            fontWeight: '600'
                                        }}
                                        formatter={(value, name) => [
                                            `${value} clientes`,
                                            name
                                        ]}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legenda Lateral */}
                        <div className="flex-1 space-y-3">
                            <h4 className="text-white font-medium text-sm mb-4">Segmentos de Clientes</h4>
                            {segmentData.map((segment) => (
                                <div
                                    key={segment.segment}
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/5 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-white/20 group-hover:scale-110 transition-transform duration-200"
                                            style={{ backgroundColor: segment.color }}
                                        />
                                        <div>
                                            <p className="font-medium text-white text-sm">{segment.segment}</p>
                                            <p className="text-xs text-gray-400">{segment.count} clientes</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-sm">{segment.percentage.toFixed(1)}%</p>
                                        <p className="text-xs text-green-400">
                                            {formatCurrency(segment.count > 0 ? segment.ltv / segment.count : 0)}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Resumo Total */}
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium text-sm">Total de Clientes</span>
                                    <span className="text-blue-400 font-bold">{segmentData.reduce((sum, s) => sum + s.count, 0)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-gray-400 text-xs">LTV Total</span>
                                    <span className="text-green-400 font-medium text-sm">
                                        {formatCurrency(segmentData.reduce((sum, s) => sum + s.ltv, 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de Segmentos */}
            <Card className="bg-gray-800/30 border-gray-700/40 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400/30 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        ROI por Segmento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {segmentData.map((segment) => (
                            <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-white/5 transition-colors duration-200">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: segment.color }}
                                    />
                                    <div>
                                        <p className="font-medium text-white">{segment.segment}</p>
                                        <p className="text-sm text-gray-400">{segment.count} clientes</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-green-400">{formatCurrency(segment.ltv)}</p>
                                    <p className="text-xs text-gray-400">
                                        {formatCurrency(segment.count > 0 ? segment.ltv / segment.count : 0)}/cliente
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
