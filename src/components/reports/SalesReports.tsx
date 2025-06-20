import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Package, CreditCard, ArrowUpRight, ArrowDownRight, BarChart2, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SalesReportProps {
  salesMetrics?: {
    total_sales: number;
    total_orders: number;
    average_ticket: number;
    items_sold: number;
    refunds_amount: number;
    refunds_count: number;
    sales_growth: number;
    avg_items_per_order: number;
  };
  salesByCategory?: Array<{
    category: string;
    total_sales: number;
    order_count: number;
    items_sold: number;
    percentage: number;
    growth: number;
  }>;
  salesByPaymentMethod?: Array<{
    payment_method: string;
    total_sales: number;
    order_count: number;
    percentage: number;
    avg_ticket: number;
  }>;
  salesTrend?: Array<{
    period: string;
    sales: number;
    orders: number;
    avg_ticket: number;
    growth: number;
  }>;
  topProducts?: Array<{
    id: string;
    name: string;
    category: string;
    quantity_sold: number;
    total_revenue: number;
    avg_price: number;
    growth: number;
  }>;
  isLoading?: boolean;
  onExport?: () => void;
  className?: string;
}

export const SalesReports = ({
  salesMetrics,
  salesByCategory = [],
  salesByPaymentMethod = [],
  salesTrend = [],
  topProducts = [],
  isLoading = false,
  onExport,
  className = '',
}: SalesReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getTrendIndicator = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-green-600">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          {formatNumber(Math.abs(value), 1)}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-red-600">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          {formatNumber(Math.abs(value), 1)}%
        </span>
      );
    }
    return <span>0%</span>;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho e botão de exportação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatório de Vendas</h2>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho das vendas
          </p>
        </div>
        <Button onClick={onExport} disabled={isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cartões de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Brutas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : formatCurrency(salesMetrics?.total_sales || 0)}
            </div>
            <div className="text-xs text-muted-foreground">
              {salesMetrics?.sales_growth !== undefined && !isLoading ? (
                <span className={cn(
                  'flex items-center',
                  salesMetrics.sales_growth >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {salesMetrics.sales_growth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {formatNumber(Math.abs(salesMetrics.sales_growth), 1)}% vs. período anterior
                </span>
              ) : (
                '--'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : formatNumber(salesMetrics?.total_orders || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics?.avg_items_per_order && !isLoading 
                ? `${formatNumber(salesMetrics.avg_items_per_order, 1)} itens/pedido` 
                : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : formatCurrency(salesMetrics?.average_ticket || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics?.items_sold && !isLoading 
                ? `${formatNumber(salesMetrics.items_sold)} itens vendidos` 
                : '--'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '--' : formatCurrency(salesMetrics?.refunds_amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics?.refunds_count !== undefined && !isLoading 
                ? `${salesMetrics.refunds_count} pedidos reembolsados` 
                : '--'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Vendas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : salesByCategory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de categoria disponível
              </div>
            ) : (
              <div className="space-y-4">
                {salesByCategory.map((category) => (
                  <div key={category.category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span>{formatCurrency(category.total_sales)}</span>
                        {category.growth !== undefined && (
                          <span className={cn(
                            'text-xs',
                            category.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {category.growth >= 0 ? '↑' : '↓'} {Math.abs(category.growth)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div 
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{category.order_count} pedidos</span>
                      <span>{category.items_sold} itens</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de produto disponível
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Crescimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(product.quantity_sold)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.total_revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.growth !== undefined ? getTrendIndicator(product.growth) : '--'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métodos de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : salesByPaymentMethod.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado de pagamento disponível
            </div>
          ) : (
            <div className="space-y-4">
              {salesByPaymentMethod.map((method) => (
                <div key={method.payment_method} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{method.payment_method}</span>
                    <span className="font-medium">{formatCurrency(method.total_sales)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{method.order_count} pedidos</span>
                    <span>Ticket médio: {formatCurrency(method.avg_ticket)}</span>
                    <span>{method.percentage}% das vendas</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div 
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tendência de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Vendas</CardTitle>
          <CardDescription>Evolução das vendas ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : salesTrend.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Dados de tendência não disponíveis
            </div>
          ) : (
            <div className="h-64">
              {/* Aqui você pode adicionar um gráfico de linhas mostrando a tendência das vendas */}
              <div className="flex items-center justify-center h-full border rounded-md bg-muted/30">
                <p className="text-muted-foreground">Gráfico de Tendência de Vendas</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
