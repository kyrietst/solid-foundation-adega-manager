/**
 * Seção de gráficos do dashboard
 * Sub-componente especializado para charts de vendas
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SalesDataPoint } from '@/hooks/dashboard/useDashboardData';

interface ChartsSectionProps {
  salesData: SalesDataPoint[];
  isLoading?: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  salesData,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-adega-yellow">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>

        <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-adega-yellow">Tendência de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Configuração comum para tooltips
  const tooltipStyle = {
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#F3F4F6'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Gráfico de Barras - Vendas por Mês */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-adega-yellow">Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                formatter={(value, name) => [value, 'Vendas']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="vendas" fill="url(#purpleGradient)" />
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Tendência */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-adega-yellow">Tendência de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                formatter={(value, name) => [value, 'Vendas']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={tooltipStyle}
              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="#10B981" 
                strokeWidth={4}
                dot={{ fill: '#10B981', strokeWidth: 3, r: 5 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 3, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};