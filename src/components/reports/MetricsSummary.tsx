import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart, Users, Package, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Metric = {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
  format?: 'currency' | 'number' | 'percent';
  description?: string;
};

interface MetricsSummaryProps {
  metrics: Metric[];
  isLoading?: boolean;
  className?: string;
}

export const MetricsSummary = ({
  metrics = [],
  isLoading = false,
  className = '',
}: MetricsSummaryProps) => {
  const formatValue = (value: string | number, formatType?: string) => {
    if (typeof value === 'string') return value;
    
    switch (formatType) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value);
      case 'percent':
        return new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(value / 100);
      case 'number':
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  };

  const renderChangeIndicator = (change?: number) => {
    if (change === undefined) return null;
    
    const isPositive = change > 0;
    const isNeutral = change === 0;
    const formattedChange = Math.abs(change).toFixed(1);
    
    return (
      <div className={cn(
        'inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5',
        isNeutral ? 'bg-muted text-muted-foreground' :
        isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      )}>
        {isNeutral ? (
          <Minus className="h-3 w-3 mr-0.5" />
        ) : isPositive ? (
          <ArrowUpRight className="h-3 w-3 mr-0.5" />
        ) : (
          <ArrowDownRight className="h-3 w-3 mr-0.5" />
        )}
        {formattedChange}%
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const iconColor = metric.iconColor || 'text-muted-foreground';
        
        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={cn('p-2 rounded-md', iconColor, iconColor.includes('text-') ? 'bg-opacity-10' : '')}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.format)}
              </div>
              <div className="mt-1 flex items-center gap-2">
                {renderChangeIndicator(metric.change)}
                {metric.description && (
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Componente auxiliar para métricas comuns
export const SalesMetrics = ({
  totalSales = 0,
  totalOrders = 0,
  averageTicket = 0,
  conversionRate = 0,
  salesChange = 0,
  ordersChange = 0,
  ticketChange = 0,
  conversionChange = 0,
  isLoading = false,
  className = '',
}: {
  totalSales?: number;
  totalOrders?: number;
  averageTicket?: number;
  conversionRate?: number;
  salesChange?: number;
  ordersChange?: number;
  ticketChange?: number;
  conversionChange?: number;
  isLoading?: boolean;
  className?: string;
}) => {
  const metrics: Metric[] = [
    {
      id: 'total-sales',
      title: 'Vendas Totais',
      value: totalSales,
      change: salesChange,
      icon: DollarSign,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      format: 'currency',
      description: 'Valor total em vendas',
    },
    {
      id: 'total-orders',
      title: 'Pedidos',
      value: totalOrders,
      change: ordersChange,
      icon: ShoppingCart,
      iconColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      format: 'number',
      description: 'Total de pedidos realizados',
    },
    {
      id: 'average-ticket',
      title: 'Ticket Médio',
      value: averageTicket,
      change: ticketChange,
      icon: CreditCard,
      iconColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      format: 'currency',
      description: 'Valor médio por pedido',
    },
    {
      id: 'conversion-rate',
      title: 'Taxa de Conversão',
      value: conversionRate,
      change: conversionChange,
      icon: Users,
      iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
      format: 'percent',
      description: 'Visitantes que realizam compras',
    },
  ];

  return <MetricsSummary metrics={metrics} isLoading={isLoading} className={className} />;
};

// Componente auxiliar para métricas de estoque
export const InventoryMetrics = ({
  totalProducts = 0,
  outOfStock = 0,
  lowStock = 0,
  inventoryValue = 0,
  outOfStockChange = 0,
  lowStockChange = 0,
  valueChange = 0,
  isLoading = false,
  className = '',
}: {
  totalProducts?: number;
  outOfStock?: number;
  lowStock?: number;
  inventoryValue?: number;
  outOfStockChange?: number;
  lowStockChange?: number;
  valueChange?: number;
  isLoading?: boolean;
  className?: string;
}) => {
  const metrics: Metric[] = [
    {
      id: 'total-products',
      title: 'Total de Produtos',
      value: totalProducts,
      icon: Package,
      iconColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      format: 'number',
      description: 'Produtos cadastrados',
    },
    {
      id: 'out-of-stock',
      title: 'Fora de Estoque',
      value: outOfStock,
      change: outOfStockChange,
      icon: Package,
      iconColor: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      format: 'number',
      description: 'Produtos sem estoque',
    },
    {
      id: 'low-stock',
      title: 'Estoque Baixo',
      value: lowStock,
      change: lowStockChange,
      icon: Package,
      iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
      format: 'number',
      description: 'Produtos com estoque crítico',
    },
    {
      id: 'inventory-value',
      title: 'Valor do Estoque',
      value: inventoryValue,
      change: valueChange,
      icon: DollarSign,
      iconColor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      format: 'currency',
      description: 'Valor total em estoque',
    },
  ];

  return <MetricsSummary metrics={metrics} isLoading={isLoading} className={className} />;
};
