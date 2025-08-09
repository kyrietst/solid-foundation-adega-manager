/**
 * DataTable - Componente base para tabelas de dados
 * Tabela genérica com sorting, filtros, paginação e glass morphism
 * Enhanced with virtualization support for large datasets (925+ records)
 */

import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses, getTableClasses, getGlassInputClasses } from '@/core/config/theme-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/primitives/table';
import { SearchInput } from '@/shared/ui/composite/search-input';
import { PaginationControls } from '@/shared/ui/composite/pagination-controls';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { EmptyState } from '@/shared/ui/composite/empty-state';
import { FilterToggle } from '@/shared/ui/composite/filter-toggle';
import { Button } from '@/shared/ui/primitives/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: Error | null;
  
  // Glass Morphism & Theme
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  virtualization?: boolean;
  
  // Virtualization options
  virtualizationThreshold?: number; // Auto-enable virtualization above this row count
  rowHeight?: number; // Fixed row height for virtualization
  overscan?: number; // Number of items to render outside visible area
  
  // Sorting
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  
  // Search & Filters
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  
  // Row Selection
  selectedRows?: string[];
  onRowSelect?: (id: string) => void;
  onSelectAll?: (selected: boolean) => void;
  rowIdField?: string;
  
  // Row Actions
  onRowClick?: (item: T) => void;
  rowActions?: (item: T) => React.ReactNode;
  
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  
  // Empty States
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  
  // Styling
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

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
  
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortKey === columnKey && sortDirection === 'asc') {
      direction = 'desc';
    }
    
    onSort(columnKey, direction);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-yellow" />
      : <ArrowDown className="w-4 h-4 text-primary-yellow" />;
  };

  const renderCellValue = (column: TableColumn<T>, item: T, index: number) => {
    const value = (item as Record<string, unknown>)[column.key];
    
    if (column.render) {
      return column.render(value, item, index);
    }
    
    return value;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      {(onSearchChange || filters) && (
        <div className={cn(
          'flex flex-col sm:flex-row gap-4 p-4 rounded-lg',
          glassEffect ? getGlassCardClasses(variant) : 'bg-gray-900/20 border border-gray-700/30'
        )}>
          {/* Search Input */}
          {onSearchChange && (
            <div className="flex-1">
              <SearchInput
                value={searchValue || ''}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          
          {/* Filter Toggle */}
          {filters && (
            <FilterToggle
              isOpen={showFilters}
              onToggle={onToggleFilters}
              label="Filtros"
            />
          )}
        </div>
      )}

      {/* Filters Panel */}
      {filters && showFilters && (
        <div className={cn(
          'rounded-lg p-6 transition-all duration-300 shadow-lg',
          glassEffect 
            ? cn(getGlassCardClasses(variant), 'border-primary-yellow/30 bg-gray-900/40') 
            : 'bg-gray-800/60 border border-gray-600/40'
        )}>
          <div className="space-y-4">
            {filters}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={cn(glassClasses, 'rounded-lg overflow-hidden border border-gray-700/50')}>
        {shouldVirtualize ? (
          // Virtualized Table for large datasets
          <div
            ref={parentRef}
            className="h-96 overflow-auto"
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
              {/* Fixed Header */}
              <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
                <Table className={cn(tableClasses.container, className)}>
                  <TableHeader className={tableClasses.header}>
                    <TableRow className="border-b border-gray-700/50">
                      {/* Select All Checkbox */}
                      {onSelectAll && (
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={data.length > 0 && selectedRows.length === data.length}
                            onChange={(e) => onSelectAll(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                      )}
                      
                      {/* Column Headers */}
                      {columns.map((column) => (
                        <TableHead
                          key={column.key}
                          className={cn(
                            tableClasses.headerCell,
                            column.className,
                            column.width && `w-[${column.width}]`,
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            compact && 'py-2'
                          )}
                        >
                          {column.sortable && onSort ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 font-medium hover:bg-gray-800/60 text-gray-300 hover:text-primary-yellow transition-colors duration-200"
                              onClick={() => handleSort(column.key)}
                            >
                              <span>{column.title}</span>
                              {getSortIcon(column.key)}
                            </Button>
                          ) : (
                            <span className="text-gray-300 font-medium">{column.title}</span>
                          )}
                        </TableHead>
                      ))}
                      
                      {/* Actions Column */}
                      {rowActions && (
                        <TableHead className="w-12">
                          <span className="sr-only">Ações</span>
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

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
                  const isSelected = selectedRows.includes(rowId);
                  
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
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
                                  onChange={() => onRowSelect(rowId)}
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
                              >
                                {renderCellValue(column, item, virtualRow.index)}
                              </TableCell>
                            ))}
                            
                            {/* Row Actions */}
                            {rowActions && (
                              <TableCell className="w-12">
                                <div onClick={(e) => e.stopPropagation()}>
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
          <Table className={cn(tableClasses.container, className)}>
            <TableHeader className={tableClasses.header}>
              <TableRow className="border-b border-gray-700/50">
                {/* Select All Checkbox */}
                {onSelectAll && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={data.length > 0 && selectedRows.length === data.length}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                
                {/* Column Headers */}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      tableClasses.headerCell,
                      column.className,
                      column.width && `w-[${column.width}]`,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      compact && 'py-2'
                    )}
                  >
                    {column.sortable && onSort ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium hover:bg-gray-800/60 text-gray-300 hover:text-primary-yellow transition-colors duration-200"
                        onClick={() => handleSort(column.key)}
                      >
                        <span>{column.title}</span>
                        {getSortIcon(column.key)}
                      </Button>
                    ) : (
                      <span className="text-gray-300 font-medium">{column.title}</span>
                    )}
                  </TableHead>
                ))}
                
                {/* Actions Column */}
                {rowActions && (
                  <TableHead className="w-12">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            
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
                  const isSelected = selectedRows.includes(rowId);
                  
                  return (
                    <TableRow
                      key={rowId || index}
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
                            onChange={() => onRowSelect(rowId)}
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
                        >
                          {renderCellValue(column, item, index)}
                        </TableCell>
                      ))}
                      
                      {/* Row Actions */}
                      {rowActions && (
                        <TableCell className="w-12">
                          <div onClick={(e) => e.stopPropagation()}>
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