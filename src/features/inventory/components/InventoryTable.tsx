/**
 * Componente de visualização em tabela dos produtos
 * Migrado para usar DataTable unificado com virtualização
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Edit, Trash2, Package } from 'lucide-react';
import { DataTable } from '@/shared/ui/composite/DataTable';
import { DataTableColumn } from '@/shared/hooks/common/useDataTable';
import { formatCurrency } from '@/core/config/utils';
import { InventoryTableProps } from '../types/types';
import { Product } from '@/core/types/database';
import { Badge } from '@/shared/ui/primitives/badge';
import { cn } from '@/core/config/utils';

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  canDeleteProduct,
  isLoading = false,
}) => {
  const getTurnoverBadge = (rate?: number) => {
    if (!rate) return <Badge variant="secondary" className="text-xs">-</Badge>;

    if (rate >= 6) return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Rápido</Badge>;
    if (rate >= 3) return <Badge variant="default" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Médio</Badge>;
    return <Badge variant="default" className="bg-red-500/20 text-red-400 border-red-500/30">Lento</Badge>;
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current <= 0) return { color: 'text-red-400', status: 'Sem estoque' };
    if (current <= minimum) return { color: 'text-yellow-400', status: 'Baixo estoque' };
    return { color: 'text-green-400', status: 'Normal' };
  };

  const columns: DataTableColumn<Product>[] = [
    {
      id: 'name',
      label: 'Produto',
      accessor: 'name',
      searchable: true,
      sortable: true,
      width: '250px',
      render: (_, product) => (
        <div className="flex items-center gap-3">
          <div className="bg-adega-gold/20 border border-adega-gold/30 rounded-lg p-2 flex-shrink-0">
            <Package className="h-4 w-4 text-adega-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-adega-platinum truncate">{product.name}</p>
            <p className="text-sm text-adega-platinum/60 truncate">{product.category || '-'}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'price',
      label: 'Preço',
      accessor: 'price',
      sortable: true,
      width: '120px',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-adega-gold">
          {formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      id: 'stock_quantity',
      label: 'Estoque',
      accessor: 'stock_quantity',
      sortable: true,
      width: '120px',
      align: 'center',
      render: (_, product) => {
        const status = getStockStatus(product.stock_quantity || 0, product.minimum_stock || 0);
        return (
          <div className="text-center">
            <div className={cn("font-semibold", status.color)}>
              {product.stock_quantity || 0}
            </div>
            <div className="text-xs text-adega-platinum/50">{status.status}</div>
          </div>
        );
      },
    },
    {
      id: 'minimum_stock',
      label: 'Mínimo',
      accessor: 'minimum_stock',
      sortable: true,
      width: '80px',
      align: 'center',
      render: (value) => (
        <span className="text-adega-platinum/70">{value || '-'}</span>
      ),
    },
    {
      id: 'turnover_rate',
      label: 'Giro',
      accessor: 'turnover_rate',
      sortable: true,
      width: '100px',
      align: 'center',
      render: (_, product) => getTurnoverBadge(product.turnover_rate),
    },
    {
      id: 'supplier',
      label: 'Fornecedor',
      accessor: 'supplier',
      searchable: true,
      sortable: true,
      width: '150px',
      render: (value) => (
        <span className="text-adega-platinum/80 truncate block" title={value as string}>
          {value || '-'}
        </span>
      ),
    },
    {
      id: 'barcode',
      label: 'Código',
      accessor: 'barcode',
      searchable: true,
      width: '120px',
      render: (value) => (
        <span className="font-mono text-sm text-adega-platinum/60">
          {value || '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      width: '120px',
      align: 'center',
      render: (_, product) => (
        <div className="flex items-center gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditProduct(product)}
            className="hover:bg-adega-gold/20 text-adega-gold hover:text-adega-gold"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {canDeleteProduct && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteProduct(product.id)}
              className="hover:bg-red-500/20 text-red-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    }
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      loading={isLoading}
      searchPlaceholder="Buscar produtos..."
      emptyTitle="Nenhum produto encontrado"
      emptyDescription="Não há produtos cadastrados no sistema."
      emptyIcon={<Package className="h-12 w-12 text-adega-gold/50" />}
      virtualization={true}
      virtualizationThreshold={50}
      rowHeight={80}
      glassEffect={true}
      variant="premium"
      className="bg-adega-charcoal/20 border-white/10"
    />
  );
};