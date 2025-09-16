/**
 * CustomerDataTablePresentation.tsx - Componente de apresentação puro (REFATORADO)
 * Context7 Pattern: Componente focado apenas na apresentação visual
 * Remove toda lógica de estado e dados do componente de UI
 *
 * REFATORAÇÃO APLICADA:
 * - Componente puro sem hooks de dados
 * - Props claramente definidas
 * - Table rendering isolado
 * - Column management na apresentação
 * - Focus na apresentação visual
 *
 * @version 2.0.0 - Presentational Component (Context7)
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/primitives/table";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { SearchBar21st } from "@/shared/ui/thirdparty/search-bar-21st";
import { cn } from "@/core/config/utils";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, RefreshCw } from "lucide-react";
import { CustomerTableRow, TableColumn, TABLE_COLUMNS } from '../types/customer-table.types';
import { CustomerTableRowComponent } from './CustomerTableRowComponent';
import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown';

export interface CustomerDataTablePresentationProps {
  // Table state props
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortColumn: TableColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: TableColumn) => void;

  // Column visibility props
  visibleColumns: Set<TableColumn>;
  onColumnToggle: (column: TableColumn) => void;

  // Data props
  customers: CustomerTableRow[];
  isLoading: boolean;
  error: Error | null;
  completenessData: any;

  // Computed props
  hasCustomers: boolean;
  totalCustomers: number;

  // Handler props
  onCustomerClick: (customerId: string) => void;
  onRefresh: () => void;

  // Configuration props
  className?: string;
}

/**
 * Componente de apresentação puro para Customer Data Table
 * Foca apenas na renderização visual sem lógica de negócio
 */
export const CustomerDataTablePresentation: React.FC<CustomerDataTablePresentationProps> = ({
  searchTerm,
  onSearchChange,
  sortColumn,
  sortDirection,
  onSort,
  visibleColumns,
  onColumnToggle,
  customers,
  isLoading,
  error,
  completenessData,
  hasCustomers,
  totalCustomers,
  onCustomerClick,
  onRefresh,
  className,
}) => {
  // Error State
  if (error) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <div className="text-red-400 mb-4">
          Erro ao carregar dados dos clientes
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with search and controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar21st
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar clientes..."
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <ColumnVisibilityDropdown
            visibleColumns={visibleColumns}
            onColumnToggle={onColumnToggle}
          />

          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Table stats */}
      <div className="text-sm text-gray-400">
        {isLoading ? (
          'Carregando clientes...'
        ) : (
          `${customers.length} de ${totalCustomers} clientes`
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/20 bg-black/40 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              {TABLE_COLUMNS.filter(col => visibleColumns.has(col)).map(column => (
                <TableHead key={column}>
                  <SortableHeader
                    column={column}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableHead>
              ))}
              <TableHead className="w-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingRows visibleColumns={visibleColumns} />
            ) : !hasCustomers ? (
              <EmptyRow visibleColumns={visibleColumns} />
            ) : (
              customers.map((customer) => (
                <CustomerTableRowComponent
                  key={customer.id}
                  customer={customer}
                  visibleColumns={visibleColumns}
                  completenessData={completenessData}
                  onCustomerClick={onCustomerClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

/**
 * Sortable header component
 */
const SortableHeader: React.FC<{
  column: TableColumn;
  sortColumn: TableColumn;
  sortDirection: 'asc' | 'desc';
  onSort: (column: TableColumn) => void;
}> = ({ column, sortColumn, sortDirection, onSort }) => {
  const isSorted = sortColumn === column;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-semibold text-gray-300 hover:text-white"
      onClick={() => onSort(column)}
    >
      {getColumnLabel(column)}
      {isSorted ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );
};

/**
 * Loading rows component
 */
const LoadingRows: React.FC<{ visibleColumns: Set<TableColumn> }> = ({ visibleColumns }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i} className="border-white/10">
        {Array.from(visibleColumns).map(column => (
          <TableCell key={column}>
            <div className="h-4 bg-white/10 rounded animate-pulse" />
          </TableCell>
        ))}
        <TableCell>
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

/**
 * Empty row component
 */
const EmptyRow: React.FC<{ visibleColumns: Set<TableColumn> }> = ({ visibleColumns }) => (
  <TableRow>
    <TableCell colSpan={visibleColumns.size + 1} className="text-center py-8 text-gray-400">
      Nenhum cliente encontrado
    </TableCell>
  </TableRow>
);

/**
 * Get column label for display
 */
const getColumnLabel = (column: TableColumn): string => {
  const labels: Record<TableColumn, string> = {
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    segment: 'Segmento',
    status: 'Status',
    total_spent: 'Gasto Total',
    total_orders: 'Pedidos',
    last_purchase_date: 'Última Compra',
    next_birthday: 'Próximo Aniversário',
    last_contact_date: 'Último Contato',
    payment_method: 'Pagamento Pref.',
    outstanding_amount: 'Pendente',
    profile_completeness: 'Perfil',
    insights_count: 'Insights IA',
  };
  return labels[column] || column;
};