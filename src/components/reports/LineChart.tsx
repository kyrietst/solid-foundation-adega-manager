import { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type DataPoint = {
  date: Date | string;
  [key: string]: number | string | Date | undefined;
};

interface LineChartProps {
  data: DataPoint[];
  lines: Array<{
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  }>;
  xAxisKey: string;
  yAxisLabel?: string;
  height?: number;
  isLoading?: boolean;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  tickFormatter?: (value: any, index: number) => string;
  yAxisWidth?: number;
  yAxisFormatter?: (value: any) => string;
  tooltipLabelFormatter?: (label: string | number) => string;
}

export const LineChart = ({
  data = [],
  lines = [],
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
  tooltipLabelFormatter,
}: LineChartProps) => {
  // Formatar datas para exibição
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const formattedItem: Record<string, any> = { ...item };
      
      // Formatar a data para um formato legível
      if (item.date) {
        const date = typeof item.date === 'string' ? new Date(item.date) : item.date;
        formattedItem.formattedDate = format(date, 'dd MMM', { locale: ptBR });
      }
      
      return formattedItem;
    });
  }, [data]);

  // Verificar se há dados para exibir
  const hasData = useMemo(() => {
    if (!data || data.length === 0) return false;
    
    // Verificar se pelo menos uma linha tem dados
    return lines.some(line => {
      return data.some(item => {
        const value = item[line.key];
        return value !== undefined && value !== null && value !== '';
      });
    });
  }, [data, lines]);

  // Renderizar tooltip personalizado
  const renderTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props;
    
    if (!active || !payload || payload.length === 0) return null;
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium mb-2">
          {tooltipLabelFormatter ? 
            tooltipLabelFormatter(label) : 
            (typeof label === 'string' ? label : format(new Date(label), 'PPP', { locale: ptBR }))}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const line = lines.find(l => l.key === entry.dataKey);
            if (!line) return null;
            
            return (
              <div key={`tooltip-${index}`} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="text-muted-foreground">{line.name}:</span>
                </div>
                <span className="font-medium ml-2">
                  {tooltipFormatter 
                    ? tooltipFormatter(entry.value, entry.name, entry)
                    : typeof entry.value === 'number'
                      ? entry.value.toLocaleString('pt-BR')
                      : entry.value}
                </span>
              </div>
            );
          })}
        </div>
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
          const line = lines.find(l => l.key === entry.value);
          if (!line) return null;
          
          return (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: line.color }}
              />
              <span className="text-sm text-muted-foreground">{line.name}</span>
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

  return (
    <div className={cn('w-full', className)} style={{ height: height + (showLegend ? 60 : 0) }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={formattedData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              className="stroke-muted"
            />
          )}
          
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => {
              if (tickFormatter) return tickFormatter(value, 0);
              
              // Se for uma data, formatar
              if (value && (value instanceof Date || !isNaN(Date.parse(value)))) {
                const date = value instanceof Date ? value : new Date(value);
                return format(date, 'dd/MM', { locale: ptBR });
              }
              
              return value;
            }}
            padding={{ left: 10, right: 10 }}
          />
          
          <YAxis
            width={yAxisWidth}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => {
              if (yAxisFormatter) return yAxisFormatter(value);
              return value.toLocaleString('pt-BR');
            }}
            label={yAxisLabel ? {
              value: yAxisLabel,
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' },
              offset: 10,
            } : undefined}
          />
          
          <Tooltip 
            content={renderTooltip}
            cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          
          {showLegend && (
            <Legend 
              content={renderLegend} 
              verticalAlign="bottom"
              height={40}
            />
          )}
          
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
              }}
              isAnimationActive={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Componente auxiliar para gráfico de vendas
export const SalesTrendChart = ({
  data = [],
  isLoading = false,
  height = 300,
  className = '',
  showLegend = true,
}: {
  data: Array<{
    date: Date | string;
    sales: number;
    orders: number;
    averageTicket: number;
  }>;
  isLoading?: boolean;
  height?: number;
  className?: string;
  showLegend?: boolean;
}) => {
  const lines = [
    { key: 'sales', name: 'Vendas', color: 'hsl(var(--primary))' },
    { key: 'orders', name: 'Pedidos', color: 'hsl(var(--muted-foreground))', strokeDasharray: '5 5' },
  ];

  return (
    <LineChart
      data={data}
      lines={lines}
      xAxisKey="date"
      yAxisLabel="Valor (R$)"
      height={height}
      isLoading={isLoading}
      className={className}
      showLegend={showLegend}
      yAxisFormatter={(value) => 
        new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL',
          maximumFractionDigits: 0 
        }).format(value)
      }
      tooltipLabelFormatter={(label) => 
        format(new Date(label), 'PPP', { locale: ptBR })
      }
    />
  );
};

// Componente auxiliar para gráfico de estoque
export const StockTrendChart = ({
  data = [],
  isLoading = false,
  height = 300,
  className = '',
}: {
  data: Array<{
    date: Date | string;
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }>;
  isLoading?: boolean;
  height?: number;
  className?: string;
}) => {
  const lines = [
    { key: 'inStock', name: 'Em Estoque', color: 'hsl(var(--primary))' },
    { key: 'lowStock', name: 'Estoque Baixo', color: 'hsl(var(--warning))' },
    { key: 'outOfStock', name: 'Fora de Estoque', color: 'hsl(var(--destructive))' },
  ];

  return (
    <LineChart
      data={data}
      lines={lines}
      xAxisKey="date"
      yAxisLabel="Quantidade"
      height={height}
      isLoading={isLoading}
      className={className}
      yAxisFormatter={(value) => value.toLocaleString('pt-BR')}
      tooltipLabelFormatter={(label) => 
        format(new Date(label), 'PPP', { locale: ptBR })
      }
    />
  );
};
