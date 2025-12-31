/**
 * Componente de Histórico de Movimentações de Inventário
 * Implementa SPRINT 3 - Tarefa 3.3.1-3.3.4
 * Baseado na documentação docs/limpeza/prompt.md
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/core/api/supabase/client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/primitives/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { Badge } from '@/shared/ui/primitives/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/shared/ui/primitives/tooltip';
import { Button } from '@/shared/ui/primitives/button';

import {
  Info,
  Download,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { cn } from '@/core/config/utils';

interface InventoryMovementsHistoryProps {
  product_id?: string;
  className?: string;
}

interface MovementFilters {
  type: string;
  period: string;
  user_id: string;
}

const MOVEMENT_TYPE_LABELS = {
  sale: 'Venda',
  initial_stock: 'Estoque Inicial',
  inventory_adjustment: 'Ajuste',
  return: 'Devolução',
  stock_transfer_out: 'Transferência Saída',
  stock_transfer_in: 'Transferência Entrada',
  personal_consumption: 'Consumo Próprio'
};

const MOVEMENT_TYPE_ICONS = {
  sale: Package,
  initial_stock: TrendingUp,
  inventory_adjustment: RotateCcw,
  return: TrendingUp,
  stock_transfer_out: TrendingDown,
  stock_transfer_in: TrendingUp,
  personal_consumption: TrendingDown
};

const getMovementTypeVariant = (type: string) => {
  switch (type) {
    case 'sale':
    case 'stock_transfer_out':
    case 'personal_consumption':
      return 'destructive';
    case 'initial_stock':
    case 'return':
    case 'stock_transfer_in':
      return 'default';
    case 'inventory_adjustment':
      return 'secondary';
    default:
      return 'outline';
  }
};

import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { SectionFallback } from '@/shared/components/SectionFallback';

export const InventoryMovementsHistory: React.FC<InventoryMovementsHistoryProps> = ({
  product_id,
  className
}) => {
  return (
    <ErrorBoundary
      fallback={
        <SectionFallback
          title="Histórico Indisponível"
          onRetry={() => window.location.reload()}
        />
      }
    >
      <InventoryMovementsHistoryContent product_id={product_id} className={className} />
    </ErrorBoundary>
  );
};

const InventoryMovementsHistoryContent: React.FC<InventoryMovementsHistoryProps> = ({
  product_id,
  className
}) => {
  const [filters, setFilters] = useState<MovementFilters>({
    type: '',
    period: '30d',
    user_id: ''
  });

  // Query para buscar movimentações
  const { data: movements, isLoading, error } = useQuery({
    queryKey: ['inventory_movements', product_id, filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          product:products!inner (
            name,
            units_per_package
          ),
          user:profiles (
            name
          )
        `)
        .order('date', { ascending: false });

      // Filtro por produto específico
      if (product_id) {
        query = query.eq('product_id' as any, product_id as any);
      }

      // Filtro por tipo
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type' as any, filters.type as any);
      }

      // Filtro por período
      if (filters.period !== 'all') {
        const days = parseInt(filters.period.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('date', startDate.toISOString());
      }

      // Filtro por usuário
      if (filters.user_id && filters.user_id !== 'all') {
        query = query.eq('user_id' as any, filters.user_id as any);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Query para buscar usuários para o filtro
  const { data: users } = useQuery({
    queryKey: ['users_for_filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return (data as any[]) || [];
    }
  });

  // Handler para export (placeholder)
  const handleExport = () => {
    // TODO: Implementar export de relatórios
  };

  return (
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              Histórico de Movimentações
              {product_id && (
                <Badge variant="outline" className="ml-2">
                  Produto específico
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({ ...filters, type: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de movimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.period}
              onValueChange={(value) => setFilters({ ...filters, period: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.user_id}
              onValueChange={(value) => setFilters({ ...filters, user_id: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || 'Usuário sem nome'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de movimentações */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  {!product_id && <TableHead>Produto</TableHead>}
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Quantidade</TableHead>
                  <TableHead className="text-center">Estoque Anterior</TableHead>
                  <TableHead className="text-center">Estoque Novo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-center">Metadados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={product_id ? 8 : 9} className="text-center py-8">
                      Carregando movimentações...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={product_id ? 8 : 9} className="text-center py-8 text-red-600">
                      Erro ao carregar movimentações: {error.message}
                    </TableCell>
                  </TableRow>
                ) : !movements || movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={product_id ? 8 : 9} className="text-center py-8 text-muted-foreground">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => {
                    const MovementIcon = MOVEMENT_TYPE_ICONS[movement.type as keyof typeof MOVEMENT_TYPE_ICONS] || Package;

                    return (
                      <TableRow key={movement.id}>
                        <TableCell className="font-mono text-xs">
                          {format(new Date(movement.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>

                        {!product_id && (
                          <TableCell className="font-medium">
                            {movement.product?.name || 'Produto removido'}
                          </TableCell>
                        )}

                        <TableCell>
                          <Badge
                            variant={getMovementTypeVariant(movement.type)}
                            className="flex items-center gap-1 w-fit"
                          >
                            <MovementIcon className="h-3 w-3" />
                            {MOVEMENT_TYPE_LABELS[movement.type as keyof typeof MOVEMENT_TYPE_LABELS] || movement.type}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center font-mono">
                          <span
                            className={cn(
                              "font-bold",
                              movement.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                            )}
                          >
                            {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                          </span>
                        </TableCell>

                        <TableCell className="text-center font-mono">
                          {movement.new_stock_quantity - movement.quantity_change}
                        </TableCell>

                        <TableCell className="text-center font-mono font-bold">
                          {movement.new_stock_quantity}
                        </TableCell>

                        <TableCell>
                          {movement.user?.name || 'Sistema'}
                        </TableCell>

                        <TableCell className="max-w-xs truncate">
                          {movement.reason || 'Sem motivo especificado'}
                        </TableCell>

                        <TableCell className="text-center">
                          {movement.metadata && Object.keys(movement.metadata).length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <pre className="text-xs whitespace-pre-wrap">
                                  {JSON.stringify(movement.metadata, null, 2)}
                                </pre>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Estatísticas resumidas */}
          {movements && movements.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-green-700 font-bold text-lg">
                  {movements.filter(m => m.quantity_change > 0).reduce((sum, m) => sum + m.quantity_change, 0)}
                </div>
                <div className="text-xs text-green-600">Total Entradas</div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div className="text-red-700 font-bold text-lg">
                  {Math.abs(movements.filter(m => m.quantity_change < 0).reduce((sum, m) => sum + m.quantity_change, 0))}
                </div>
                <div className="text-xs text-red-600">Total Saídas</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-blue-700 font-bold text-lg">
                  {movements.filter(m => m.type === 'sale').length}
                </div>
                <div className="text-xs text-blue-600">Vendas</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="text-yellow-700 font-bold text-lg">
                  {movements.filter(m => m.type === 'inventory_adjustment').length}
                </div>
                <div className="text-xs text-yellow-600">Ajustes</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default InventoryMovementsHistory;