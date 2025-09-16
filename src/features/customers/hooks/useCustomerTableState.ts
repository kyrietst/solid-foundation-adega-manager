/**
 * useCustomerTableState.ts - Hook especializado para CustomerDataTable (REFATORADO)
 * Context7 Pattern: Separação de lógica de estado da apresentação
 * Extrai toda a lógica de estado e computações do CustomerDataTable
 *
 * REFATORAÇÃO APLICADA:
 * - Table state isolado em hook
 * - Search logic separada
 * - Column visibility management
 * - Sort state centralizado
 * - Data computations isoladas
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import { useState, useMemo, useCallback } from 'react';
import { useCustomerTableData } from './useCustomerTableData';
import { useProfileCompleteness } from './useDataQuality';
import { TABLE_COLUMNS, TableColumn, CustomerTableRow } from '../types/customer-table.types';

export interface UseCustomerTableStateOptions {
  initialSearchTerm?: string;
  initialSortColumn?: TableColumn;
  initialSortDirection?: 'asc' | 'desc';
  initialVisibleColumns?: Set<TableColumn>;
}

export interface UseCustomerTableStateReturn {
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Sort state
  sortColumn: TableColumn;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: TableColumn) => void;

  // Column visibility
  visibleColumns: Set<TableColumn>;
  setVisibleColumns: (columns: Set<TableColumn>) => void;
  toggleColumn: (column: TableColumn) => void;

  // Data
  customers: CustomerTableRow[];
  isLoading: boolean;
  error: Error | null;

  // Completeness data
  completenessData: any;

  // Computed values
  filteredCustomers: CustomerTableRow[];
  sortedCustomers: CustomerTableRow[];
  hasCustomers: boolean;
  totalCustomers: number;

  // Handlers
  handleRefresh: () => void;
}

/**
 * Hook especializado para gerenciar estado da tabela de clientes
 * Separa toda a lógica de estado e computação do componente de UI
 */
export const useCustomerTableState = (options: UseCustomerTableStateOptions = {}): UseCustomerTableStateReturn => {
  const {
    initialSearchTerm = '',
    initialSortColumn = 'name',
    initialSortDirection = 'asc',
    initialVisibleColumns = new Set(TABLE_COLUMNS)
  } = options;

  // Local state
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [sortColumn, setSortColumn] = useState<TableColumn>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [visibleColumns, setVisibleColumns] = useState<Set<TableColumn>>(initialVisibleColumns);

  // Data hooks
  const { data: customers = [], isLoading, error, refetch } = useCustomerTableData();
  const completenessData = useProfileCompleteness();

  // Sort handler
  const handleSort = useCallback((column: TableColumn) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  // Column visibility handlers
  const toggleColumn = useCallback((column: TableColumn) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Computed values
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;

    const lowercaseSearch = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowercaseSearch) ||
      customer.email.toLowerCase().includes(lowercaseSearch) ||
      customer.phone?.toLowerCase().includes(lowercaseSearch) ||
      customer.segment.toLowerCase().includes(lowercaseSearch) ||
      customer.status.toLowerCase().includes(lowercaseSearch)
    );
  }, [customers, searchTerm]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aValue: any = a[sortColumn];
      let bValue: any = b[sortColumn];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCustomers, sortColumn, sortDirection]);

  const hasCustomers = customers.length > 0;
  const totalCustomers = customers.length;

  return {
    // Search state
    searchTerm,
    setSearchTerm,

    // Sort state
    sortColumn,
    sortDirection,
    handleSort,

    // Column visibility
    visibleColumns,
    setVisibleColumns,
    toggleColumn,

    // Data
    customers,
    isLoading,
    error,

    // Completeness data
    completenessData,

    // Computed values
    filteredCustomers,
    sortedCustomers,
    hasCustomers,
    totalCustomers,

    // Handlers
    handleRefresh,
  };
};