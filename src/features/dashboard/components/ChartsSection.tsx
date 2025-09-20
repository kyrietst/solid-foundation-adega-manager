/**
 * Seção de gráficos do dashboard
 * Sub-componente especializado para charts de vendas
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { SalesDataPoint } from '../hooks/useDashboardData';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface ChartsSectionProps {
  salesData: SalesDataPoint[];
  isLoading?: boolean;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  salesData,
  isLoading = false,
  variant = 'premium',
  glassEffect = true,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className={cn(getGlassCardClasses('premium'), 'shadow-xl')}>
          <CardHeader>
            <CardTitle className="text-primary-yellow">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>

        <Card className={cn(getGlassCardClasses('premium'), 'shadow-xl')}>
          <CardHeader>
            <CardTitle className="text-primary-yellow">Tendência de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[300px]">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tooltip vidro escuro + borda âmbar
  const tooltipStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    borderRadius: '12px',
    color: '#E5E7EB',
    boxShadow: '0 12px 24px rgba(0,0,0,0.45)'
  } as React.CSSProperties;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8" aria-label="Gráficos de vendas">
      {/* Gráfico de Barras - Vendas por Mês */}
      <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary-yellow">Vendas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Gráfico de barras mostrando vendas por mês. Total de ${salesData.length} meses com dados.`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData} aria-label="Gráfico de vendas mensais">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="rgba(229,231,235,0.6)" />
              <YAxis stroke="rgba(229,231,235,0.6)" />
              <Tooltip 
                formatter={(value, name) => [value, 'Vendas']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={tooltipStyle}
              />
              <Bar dataKey="vendas" fill="url(#amberGradient)" radius={[8,8,0,0]} />
              <defs>
                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.35}/>
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
      <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary-yellow">Tendência de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div role="img" aria-label={`Gráfico de linha mostrando tendência de vendas ao longo de ${salesData.length} meses.`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData} aria-label="Gráfico de tendência de vendas">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="rgba(229,231,235,0.6)" />
              <YAxis stroke="rgba(229,231,235,0.6)" />
              <Tooltip 
                formatter={(value, name) => [value, 'Vendas']}
                labelFormatter={(label) => `Mês: ${label}`}
                contentStyle={tooltipStyle}
              />
              <Line 
                type="monotone" 
                dataKey="vendas" 
                stroke="#F59E0B" 
                strokeWidth={4}
                dot={{ fill: '#F59E0B', strokeWidth: 3, r: 5 }}
                activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 3, fill: '#F59E0B' }}
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