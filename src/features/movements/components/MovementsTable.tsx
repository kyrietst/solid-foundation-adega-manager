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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/primitives/tooltip';
import { Clock, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle, Bike, Store } from 'lucide-react';

interface MovementsTableProps {
  movements: InventoryMovement[];
  productsMap: Record<string, { name: string; price: number }>;
  usersMap: Record<string, string>;
  typeInfo: Record<string, { label: string; color: string }>;
  customers: Customer[];
  salesMap?: Record<string, { delivery_type?: string }>;
  maxRows?: number;
  isLoading?: boolean;
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  productsMap,
  usersMap,
  typeInfo,
  customers,
  salesMap = {},
  maxRows = 100,
  isLoading = false,
}) => {
  const getTypeBadge = (type: string) => {
    const info = typeInfo[type];
    if (!info) {
      return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }

    // Mapear tipos para ícones e estilos visuais claros
    let Icon = RefreshCw;
    let className = "text-xs flex items-center gap-1.5";

    // Entradas (verde)
    if (info.color.includes('green') || type.includes('entrada') || type.includes('purchase') || type.includes('return_from_customer')) {
      Icon = ArrowDownCircle;
      className = "bg-green-500/20 text-green-400 border-green-500/30 text-xs flex items-center gap-1.5";
    }
    // Saídas/Perdas (vermelho)
    else if (info.color.includes('red') || type.includes('saida') || type.includes('sale') || type.includes('loss') || type.includes('damage')) {
      Icon = ArrowUpCircle;
      className = "bg-red-500/20 text-red-400 border-red-500/30 text-xs flex items-center gap-1.5";
    }
    // Ajustes (azul)
    else if (info.color.includes('blue') || type.includes('adjust') || type.includes('correction')) {
      Icon = RefreshCw;
      className = "bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs flex items-center gap-1.5";
    }
    // Alertas/Outros (amarelo)
    else if (info.color.includes('yellow')) {
      Icon = AlertTriangle;
      className = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs flex items-center gap-1.5";
    }

    return (
      <Badge variant="default" className={className}>
        <Icon className="h-3 w-3" />
        {info.label}
      </Badge>
    );
  };

  // Extrai UUID do campo reason (formato: "... Sale #uuid...")
  const extractSaleIdFromReason = (reason: string | null | undefined): string | null => {
    if (!reason) return null;
    // Regex para capturar UUID após "Sale #"
    const match = reason.match(/Sale #([a-f0-9-]{36})/i);
    return match ? match[1] : null;
  };

  // Renderiza ícone de canal de venda (Delivery vs Presencial)
  const getChannelBadge = (movement: InventoryMovement) => {
    // Só mostra para movimentações relacionadas a vendas
    const isSaleRelated = movement.type?.includes('sale') ||
                          movement.reason?.toLowerCase().includes('venda') ||
                          movement.sale_id;

    if (!isSaleRelated) return null;

    // Tentar obter delivery_type de múltiplas fontes:
    // 1. Da relação direta (sales object do Supabase)
    // 2. Do salesMap usando sale_id
    // 3. Do salesMap extraindo ID do reason
    let deliveryType = (movement as any).sales?.delivery_type;

    if (!deliveryType && movement.sale_id) {
      deliveryType = salesMap[movement.sale_id]?.delivery_type;
    }

    if (!deliveryType) {
      const extractedId = extractSaleIdFromReason(movement.reason);
      if (extractedId) {
        deliveryType = salesMap[extractedId]?.delivery_type;
      }
    }

    if (deliveryType === 'delivery') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30">
                <Bike className="h-4 w-4 text-purple-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delivery</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (deliveryType === 'presencial') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                <Store className="h-4 w-4 text-cyan-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Presencial (Balcão)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Se tem sale_id mas não tem delivery_type (dados antigos)
    if (movement.sale_id && !deliveryType) {
      return (
        <span className="text-adega-silver/50 text-xs">-</span>
      );
    }

    return null;
  };

  const columns: DataTableColumn<InventoryMovement>[] = [
    {
      id: 'date',
      label: 'Data',
      accessor: 'date',
      sortable: true,
      width: 'col-lg',
      render: (value) => {
        const date = new Date(value as string);
        const formatted = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) + ' ' + date.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-adega-gold/60" />
            <span className="text-adega-silver text-sm whitespace-nowrap">
              {formatted}
            </span>
          </div>
        );
      },
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
      id: 'channel',
      label: 'Canal',
      accessor: 'sale_id',
      width: 'col-xs',
      align: 'center',
      render: (_, movement) => getChannelBadge(movement),
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