import { useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
  Cell,
  Rectangle,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DataPoint = {
  name: string;
  [key: string]: number | string | Date | undefined;
};

interface BarChartProps {
  data: DataPoint[];
  bars: Array<{
    key: string;
    name: string;
    color: string;
    stackId?: string;
  }>;
  xAxisKey: string;
  yAxisLabel?: string;
  height?: number;
  isLoading?: boolean;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tickFormatter?: (value: any) => string;
  yAxisWidth?: number;
  yAxisFormatter?: (value: any) => string;
  barSize?: number;
  barRadius?: number | [number, number, number, number];
  isStacked?: boolean;
  horizontal?: boolean;
}

export const BarChart = ({
  data = [],
  bars = [],
  xAxisKey,
  yAxisLabel,
  height = 300,
  isLoading = false,
  className = '',
  showLegend = true,
  showGrid = true,
  tooltipFormatter,
  tickFormatter,
  yAxisWidth = 60,
  yAxisFormatter,
  barSize = 30,
  barRadius = 4,
  isStacked = false,
  horizontal = false,
}: BarChartProps) => {
  // Verificar se há dados para exibir
  const hasData = useMemo(() => {
    if (!data || data.length === 0) return false;
    
    // Verificar se pelo menos uma barra tem dados
    return bars.some(bar => {
      return data.some(item => {
        const value = item[bar.key];
        return value !== undefined && value !== null && value !== '' && Number(value) > 0;
      });
    });
  }, [data, bars]);

  // Formatar valores para exibição
  const formatValue = (value: any, formatType?: string) => {
    if (value === undefined || value === null) return '';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (formatType === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numValue);
    } else if (formatType === 'percent') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(numValue / 100);
    } else if (formatType === 'number') {
      return new Intl.NumberFormat('pt-BR').format(numValue);
    }
    
    return value;
  };

  // Renderizar tooltip personalizado
  const renderTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props;
    
    if (!active || !payload || payload.length === 0) return null;
    
    // Agrupar por stackId se for um gráfico empilhado
    const groupedPayload = isStacked
      ? payload.reduce((acc, item) => {
          const stackId = item.dataKey?.toString() || 'default';
          if (!acc[stackId]) {
            acc[stackId] = [];
          }
          acc[stackId].push(item);
          return acc;
        }, {} as Record<string, typeof payload>)
      : { default: payload };
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-2">{label}</p>
        
        {Object.entries(groupedPayload).map(([stackId, items]) => (
          <div key={stackId} className="space-y-1">
            {items.map((entry, index) => {
              const bar = bars.find(b => b.key === entry.dataKey);
              if (!bar) return null;
              
              return (
                <div key={`tooltip-${index}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: bar.color }}
                    />
                    <span className="text-muted-foreground">{bar.name}:</span>
                  </div>
                  <span className="font-medium ml-2">
                    {tooltipFormatter 
                      ? tooltipFormatter(entry.value, entry.name, entry)[0]
                      : formatValue(entry.value, typeof entry.value === 'number' ? 'number' : undefined)}
                  </span>
                </div>
              );
            })}
            
            {/* Mostrar total para gráficos empilhados */}
            {isStacked && items.length > 1 && (
              <div className="flex items-center justify-between pt-1 mt-1 border-t">
                <span className="font-medium">Total:</span>
                <span className="font-medium">
                  {formatValue(
                    items.reduce((sum, item) => sum + (Number(item.value) || 0), 0),
                    'number'
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar legenda personalizada
  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    
    if (!payload || payload.length === 0) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => {
          const bar = bars.find(b => b.key === entry.value);
          if (!bar) return null;
          
          return (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: bar.color }}
              />
              <span className="text-sm text-muted-foreground">{bar.name}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Se estiver carregando, exibir skeleton
  if (isLoading) {
    return (
      <div className={cn('w-full', className)} style={{ height }}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Se não houver dados, exibir mensagem
  if (!hasData) {
    return (
      <div className={cn(
        'flex items-center justify-center border rounded-md bg-muted/30',
        'text-muted-foreground text-sm',
        className
      )}
      style={{ height }}
      >
        Nenhum dado disponível para o período selecionado
      </div>
    );
  }

  // Função para renderizar as barras com bordas arredondadas
  const renderBar = (props: any) => {
    const { fill, x, y, width, height: barHeight } = props;
    
    // Se a altura for negativa (para gráficos horizontais)
    if (barHeight < 0) return null;
    
    // Aplicar raio às bordas
    const radius = Array.isArray(barRadius) 
      ? barRadius 
      : [barRadius, barRadius, barRadius, barRadius];
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={barHeight}
        fill={fill}
        rx={Math.min(radius[0] || 0, width / 2)}
        ry={Math.min(radius[1] || 0, barHeight / 2)}
      />
    );
  };

  return (
    <div className={cn('w-full', className)} style={{ height: height + (showLegend ? 60 : 0) }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
          barCategoryGap={isStacked ? 0 : '10%'}
          barGap={0}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={!horizontal}
              horizontal={horizontal}
              className="stroke-muted"
            />
          )}
          
          {horizontal ? (
            <YAxis
              type="category"
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                if (tickFormatter) return tickFormatter(value);
                return value;
              }}
              width={yAxisWidth}
              className="text-xs"
            />
          ) : (
            <XAxis
              dataKey={xAxisKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                if (tickFormatter) return tickFormatter(value);
                return value;
              }}
              className="text-xs"
            />
          )}
          
          {horizontal ? (
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                if (yAxisFormatter) return yAxisFormatter(value);
                return formatValue(value, 'number');
              }}
              label={yAxisLabel ? {
                value: yAxisLabel,
                position: 'insideTop',
                offset: -10,
                style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' },
              } : undefined}
            />
          ) : (
            <YAxis
              width={yAxisWidth}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                if (yAxisFormatter) return yAxisFormatter(value);
                return formatValue(value, 'number');
              }}
              label={yAxisLabel ? {
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' },
                offset: 10,
              } : undefined}
            />
          )}
          
          <Tooltip 
            content={renderTooltip}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          
          {showLegend && (
            <Legend 
              content={renderLegend} 
              verticalAlign="bottom"
              height={40}
            />
          )}
          
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              stackId={isStacked ? 'stack' : undefined}
              barSize={barSize}
              shape={renderBar}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={bar.color}
                  opacity={1}
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Componente auxiliar para gráfico de vendas por categoria
export const SalesByCategoryChart = ({
  data = [],
  isLoading = false,
  height = 300,
  className = '',
}: {
  data: Array<{
    category: string;
    sales: number;
    orders: number;
  }>;
  isLoading?: boolean;
  height?: number;
  className?: string;
}) => {
  // Ordenar por valor de vendas (maior para menor)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.sales - a.sales);
  }, [data]);

  return (
    <BarChart
      data={sortedData}
      bars={[
        { key: 'sales', name: 'Vendas', color: 'hsl(var(--primary))' },
        { key: 'orders', name: 'Pedidos', color: 'hsl(var(--muted-foreground))' },
      ]}
      xAxisKey="category"
      yAxisLabel="Valor (R$)"
      height={height}
      isLoading={isLoading}
      className={className}
      yAxisFormatter={(value) => 
        new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL',
          maximumFractionDigits: 0 
        }).format(value)
      }
      tooltipFormatter={(value, name) => {
        if (name === 'sales') {
          return [
            new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(Number(value)),
            'Vendas'
          ];
        } else {
          return [
            new Intl.NumberFormat('pt-BR').format(Number(value)),
            'Pedidos'
          ];
        }
      }}
    />
  );
};

// Componente auxiliar para gráfico de produtos mais vendidos
export const TopProductsChart = ({
  data = [],
  isLoading = false,
  height = 300,
  className = '',
}: {
  data: Array<{
    product: string;
    quantity: number;
    revenue: number;
  }>;
  isLoading?: boolean;
  height?: number;
  className?: string;
}) => {
  // Limitar a 10 produtos e ordenar por quantidade
  const topProducts = useMemo(() => {
    return [...data]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [data]);

  return (
    <BarChart
      data={topProducts}
      bars={[
        { key: 'quantity', name: 'Quantidade', color: 'hsl(var(--primary))' },
        { key: 'revenue', name: 'Receita', color: 'hsl(var(--secondary))' },
      ]}
      xAxisKey="product"
      yAxisLabel="Quantidade"
      height={height}
      isLoading={isLoading}
      className={className}
      horizontal={true}
      yAxisWidth={120}
      tooltipFormatter={(value, name) => {
        if (name === 'revenue') {
          return [
            new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }).format(Number(value)),
            'Receita'
          ];
        } else {
          return [
            new Intl.NumberFormat('pt-BR').format(Number(value)),
            'Quantidade'
          ];
        }
      }}
    />
  );
};
