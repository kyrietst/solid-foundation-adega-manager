/**
 * Seção de gráficos do dashboard
 * Sub-componente especializado para charts de vendas
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { SalesDataPoint } from '../hooks/useDashboardData';

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
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8" role="region" aria-label="Gráficos de vendas">
      {/* Gráfico de Barras - Vendas por Mês */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-adega-yellow">Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Gráfico de barras mostrando vendas por mês. Total de ${salesData.length} meses com dados.`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData} aria-label="Gráfico de vendas mensais">
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
          </div>
          <div className="sr-only">
            <h4>Dados tabulares das vendas por mês:</h4>
            <ul>
              {salesData.map((data, index) => (
                <li key={index}>{data.month}: {data.vendas} vendas</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Linha - Tendência */}
      <Card className="bg-adega-charcoal/20 border-white/10 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-adega-yellow">Tendência de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Gráfico de linha mostrando tendência de vendas ao longo de ${salesData.length} meses.`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData} aria-label="Gráfico de tendência de vendas">
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
          </div>
          <div className="sr-only">
            <h4>Dados tabulares da tendência de vendas:</h4>
            <ul>
              {salesData.map((data, index) => (
                <li key={index}>{data.month}: {data.vendas} vendas</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};