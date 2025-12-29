/**
 * DataTable - Componente base para tabelas de dados
 * Tabela genérica com sorting, filtros, paginação e glass morphism
 * Enhanced with virtualization support for large datasets (925+ records)
 * 
 * Refatorado para usar sub-componentes (Toolbar, Header)
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getTableClasses } from '@/core/config/theme-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/ui/primitives/table';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { EmptyState } from '@/shared/ui/composite/empty-state';

// Sub-components
import { DataTableToolbar } from './datatable/DataTableToolbar';
import { DataTableHeader } from './datatable/DataTableHeader';
import { DataTableProps, TableColumn } from './datatable/types';

// Exporting types for consumers
export type { DataTableProps, TableColumn };

export function DataTable<T = Record<string, unknown>>({
  data,
  columns,
  loading = false,
  error = null,
  variant = 'premium',
  glassEffect = true,
  virtualization = false,
  virtualizationThreshold = 50,
  rowHeight = 60,
  overscan = 5,
  sortKey,
  sortDirection,
  onSort,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  showFilters = false,
  onToggleFilters,
  selectedRows = [],
  onRowSelect,
  onSelectAll,
  rowIdField = 'id',
  onRowClick,
  rowActions,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  itemsPerPageOptions,
  onItemsPerPageChange,
  emptyTitle = 'Nenhum item encontrado',
  emptyDescription = 'Não há itens para exibir no momento.',
  emptyIcon,
  emptyAction,
  className,
  striped = true,
  hoverable = true,
  compact = false
}: DataTableProps<T>) {

  const parentRef = useRef<HTMLDivElement>(null);
  const tableClasses = getTableClasses();
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  // Auto-enable virtualization for large datasets
  const shouldVirtualize = virtualization || data.length >= virtualizationThreshold;

  // Setup virtualization
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: overscan,
    enabled: shouldVirtualize,
  });

  const renderCellValue = (column: TableColumn<T>, item: T, index: number): React.ReactNode => {
    const value = (item as Record<string, unknown>)[column.key];

    if (column.render) {
      return column.render(value, item, index);
    }

    return value as React.ReactNode;
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  return (
    <div className="space-y-4">

      {/* Search and Filters via Toolbar */}
      <DataTableToolbar
        onSearchChange={onSearchChange}
        searchValue={searchValue}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        glassEffect={glassEffect}
        variant={variant}
      />

      {/* Table */}
      <div className={cn(glassClasses, 'rounded-lg overflow-hidden border border-gray-700/50')}>
        {shouldVirtualize ? (
          // Virtualized Table for large datasets
          <div
            ref={parentRef}
            className="h-[calc(100vh-420px)] overflow-auto"
            style={{
              contain: 'strict',
            }}
          >
            <div
              style={{
                height: rowVirtualizer.getTotalSize(),
                width: '100%',
                position: 'relative',
              }}
            >
              <DataTableHeader
                columns={columns}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onSort={onSort}
                onSelectAll={onSelectAll}
                isAllSelected={isAllSelected}
                hasRowActions={!!rowActions}
                compact={compact}
                tableClasses={tableClasses}
                className={className}
              />

              {/* Virtualized Rows */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <p className="text-destructive font-medium">Erro ao carregar dados</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                  </div>
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    action={emptyAction}
                  />
                </div>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = data[virtualRow.index];
                  const rowId = (item as Record<string, unknown>)[rowIdField];
                  const isSelected = selectedRows.includes(rowId as string);

                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start + 60}px)`,
                      }}
                    >
                      <Table className={cn(tableClasses.container, className)}>
                        <TableBody>
                          <TableRow
                            className={cn(
                              tableClasses.row,
                              hoverable && onRowClick && 'cursor-pointer hover:bg-gray-800/80',
                              striped && virtualRow.index % 2 === 0 && 'bg-gray-900/60',
                              isSelected && 'bg-primary-yellow/10 border-l-2 border-primary-yellow'
                            )}
                            onClick={() => onRowClick?.(item)}
                          >
                            {/* Row Selection */}
                            {onRowSelect && (
                              <TableCell className="w-12">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => onRowSelect(rowId as string)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="rounded border-gray-300"
                                />
                              </TableCell>
                            )}

                            {/* Data Cells */}
                            {columns.map((column) => (
                              <TableCell
                                key={column.key}
                                className={cn(
                                  tableClasses.cell,
                                  column.className,
                                  column.align === 'center' && 'text-center',
                                  column.align === 'right' && 'text-right',
                                  compact && 'py-2'
                                )}
                                style={column.width ? {
                                  width: column.width,
                                  minWidth: column.width,
                                  maxWidth: column.width,
                                } : undefined}
                              >
                                {renderCellValue(column, item, virtualRow.index)}
                              </TableCell>
                            ))}

                            {/* Row Actions */}
                            {rowActions && (
                              <TableCell className="w-12">
                                <div
                                  role="presentation"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {rowActions(item)}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // Standard Table for small datasets
          <div className="w-full">
            <DataTableHeader
              columns={columns}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={onSort}
              onSelectAll={onSelectAll}
              isAllSelected={isAllSelected}
              hasRowActions={!!rowActions}
              compact={compact}
              tableClasses={tableClasses}
              className={className}
            />

            <Table className={cn(tableClasses.container, className)}>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (onSelectAll ? 1 : 0) + (rowActions ? 1 : 0)}>
                      <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="lg" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (onSelectAll ? 1 : 0) + (rowActions ? 1 : 0)}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-2">
                          <p className="text-destructive font-medium">Erro ao carregar dados</p>
                          <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (onSelectAll ? 1 : 0) + (rowActions ? 1 : 0)}>
                      <div className="flex items-center justify-center py-12">
                        <EmptyState
                          title={emptyTitle}
                          description={emptyDescription}
                          icon={emptyIcon}
                          action={emptyAction}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, index) => {
                    const rowId = (item as Record<string, unknown>)[rowIdField];
                    const isSelected = selectedRows.includes(rowId as string);

                    return (
                      <TableRow
                        key={(rowId as string) || index}
                        className={cn(
                          tableClasses.row,
                          hoverable && onRowClick && 'cursor-pointer hover:bg-gray-800/80',
                          striped && index % 2 === 0 && 'bg-gray-900/60',
                          isSelected && 'bg-primary-yellow/10 border-l-2 border-primary-yellow'
                        )}
                        onClick={() => onRowClick?.(item)}
                      >
                        {/* Row Selection */}
                        {onRowSelect && (
                          <TableCell className="w-12">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onRowSelect(rowId as string)}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                        )}

                        {/* Data Cells */}
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={cn(
                              tableClasses.cell,
                              column.className,
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              compact && 'py-2'
                            )}
                            style={column.width ? {
                              width: column.width,
                              minWidth: column.width,
                              maxWidth: column.width,
                            } : undefined}
                          >
                            {renderCellValue(column, item, index)}
                          </TableCell>
                        ))}

                        {/* Row Actions */}
                        {rowActions && (
                          <TableCell className="w-12">
                            <div
                              role="presentation"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {rowActions(item)}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex justify-center mt-6">
          <PaginationControls
            currentPage={currentPage || 1}
            totalPages={totalPages}
            onPageChange={onPageChange}
            itemsPerPage={itemsPerPage}
            itemsPerPageOptions={itemsPerPageOptions}
            onItemsPerPageChange={onItemsPerPageChange}
            variant="premium"
            glassEffect={glassEffect}
          />
        </div>
      )}
    </div>
  );
}