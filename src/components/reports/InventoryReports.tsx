import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download, Package, AlertTriangle, PackageCheck, PackageX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface InventoryReportProps {
  inventoryMetrics?: {
    total_products: number;
    out_of_stock: number;
    low_stock: number;
    total_inventory_value: number;
    average_stock_quantity: number;
  };
  stockMovements?: Array<{
    id: string;
    product_name: string;
    type: 'in' | 'out' | 'adjustment' | 'return';
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    created_at: string;
    user_name?: string;
    notes?: string;
  }>;
  lowStockProducts?: Array<{
    id: string;
    name: string;
    category: string;
    current_stock: number;
    min_stock: number;
    max_stock: number;
    last_purchase_date?: string;
  }>;
  isLoading?: boolean;
  onExport?: () => void;
  className?: string;
}

export const InventoryReports = ({
  inventoryMetrics,
  stockMovements = [],
  lowStockProducts = [],
  isLoading = false,
  onExport,
  className = '',
}: InventoryReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMovementType = (type: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'in': { label: 'Entrada', variant: 'default' },
      'out': { label: 'Saída', variant: 'destructive' },
      'adjustment': { label: 'Ajuste', variant: 'secondary' },
      'return': { label: 'Devolução', variant: 'outline' },
    };
    return types[type] || { label: type, variant: 'outline' as const };
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { label: 'Sem Estoque', variant: 'destructive' as const };
    if (current <= min) return { label: 'Estoque Baixo', variant: 'warning' as const };
    return { label: 'Em Estoque', variant: 'success' as const };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho e botão de exportação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatório de Estoque</h2>
          <p className="text-muted-foreground">
            Visão geral do estoque e movimentações
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
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : inventoryMetrics?.total_products.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Falta</CardTitle>
            <PackageX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {isLoading ? '--' : inventoryMetrics?.out_of_stock}
            </div>
            <p className="text-xs text-muted-foreground">Produtos sem estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {isLoading ? '--' : inventoryMetrics?.low_stock}
            </div>
            <p className="text-xs text-muted-foreground">Produtos com estoque crítico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <PackageCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '--' : formatCurrency(inventoryMetrics?.total_inventory_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Valor total em estoque</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos com Estoque Baixo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum produto com estoque baixo
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => {
                    const status = getStockStatus(product.current_stock, product.min_stock);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.category}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          {product.current_stock.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.min_stock.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Últimas Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Últimas Movimentações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : stockMovements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação recente
              </div>
            ) : (
              <div className="space-y-4">
                {stockMovements.map((movement, index) => {
                  const type = getMovementType(movement.type);
                  const isNegative = ['out', 'adjustment'].includes(movement.type);
                  return (
                    <div key={movement.id ?? index} className="flex items-start justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{movement.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(movement.created_at)}
                          {movement.user_name && ` • Por ${movement.user_name}`}
                        </div>
                        {movement.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {movement.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={type.variant} className="mb-1">
                          {type.label}
                        </Badge>
                        <div className={cn(
                          'font-mono font-medium',
                          isNegative ? 'text-destructive' : 'text-green-600'
                        )}>
                          {isNegative ? '-' : '+'}{Math.abs(movement.quantity)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {movement.previous_quantity} → {movement.new_quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
