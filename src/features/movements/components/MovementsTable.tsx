/**
 * Tabela de movimentações
 * Migrado para usar DataTable unificado com virtualização
 */

import React from 'react';
import { DataTable } from '@/shared/ui/composite/DataTable';
import { DataTableColumn } from '@/shared/hooks/common/useDataTable';
import { InventoryMovement } from '@/core/types/inventory.types';
import { Customer } from '@/features/movements/hooks/useMovements';
import { Badge } from '@/shared/ui/primitives/badge';
import { Clock } from 'lucide-react';

interface MovementsTableProps {
  movements: InventoryMovement[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;
  customers: Customer[];
  maxRows?: number;
  isLoading?: boolean;
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  productsMap,
  usersMap,
  typeInfo,
  customers,
  maxRows = 100,
  isLoading = false,
}) => {
  const getTypeBadge = (type: string) => {
    const info = typeInfo[type];
    if (!info) {
      return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }

    // Mapear cores CSS para variantes do Badge
    const variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let className = "text-xs";

    if (info.color.includes('green')) {
      className = "bg-green-500/20 text-green-400 border-green-500/30 text-xs";
    } else if (info.color.includes('red')) {
      className = "bg-red-500/20 text-red-400 border-red-500/30 text-xs";
    } else if (info.color.includes('blue')) {
      className = "bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs";
    } else if (info.color.includes('yellow')) {
      className = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs";
    }

    return (
      <Badge variant={variant} className={className}>
        {info.label}
      </Badge>
    );
  };

  const columns: DataTableColumn<InventoryMovement>[] = [
    {
      id: 'date',
      label: 'Data',
      accessor: 'date',
      sortable: true,
      width: 'col-lg',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-adega-gold/60" />
          <span className="text-adega-silver text-sm">
            {new Date(value as string).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      ),
    },
    {
      id: 'type',
      label: 'Tipo',
      accessor: 'type',
      sortable: true,
      width: 'col-sm',
      render: (_, movement) => getTypeBadge(movement.type),
    },
    {
      id: 'product_id',
      label: 'Produto',
      accessor: 'product_id',
      searchable: true,
      sortable: true,
      width: 'col-3xl',
      render: (_, movement) => (
        <div className="min-w-0">
          <p className="font-medium text-adega-platinum truncate" title={productsMap[movement.product_id]?.name ?? movement.product_id}>
            {productsMap[movement.product_id]?.name ?? movement.product_id}
          </p>
        </div>
      ),
    },
    {
      id: 'quantity',
      label: 'Quantidade',
      accessor: 'quantity',
      sortable: true,
      width: 'col-sm',
      align: 'center',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      id: 'reason',
      label: 'Motivo',
      accessor: 'reason',
      searchable: true,
      sortable: true,
      width: 'col-xl',
      render: (value) => (
        <span className="text-adega-silver text-sm truncate block" title={value as string || '-'}>
          {value || '-'}
        </span>
      ),
    },
    {
      id: 'customer_id',
      label: 'Cliente',
      accessor: 'customer_id',
      searchable: true,
      sortable: true,
      width: 'col-xl',
      render: (_, movement) => {
        const customer = customers.find(c => c.id === movement.customer_id);
        return (
          <span className="text-adega-silver text-sm truncate block" title={customer?.name ?? '-'}>
            {customer?.name ?? '-'}
          </span>
        );
      },
    },
    {
      id: 'user_id',
      label: 'Responsável',
      accessor: 'user_id',
      searchable: true,
      sortable: true,
      width: 'col-md',
      render: (_, movement) => (
        <span className="text-adega-silver text-sm truncate block" title={usersMap[movement.user_id] ?? movement.user_id}>
          {usersMap[movement.user_id] ?? movement.user_id}
        </span>
      ),
    }
  ];

  return (
    <DataTable
      data={movements}
      columns={columns}
      loading={isLoading}
      searchPlaceholder="Buscar por produto, usuário, cliente ou motivo..."
      emptyTitle="Nenhuma movimentação encontrada"
      emptyDescription="Não há movimentações de estoque registradas."
      emptyIcon={<Clock className="h-12 w-12 text-adega-gold/50" />}
      virtualization={true}
      virtualizationThreshold={100}
      rowHeight={60}
      glassEffect={true}
      variant="premium"
      className="bg-adega-charcoal/20 border-white/10"
      defaultSort={{ field: 'date', direction: 'desc' }}
    />
  );
};