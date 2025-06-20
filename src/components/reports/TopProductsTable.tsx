import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface TopProduct {
  product_id: string;
  product_name: string;
  category: string;
  quantity_sold: number;
  total_revenue: number;
  average_price: number;
  trend?: {
    value: number;
    label: string;
  };
}

interface TopProductsTableProps {
  products: TopProduct[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

export const TopProductsTable = ({
  products = [],
  isLoading = false,
  className = '',
  maxItems = 10,
}: TopProductsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const renderTrend = (trend?: { value: number; label: string }) => {
    if (!trend) return null;
    
    const isPositive = trend.value >= 0;
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
    
    return (
      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        <TrendIcon className="h-3 w-3 mr-0.5" />
        {Math.abs(trend.value)}%
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card className={cn('flex items-center justify-center', className)} style={{ minHeight: '300px' }}>
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </Card>
    );
  }

  const displayedProducts = maxItems ? products.slice(0, maxItems) : products;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedProducts.map((product) => (
            <div key={product.product_id} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <div className="font-medium">{product.product_name}</div>
                <div className="text-sm text-muted-foreground">{product.category}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(product.total_revenue)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatNumber(product.quantity_sold)} unid.
                </div>
                {renderTrend(product.trend)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
