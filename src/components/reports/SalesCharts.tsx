import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from 'next-themes';

interface SalesTrendChartProps {
  data: Array<{
    period_start: string;
    period_label: string;
    total_sales: number;
    total_orders: number;
    total_customers: number;
    average_ticket: number;
  }>;
  isLoading?: boolean;
  className?: string;
  height?: number;
}

export const SalesTrendChart = ({
  data,
  isLoading = false,
  className = '',
  height = 300,
}: SalesTrendChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-muted-foreground">Sem dados disponíveis para o período selecionado</p>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Evolução de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
              />
              <XAxis 
                dataKey="period_label" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#8884d8"
                tickFormatter={formatCurrency}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#82ca9d"
                tickFormatter={formatNumber}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: any, name: any) => {
                  if (name === 'Vendas (R$)') {
                    return [formatCurrency(value as number), name];
                  }
                  return [value, name];
                }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e1e1e' : '#fff',
                  borderColor: isDark ? '#333' : '#ddd',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: isDark ? '#fff' : '#000' }}
                labelStyle={{ color: isDark ? '#fff' : '#000' }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="total_sales" 
                name="Vendas (R$)" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right" 
                dataKey="total_orders" 
                name="Pedidos" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface SalesByCategoryChartProps {
  data: Array<{
    category: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  isLoading?: boolean;
  className?: string;
  height?: number;
}

export const SalesByCategoryChart = ({
  data,
  isLoading = false,
  className = '',
  height = 300,
}: SalesByCategoryChartProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Cores para as categorias (pode ser personalizado)
  const COLORS = [
    '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'
  ];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-64 w-64 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-muted-foreground">Sem dados disponíveis para o período selecionado</p>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Ordenar por total (maior para menor) e pegar apenas as 5 principais
  const topCategories = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Calcular o total para "Outros" se houver mais de 5 categorias
  const otherCategoriesTotal = data.length > 5 
    ? data.slice(5).reduce((sum, item) => sum + item.total, 0)
    : 0;

  // Adicionar "Outros" se necessário
  const chartData = otherCategoriesTotal > 0
    ? [...topCategories, { category: 'Outros', total: otherCategoriesTotal, count: 0, percentage: 0 }]
    : topCategories;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Vendas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center">
        <div style={{ width: '100%', maxWidth: '300px', height }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="total"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    stroke={isDark ? '#1e1e1e' : '#fff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => {
                  const { payload } = props;
                  return [
                    `${payload.category}: ${formatCurrency(value as number)}`,
                    `(${payload.percentage ? payload.percentage.toFixed(1) : (payload.total / data.reduce((sum, item) => sum + item.total, 0) * 100).toFixed(1)}%)`
                  ];
                }}
                contentStyle={{
                  backgroundColor: isDark ? '#1e1e1e' : '#fff',
                  borderColor: isDark ? '#333' : '#ddd',
                  borderRadius: '0.5rem',
                }}
                itemStyle={{ color: isDark ? '#fff' : '#000' }}
                labelStyle={{ color: isDark ? '#fff' : '#000' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-full max-w-xs space-y-2">
          {chartData.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ 
                    backgroundColor: COLORS[index % COLORS.length],
                    border: `1px solid ${isDark ? '#1e1e1e' : '#fff'}`
                  }} 
                />
                <span className="text-sm">{item.category}</span>
              </div>
              <span className="text-sm font-medium">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
