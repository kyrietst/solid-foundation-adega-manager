import { useState, useMemo, useCallback } from 'react';
import { 
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  ColumnSort,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  ColumnResizeMode,
  ColumnOrderState,
  VisibilityState,
  ColumnPinningState,
  ExpandedState,
  getExpandedRowModel,
  ExpandedState,
  Row,
  Table as TableType,
} from '@tanstack/react-table';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableFooter 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown,
  EyeOff,
  GripVertical,
  Filter,
  X,
  Download,
  MoreHorizontal,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Columns3,
  Rows3,
  Pin,
  PinOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onRowClick?: (row: Row<TData>) => void;
  onSelectionChange?: (selected: TData[]) => void;
  onSortingChange?: (sorting: ColumnSort[]) => void;
  defaultSorting?: ColumnSort[];
  defaultColumnVisibility?: VisibilityState;
  defaultColumnOrder?: string[];
  defaultColumnPinning?: ColumnPinningState;
  columnResizeMode?: ColumnResizeMode;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  enableSorting?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: Row<TData>) => string);
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: React.ReactNode;
  onExport?: (rows: TData[], format: 'csv' | 'xlsx' | 'pdf') => void;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
  getRowCanExpand?: (row: Row<TData>) => boolean;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isError = false,
  error = null,
  onRowClick,
  onSelectionChange,
  onSortingChange,
  defaultSorting = [],
  defaultColumnVisibility = {},
  defaultColumnOrder = [],
  defaultColumnPinning = { left: [], right: [] },
  columnResizeMode = 'onChange',
  enableRowSelection = false,
  enableMultiRowSelection = true,
  enableSorting = true,
  enableColumnResizing = true,
  enableColumnReordering = true,
  enableColumnVisibility = true,
  enablePagination = true,
  enableGlobalFilter = true,
  enableColumnFilters = true,
  pageSizeOptions = [10, 20, 30, 50, 100],
  defaultPageSize = 10,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = '',
  emptyState = null,
  loadingState = null,
  errorState = null,
  onExport,
  renderSubComponent,
  getRowCanExpand,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility);
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(defaultColumnOrder);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(defaultColumnPinning);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });
  const [columnResizeModeState, setColumnResizeMode] = useState<ColumnResizeMode>(columnResizeMode);
  const [isFilterOpen, setIsFilterOpen] = useState<string | null>(null);

  // Memoize columns para evitar recriação desnecessária
  const memoizedColumns = useMemo<ColumnDef<TData, TValue>[]>(
    () => columns,
    [columns]
  );

  // Configuração da tabela
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      columnVisibility,
      columnOrder,
      columnPinning,
      expanded,
      pagination,
      columnResizeMode: columnResizeModeState,
    },
    enableRowSelection,
    enableMultiRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onExpandedChange: setExpanded,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getExpandedRowModel: renderSubComponent ? getExpandedRowModel() : undefined,
    getRowCanExpand,
    manualPagination: !enablePagination,
    autoResetPageIndex: false,
    enableColumnResizing,
    columnResizeMode: columnResizeModeState,
    debugTable: process.env.NODE_ENV === 'development',
    debugHeaders: process.env.NODE_ENV === 'development',
    debugColumns: process.env.NODE_ENV === 'development',
  });

  // Notificar mudanças na seleção
  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map(row => row.original);
  }, [rowSelection]);

  // Efeito para notificar mudanças na seleção
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectedRows, onSelectionChange]);

  // Renderizar o estado de carregamento
  if (isLoading) {
    return loadingState || (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <Skeleton className="h-10 w-full" />
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mt-2" />
        ))}
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-8 w-[150px]" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }

  // Renderizar o estado de erro
  if (isError) {
    return errorState || (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-destructive/10">
        <div className="text-destructive text-lg font-medium mb-2">
          Ocorreu um erro ao carregar os dados
        </div>
        {error && (
          <div className="text-muted-foreground text-sm mb-4">
            {error.message}
          </div>
        )}
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Renderizar o estado vazio
  if (data.length === 0 && !isLoading) {
    return emptyState || (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <div className="text-muted-foreground text-lg">
          Nenhum dado encontrado
        </div>
        <p className="text-muted-foreground text-sm mt-2">
          Tente ajustar seus filtros ou adicionar novos dados.
        </p>
      </div>
    );
  }

  // Função para renderizar o conteúdo da célula do cabeçalho
  const renderHeaderCell = (header: any) => {
    return (
      <div 
        className={cn(
          'flex items-center justify-between font-medium',
          header.column.getCanSort() && 'cursor-pointer select-none',
        )}
        onClick={header.column.getToggleSortingHandler()}
      >
        <div className="truncate">
          {flexRender(
            header.column.columnDef.header,
            header.getContext()
          )}
        </div>
        {header.column.getCanSort() && (
          <span className="ml-2">
            {{
              asc: <ChevronUp className="h-4 w-4" />,
              desc: <ChevronDown className="h-4 w-4" />,
            }[header.column.getIsSorted() as string] ?? (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        )}
      </div>
    );
  };

  // Função para renderizar o menu de colunas
  const renderColumnVisibilityMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-9">
          <Columns3 className="mr-2 h-4 w-4" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table.getAllLeafColumns()
          .filter(column => column.getCanHide())
          .map(column => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={value => column.toggleVisibility(!!value)}
            >
              {column.columnDef.header?.toString() || column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Função para renderizar o menu de exportação
  const renderExportMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2 h-9">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Exportar dados</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport?.(data, 'csv')}>
          <span>CSV (.csv)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport?.(data, 'xlsx')}>
          <span>Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport?.(data, 'pdf')}>
          <span>PDF (.pdf)</span>
        </DropdownMenuItem>
        {selectedRows.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Exportar selecionados</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onExport?.(selectedRows, 'csv')}>
              <span>CSV selecionados</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.(selectedRows, 'xlsx')}>
              <span>Excel selecionados</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Função para renderizar a paginação
  const renderPagination = () => (
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} de{' '}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s)
          </span>
        ) : (
          <span>
            Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} itens
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Ir para a primeira página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center text-sm font-medium">
            {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Ir para a última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barra de ferramentas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {enableGlobalFilter && (
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 w-full sm:w-[300px]"
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          {enableColumnVisibility && renderColumnVisibilityMenu()}
          {onExport && renderExportMenu()}
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table className="relative">
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={cn(
                      'relative group',
                      header.column.getCanSort() && 'cursor-pointer',
                      header.column.getIsPinned() && 'sticky bg-background',
                      header.column.getIsPinned() === 'left' && 'left-0 z-10',
                      header.column.getIsPinned() === 'right' && 'right-0 z-10',
                    )}
                    style={{
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    <div className="flex items-center">
                      {header.column.getCanSort() ? (
                        <div className="flex items-center">
                          {renderHeaderCell(header)}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                      
                      {header.column.getCanFilter() && (
                        <DropdownMenu
                          open={isFilterOpen === header.id}
                          onOpenChange={(open) => {
                            if (open) {
                              setIsFilterOpen(header.id);
                            } else {
                              setIsFilterOpen(null);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn(
                                'h-6 w-6 p-0 ml-1 opacity-0 group-hover:opacity-100',
                                header.column.getIsFiltered() && 'opacity-100 text-primary'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFilterOpen(isFilterOpen === header.id ? null : header.id);
                              }}
                            >
                              <Filter className="h-3.5 w-3.5" />
                              <span className="sr-only">Filtrar</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuLabel>Filtrar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="p-2">
                              <Input
                                placeholder={`Filtrar ${header.column.columnDef.header?.toString()?.toLowerCase() || 'coluna'}`}
                                value={(header.column.getFilterValue() as string) ?? ''}
                                onChange={(e) => {
                                  header.column.setFilterValue(e.target.value);
                                }}
                                className="h-8"
                              />
                            </div>
                            {header.column.getIsFiltered() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                                onClick={() => {
                                  header.column.setFilterValue('');
                                  setIsFilterOpen(null);
                                }}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Limpar filtro
                              </Button>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      {enableColumnReordering && (
                        <div
                          className={cn(
                            'h-4 w-1 bg-border rounded-full cursor-move opacity-0 group-hover:opacity-100',
                            header.column.getIsPinned() && 'opacity-100',
                          )}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                        >
                          <span className="sr-only">Reordenar coluna</span>
                        </div>
                      )}
                      
                      {enableColumnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            'absolute right-0 top-0 h-full w-1 bg-border cursor-col-resize select-none touch-none',
                            'opacity-0 group-hover:opacity-100',
                            header.column.getIsResizing() && 'opacity-100 bg-primary'
                          )}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody className={bodyClassName}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    typeof rowClassName === 'function' ? rowClassName(row) : rowClassName,
                    row.getIsSelected() && 'bg-muted/50',
                    onRowClick && 'cursor-pointer hover:bg-muted/50',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        cell.column.getIsPinned() && 'sticky bg-background',
                        cell.column.getIsPinned() === 'left' && 'left-0 z-10',
                        cell.column.getIsPinned() === 'right' && 'right-0 z-10',
                      )}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      {enablePagination && renderPagination()}
    </div>
  );
}

// Componente auxiliar para renderizar uma célula com menu de ações
export function DataTableRowActions<TData>({
  row,
  actions,
}: {
  row: Row<TData>;
  actions: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (row: Row<TData>) => void;
    isDestructive?: boolean;
    disabled?: boolean;
  }>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={cn(
              'cursor-pointer',
              action.isDestructive && 'text-destructive',
              action.disabled && 'opacity-50 pointer-events-none'
            )}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Componente auxiliar para renderizar uma célula com status
export function DataTableStatusCell({
  status,
  variant = 'default',
  icon: Icon,
  className = '',
}: {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  icon?: React.ElementType;
  className?: string;
}) {
  const variantClasses = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
      variantClasses[variant],
      className
    )}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {status}
    </div>
  );
}
