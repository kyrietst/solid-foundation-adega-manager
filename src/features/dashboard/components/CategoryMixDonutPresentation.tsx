/**
 * CategoryMixDonutPresentation.tsx - Componente de apresentação puro (REFATORADO)
 * Context7 Pattern: Componente focado apenas na apresentação visual
 * Remove toda lógica de negócio e API calls do componente de UI
 *
 * REFATORAÇÃO APLICADA:
 * - Componente puro sem hooks de dados
 * - Props claramente definidas
 * - Formatação através de utilities
 * - Chart logic isolada em componentes
 * - Focus na apresentação visual
 *
 * @version 2.0.0 - Presentational Component (Context7)
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { CategoryMix } from '../hooks/useCategoryMixData';
import { formatCurrency, formatCompact } from '../utils/formatters';

export interface CategoryMixDonutPresentationProps {
  // Data props
  data: CategoryMix[];
  isLoading: boolean;
  error: Error | null;

  // Computed props from container
  totalRevenue: number;
  hasRealSalesData: boolean;
  hasData: boolean;

  // Configuration props
  className?: string;
  period?: number;
  showTotal?: boolean;
}

const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f43f5e', // rose
];

/**
 * Componente de apresentação puro para Category Mix Donut
 * Foca apenas na renderização visual sem lógica de negócio
 */
export const CategoryMixDonutPresentation: React.FC<CategoryMixDonutPresentationProps> = ({
  data,
  isLoading,
  error,
  totalRevenue,
  hasRealSalesData,
  hasData,
  className,
  period = 30,
  showTotal = false,
}) => {
  // Error State
  if (error) {
    return (
      <Card className={cn("border-red-500/40 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
        <CardHeader>
          <CardTitle className="text-red-300 font-bold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Erro - Mix Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-200 text-sm font-medium">Não foi possível carregar os dados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-white/20 bg-black/80 backdrop-blur-xl shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-bold tracking-tight flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-amber-300" />
            Mix por Categoria
            {!hasRealSalesData && (
              <span className="text-xs text-gray-300 ml-2">(Estoque)</span>
            )}
          </CardTitle>
          <a
            href="/reports?tab=inventory&period=30"
            className="text-gray-300 hover:text-amber-300 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="text-sm text-gray-200">
        {isLoading ? (
          <LoadingState />
        ) : hasData ? (
          <DataState
            data={data}
            totalRevenue={totalRevenue}
            hasRealSalesData={hasRealSalesData}
            showTotal={showTotal}
          />
        ) : (
          <EmptyState hasRealSalesData={hasRealSalesData} period={period} />
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Loading state component
 */
const LoadingState: React.FC = () => (
  <div className="h-[460px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
  </div>
);

/**
 * Data state component with chart
 */
const DataState: React.FC<{
  data: CategoryMix[];
  totalRevenue: number;
  hasRealSalesData: boolean;
  showTotal: boolean;
}> = ({ data, totalRevenue, hasRealSalesData, showTotal }) => (
  <div className="space-y-4">
    {/* Chart */}
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={110}
            innerRadius={55}
            fill="#8884d8"
            dataKey="revenue"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip totalRevenue={totalRevenue} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* Legend */}
    <div className="grid grid-cols-2 gap-3">
      {data.map((entry, index) => (
        <CategoryLegendItem
          key={entry.category}
          category={entry.category}
          revenue={entry.revenue}
          color={COLORS[index % COLORS.length]}
        />
      ))}
    </div>

    {/* Total - opcional */}
    {showTotal && (
      <TotalSection
        totalRevenue={totalRevenue}
        hasRealSalesData={hasRealSalesData}
      />
    )}
  </div>
);

/**
 * Category legend item component
 */
const CategoryLegendItem: React.FC<{
  category: string;
  revenue: number;
  color: string;
}> = ({ category, revenue, color }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-4 h-4 rounded-full"
      style={{ backgroundColor: color }}
    />
    <div className="flex-1 min-w-0">
      <div className="text-sm text-white truncate font-medium">{category}</div>
      <div className="text-sm text-gray-400 font-medium">
        {formatCompact(revenue)}
      </div>
    </div>
  </div>
);

/**
 * Total section component
 */
const TotalSection: React.FC<{
  totalRevenue: number;
  hasRealSalesData: boolean;
}> = ({ totalRevenue, hasRealSalesData }) => (
  <div className="pt-3 border-t border-white/10 text-center">
    <div className="text-sm text-gray-400">Total</div>
    <div className="text-lg font-semibold text-amber-400">
      {formatCurrency(totalRevenue)}
    </div>
    {!hasRealSalesData && (
      <div className="text-xs text-gray-500 mt-1">
        Baseado no valor do estoque
      </div>
    )}
  </div>
);

/**
 * Empty state component
 */
const EmptyState: React.FC<{ hasRealSalesData: boolean; period: number }> = ({ hasRealSalesData, period }) => (
  <div className="h-[460px] flex flex-col items-center justify-center text-center">
    <PieChartIcon className="h-12 w-12 text-gray-600 mb-3" />
    <div className="text-sm text-gray-400 mb-2">Nenhum dado disponível</div>
    <div className="text-xs text-gray-500">
      {hasRealSalesData
        ? `Sem vendas nos últimos ${period} dias`
        : 'Sem produtos cadastrados'
      }
    </div>
  </div>
);

/**
 * Custom tooltip component for the chart
 */
const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; totalRevenue: number }> = ({
  active,
  payload,
  totalRevenue
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalRevenue > 0 ? (data.value / totalRevenue) * 100 : 0;

    return (
      <div className="bg-black/95 backdrop-blur-xl border border-white/30 rounded-xl p-3 shadow-2xl">
        <p className="text-sm text-white font-semibold">{data.payload.category}</p>
        <p className="text-xs text-amber-300 font-semibold">
          {formatCurrency(data.value)} ({percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

/**
 * Custom label renderer for pie slices
 */
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // Hide labels for slices smaller than 5%

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};