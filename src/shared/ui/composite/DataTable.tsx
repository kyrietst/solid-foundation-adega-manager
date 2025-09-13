/**
 * Componente de tabela genérico e reutilizável
 * Elimina duplicação de código entre CustomerTable, InventoryTable, MovementsTable, etc.
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/shared/ui/primitives/dropdown-menu';
import { SearchBar21st } from '@/shared/ui/thirdparty/search-bar-21st';
import { ArrowUpDown, ArrowUp, ArrowDown, Settings2 } from 'lucide-react';
import { LoadingScreen } from './loading-spinner';
import { EmptyState } from './empty-state';
import { useDataTable, DataTableColumn } from '@/shared/hooks/common/useDataTable';
import { cn } from '@/core/config/utils';

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  empty?: {
    title?: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  searchPlaceholder?: string;
  searchFields?: (keyof T)[];
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  maxRows?: number;
  enableVirtualization?: boolean;
  virtualRowHeight?: number;
  containerHeight?: number;
  className?: string;
  tableClassName?: string;
  caption?: string;
}

export const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  empty,
  searchPlaceholder = 'Buscar...',
  searchFields,
  defaultSortField,
  defaultSortDirection = 'asc',
  maxRows = 1000,
  enableVirtualization = false,
  virtualRowHeight = 50,
  containerHeight = 400,
  className,
  tableClassName,
  caption,
}: DataTableProps<T>) => {
  const {
    processedData,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    visibleColumns,
    toggleColumnVisibility,
    allColumns,
    isEmpty,
    hasResults,
    virtualItems,
    totalSize,
    parentRef,
    isVirtualized,
  } = useDataTable({
    data,
    columns,
    searchFields,
    defaultSortField,
    defaultSortDirection,
    maxRows,
    enableVirtualization,
    virtualRowHeight,
    containerHeight,
  });

  // Loading state
  if (loading) {
    return <LoadingScreen text="Carregando..." />;
  }

  // Empty state
  if (isEmpty) {
    return (
      <EmptyState
        title={empty?.title || 'Nenhum item encontrado'}
        description={empty?.description || 'Não há dados para exibir'}
        icon={empty?.icon}
      />
    );
  }

  // Filter visible columns for rendering
  const visibleColumnConfigs = columns.filter(col => visibleColumns.includes(col.id));

  return (
    <Card className={cn('bg-adega-charcoal/20 border-white/10', className)}>
      <CardContent className="p-0">
        {/* Controls: Search and Column Visibility */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <SearchBar21st
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {allColumns.map(columnId => {
                const column = columns.find(col => col.id === columnId);
                return (
                  <DropdownMenuCheckboxItem
                    key={columnId}
                    checked={visibleColumns.includes(columnId)}
                    onCheckedChange={() => toggleColumnVisibility(columnId)}
                  >
                    {column?.label || columnId}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* No Results State */}
        {!hasResults && searchTerm && (
          <div className="p-8 text-center">
            <p className="text-gray-400">
              Nenhum resultado encontrado para "{searchTerm}"
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              Limpar busca
            </Button>
          </div>
        )}

        {/* Table */}
        {hasResults && (
          <div className="overflow-x-auto">
            {isVirtualized ? (
              /* Virtualized Table */
              <div>
                {/* Header */}
                <table 
                  className={cn('w-full', tableClassName)}
                  role="table"
                  aria-label={caption}
                >
                  {caption && (
                    <caption className="sr-only">
                      {caption}
                    </caption>
                  )}
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-white/10 bg-adega-charcoal/30 backdrop-blur-sm">
                      {visibleColumnConfigs.map(column => (
                        <th
                          key={column.id}
                          scope="col"
                          className={cn(
                            'p-4 font-medium text-adega-platinum',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.sortable !== false && 'cursor-pointer hover:bg-white/5 transition-colors'
                          )}
                          style={{ width: column.width }}
                          onClick={column.sortable !== false ? () => handleSort(column.id) : undefined}
                        >
                          <div className="flex items-center gap-2">
                            <span>{column.label}</span>
                            {column.sortable !== false && (
                              <div className="flex flex-col">
                                {sortField === column.id ? (
                                  sortDirection === 'asc' ? (
                                    <ArrowUp className="h-3 w-3" />
                                  ) : (
                                    <ArrowDown className="h-3 w-3" />
                                  )
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 opacity-50" />
                                )}
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>

                {/* Virtualized Body */}
                <div
                  ref={parentRef}
                  style={{ height: `${containerHeight}px`, overflow: 'auto' }}
                  className="relative"
                >
                  <div style={{ height: `${totalSize}px`, position: 'relative' }}>
                    <table className={cn('w-full', tableClassName)}>
                      <tbody>
                        {virtualItems?.map((virtualRow) => {
                          const item = processedData[virtualRow.index];
                          return (
                            <tr
                              key={virtualRow.index}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              {visibleColumnConfigs.map(column => {
                                let cellValue: unknown;
                                
                                // Get cell value
                                if (column.accessor) {
                                  if (typeof column.accessor === 'function') {
                                    cellValue = column.accessor(item);
                                  } else {
                                    cellValue = item[column.accessor];
                                  }
                                } else {
                                  cellValue = item[column.id];
                                }
                                
                                // Render cell
                                const cellContent = column.render 
                                  ? column.render(cellValue, item)
                                  : String(cellValue || '');

                                return (
                                  <td
                                    key={`${virtualRow.index}-${column.id}`}
                                    className={cn(
                                      'p-4 text-gray-200',
                                      column.align === 'center' && 'text-center',
                                      column.align === 'right' && 'text-right'
                                    )}
                                    style={{ width: column.width }}
                                  >
                                    {cellContent}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Table */
              <table 
                className={cn('w-full', tableClassName)}
                role="table"
                aria-label={caption}
              >
                {caption && (
                  <caption className="sr-only">
                    {caption}
                  </caption>
                )}
                
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-white/10 bg-adega-charcoal/30 backdrop-blur-sm">
                    {visibleColumnConfigs.map(column => (
                      <th
                        key={column.id}
                        scope="col"
                        className={cn(
                          'p-4 font-medium text-adega-platinum',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sortable !== false && 'cursor-pointer hover:bg-white/5 transition-colors'
                        )}
                        style={{ width: column.width }}
                        onClick={column.sortable !== false ? () => handleSort(column.id) : undefined}
                      >
                        <div className="flex items-center gap-2">
                          <span>{column.label}</span>
                          {column.sortable !== false && (
                            <div className="flex flex-col">
                              {sortField === column.id ? (
                                sortDirection === 'asc' ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                )
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {processedData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      {visibleColumnConfigs.map(column => {
                        let cellValue: unknown;
                        
                        // Get cell value
                        if (column.accessor) {
                          if (typeof column.accessor === 'function') {
                            cellValue = column.accessor(item);
                          } else {
                            cellValue = item[column.accessor];
                          }
                        } else {
                          cellValue = item[column.id];
                        }
                        
                        // Render cell
                        const cellContent = column.render 
                          ? column.render(cellValue, item)
                          : String(cellValue || '');

                        return (
                          <td
                            key={`${index}-${column.id}`}
                            className={cn(
                              'p-4 text-gray-200',
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right'
                            )}
                          >
                            {cellContent}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Results info */}
        {hasResults && (
          <div className="p-4 border-t border-white/10 text-sm text-gray-400 flex justify-between">
            <span>
              {processedData.length} de {data.length} {data.length === 1 ? 'item' : 'itens'}
              {searchTerm && ` encontrados para "${searchTerm}"`}
            </span>
            {processedData.length >= maxRows && (
              <span className="text-primary-yellow">
                Mostrando primeiros {maxRows} resultados
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};