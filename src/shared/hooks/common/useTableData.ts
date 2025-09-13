/**
 * Hook genérico para tabelas com filtros
 * Pode ser usado em qualquer tabela do sistema
 */

import { useState, useMemo } from 'react';
import { usePagination } from './use-pagination';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
}

export interface TableFilter<T> {
  key: keyof T;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

export interface UseTableDataConfig<T> {
  columns: TableColumn<T>[];
  searchableColumns?: (keyof T)[];
  initialSortColumn?: keyof T;
  initialSortDirection?: 'asc' | 'desc';
  initialItemsPerPage?: number;
  enablePagination?: boolean;
}

export const useTableData = <T extends Record<string, any>>(
  data: T[],
  config: UseTableDataConfig<T>
) => {
  const {
    columns,
    searchableColumns = [],
    initialSortColumn,
    initialSortDirection = 'asc',
    initialItemsPerPage = 10,
    enablePagination = true
  } = config;

  // Estados locais
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | undefined>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
  const [filters, setFilters] = useState<TableFilter<T>[]>([]);

  // Dados filtrados
  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar busca textual
    if (searchTerm && searchableColumns.length > 0) {
      result = result.filter(item => {
        return searchableColumns.some(column => {
          const value = item[column];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Aplicar filtros
    filters.forEach(filter => {
      result = result.filter(item => {
        const value = item[filter.key];
        const filterValue = filter.value;

        switch (filter.operator || 'equals') {
          case 'equals':
            return value === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filterValue);
          case 'lessThan':
            return Number(value) < Number(filterValue);
          default:
            return true;
        }
      });
    });

    return result;
  }, [data, searchTerm, searchableColumns, filters]);

  // Dados ordenados
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      let comparison = 0;
      
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginação (opcional)
  const pagination = usePagination(
    enablePagination ? sortedData : [],
    {
      initialItemsPerPage,
      resetOnItemsChange: true
    }
  );

  // Dados finais (com ou sem paginação)
  const finalData = enablePagination ? pagination.paginatedItems : sortedData;

  // Handlers
  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilter = (filter: TableFilter<T>) => {
    setFilters(prev => {
      const existingIndex = prev.findIndex(f => f.key === filter.key);
      if (existingIndex >= 0) {
        // Atualizar filtro existente
        const newFilters = [...prev];
        newFilters[existingIndex] = filter;
        return newFilters;
      } else {
        // Adicionar novo filtro
        return [...prev, filter];
      }
    });
  };

  const removeFilter = (key: keyof T) => {
    setFilters(prev => prev.filter(f => f.key !== key));
  };

  const clearFilters = () => {
    setFilters([]);
    setSearchTerm('');
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    // Dados processados
    data: finalData,
    originalData: data,
    filteredData,
    sortedData,

    // Estados
    searchTerm,
    sortColumn,
    sortDirection,
    filters,

    // Estatísticas
    totalItems: data.length,
    filteredCount: filteredData.length,
    hasFilters: filters.length > 0 || searchTerm !== '',

    // Paginação (se habilitada)
    ...(enablePagination && {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      itemsPerPage: pagination.itemsPerPage,
      goToPage: pagination.goToPage,
      setItemsPerPage: pagination.setItemsPerPage,
    }),

    // Ações
    setSearchTerm,
    handleSort,
    handleFilter,
    removeFilter,
    clearFilters,
    clearSearch,

    // Configuração
    columns,
    config,
  };
};