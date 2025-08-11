/**
 * Componente de visualização em tabela dos produtos
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/primitives/dropdown-menu';
import { Button } from '@/shared/ui/primitives/button';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ProductRow } from './ProductRow';
import { EmptyProducts } from '@/shared/ui/composite/empty-state';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { InventoryTableProps } from '../types/types';
import { useVirtualizedProductTable } from '@/hooks/common/useVirtualizedTable';

type SortField = 'name' | 'price' | 'stock_quantity' | 'minimum_stock' | 'turnover_rate' | 'supplier' | 'barcode' | null;
type SortDirection = 'asc' | 'desc';

const ALL_COLUMNS = [
  'Produto',
  'Preço',
  'Estoque',
  'Mínimo',
  'Giro',
  'Fornecedor',
  'Código',
  'Ações'
] as const;

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  onEditProduct,
  onDeleteProduct,
  canDeleteProduct,
  isLoading = false,
}) => {
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([...ALL_COLUMNS]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const filteredAndSorted = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = term
      ? products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          (p.category as unknown as string)?.toLowerCase?.().includes(term) ||
          (p.supplier || '')?.toLowerCase?.().includes(term) ||
          (p.barcode || '').toLowerCase().includes(term)
        )
      : products;

    if (sortField) {
      rows = [...rows].sort((a, b) => {
        let av: any = (a as any)[sortField!];
        let bv: any = (b as any)[sortField!];
        if (av == null) return sortDirection === 'asc' ? 1 : -1;
        if (bv == null) return sortDirection === 'asc' ? -1 : 1;
        if (typeof av === 'string' && typeof bv === 'string') {
          av = av.toLowerCase();
          bv = bv.toLowerCase();
          return sortDirection === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDirection === 'asc' ? av - bv : bv - av;
        }
        return 0;
      });
    }
    return rows;
  }, [products, searchTerm, sortField, sortDirection]);

  const { parentRef, virtualItems, totalSize } = useVirtualizedProductTable(filteredAndSorted);

  const toggleColumn = (label: string) => {
    setVisibleColumns(prev => prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  if (isLoading) {
    return <LoadingScreen text="Carregando produtos..." />;
  }

  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardContent className="p-0">
        <div className="space-y-4 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80">
              <SearchBar21st
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={setSearchTerm}
                debounceMs={150}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-adega-platinum/70">
              <span>{filteredAndSorted.length} de {products.length} produtos</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">Colunas</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {ALL_COLUMNS.map(col => (
                    <DropdownMenuCheckboxItem
                      key={col}
                      checked={visibleColumns.includes(col)}
                      onCheckedChange={() => toggleColumn(col)}
                    >
                      {col}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Header fixo da tabela */}
          <table className="w-full" role="table" aria-label="Lista de produtos do estoque">
            <caption className="sr-only">
              Tabela de produtos com {products.length} {products.length === 1 ? 'produto' : 'produtos'}. 
              Inclui informações sobre preço, estoque e giro. Use as setas para navegar.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/10 bg-adega-charcoal/30 backdrop-blur-sm">
                {visibleColumns.includes('Produto') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('name')}>
                      Produto {sortIcon('name')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Preço') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('price')}>
                      Preço {sortIcon('price')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Estoque') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('stock_quantity')}>
                      Estoque {sortIcon('stock_quantity')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Mínimo') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('minimum_stock')}>
                      Mínimo {sortIcon('minimum_stock')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Giro') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('turnover_rate')}>
                      Giro {sortIcon('turnover_rate')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Fornecedor') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('supplier')}>
                      Fornecedor {sortIcon('supplier')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Código') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                    <button className="inline-flex items-center gap-2" onClick={() => handleSort('barcode')}>
                      Código {sortIcon('barcode')}
                    </button>
                  </th>
                )}
                {visibleColumns.includes('Ações') && (
                  <th scope="col" className="text-left p-4 font-medium text-adega-platinum">Ações</th>
                )}
              </tr>
            </thead>
          </table>
          
          {/* Container virtualizado */}
          <div
            ref={parentRef}
            className="h-[400px] overflow-auto"
            style={{ contain: 'strict' }}
            role="region"
            aria-label="Lista de produtos virtualizados"
            aria-live="polite"
          >
            <div style={{ height: totalSize, position: 'relative' }}>
              <table className="w-full">
                <tbody>
                  {virtualItems.map((virtualItem) => {
                    const product = filteredAndSorted[virtualItem.index];
                    return (
                      <tr
                        key={product.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <td colSpan={8} className="p-0">
                          <ProductRow
                            product={product}
                            onEdit={onEditProduct}
                            onDelete={onDeleteProduct}
                            canDelete={canDeleteProduct}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};