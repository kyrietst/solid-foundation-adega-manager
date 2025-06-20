import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Users, UserPlus, UserCheck, TrendingUp, BarChart2, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CustomerReportProps {
  customerMetrics?: {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    average_purchase_frequency: number;
    average_order_value: number;
    customer_retention_rate: number;
  };
  topCustomers?: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    total_spent: number;
    order_count: number;
    last_purchase_date?: string;
    avg_order_value: number;
  }>;
  customerAcquisition?: Array<{
    period: string;
    new_customers: number;
    returning_customers: number;
  }>;
  customerSegments?: Array<{
    segment: string;
    count: number;
    percentage: number;
    total_spent: number;
    avg_order_value: number;
  }>;
  isLoading?: boolean;
  onExport?: () => void;
  className?: string;
}

export const CustomerReports = ({
  customerMetrics,
  topCustomers = [],
  customerAcquisition = [],
  customerSegments = [],
  isLoading = false,
  onExport,
  className = '',
}: CustomerReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getCustomerSegment = (totalSpent: number) => {
    if (totalSpent > 10000) return { label: 'Alto Valor', color: 'bg-purple-500' };
    if (totalSpent > 5000) return { label: 'Médio-Alto Valor', color: 'bg-blue-500' };
    if (totalSpent > 1000) return { label: 'Médio Valor', color: 'bg-green-500' };
    return { label: 'Baixo Valor', color: 'bg-gray-400' };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho e botão de exportação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatório de Clientes</h2>
          <p className="text-muted-foreground">
            Análise do comportamento e valor dos clientes
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
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : customerMetrics?.total_customers.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '--' : customerMetrics?.new_customers}
            </div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : customerMetrics?.customer_retention_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Clientes que retornaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : formatCurrency(customerMetrics?.average_order_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Valor médio por pedido</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Melhores Clientes
            </CardTitle>
            <CardDescription>Clientes que mais gastaram no período</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : topCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de cliente disponível
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total Gasto</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    <TableHead>Última Compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        {customer.email && (
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(customer.total_spent)}
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.order_count}
                      </TableCell>
                      <TableCell>
                        {formatDate(customer.last_purchase_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Segmentação de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              Segmentação de Clientes
            </CardTitle>
            <CardDescription>Distribuição de clientes por valor</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : customerSegments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Dados de segmentação não disponíveis
              </div>
            ) : (
              <div className="space-y-4">
                {customerSegments.map((segment) => {
                  const segmentInfo = getCustomerSegment(segment.avg_order_value);
                  return (
                    <div key={segment.segment} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{segment.segment}</span>
                        <span>{segment.count} clientes ({segment.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className={cn("h-2.5 rounded-full", segmentInfo.color)}
                          style={{ width: `${segment.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ticket médio: {formatCurrency(segment.avg_order_value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aquisição de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Aquisição de Clientes</CardTitle>
          <CardDescription>Novos clientes vs. clientes recorrentes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : customerAcquisition.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Dados de aquisição não disponíveis
            </div>
          ) : (
            <div className="h-64">
              {/* Aqui você pode adicionar um gráfico de linhas ou barras mostrando a aquisição ao longo do tempo */}
              <div className="flex items-center justify-center h-full border rounded-md bg-muted/30">
                <p className="text-muted-foreground">Gráfico de Aquisição de Clientes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
