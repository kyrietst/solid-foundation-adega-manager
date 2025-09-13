/**
 * Hook unificado para tabelas de dados - elimina duplicação de lógica
 * Centraliza search, sort, column visibility, virtualization e estados
 */

import { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface DataTableColumn<T = any> {
  id: string;
  label: string;
  accessor?: keyof T | ((item: T) => any);
  sortable?: boolean;
  searchable?: boolean;
  visible?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T) => React.ReactNode;
}

export interface UseDataTableConfig<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchFields?: (keyof T)[];
  defaultSortField?: string;
  defaultSortDirection?: 'asc' | 'desc';
  maxRows?: number;
  enableVirtualization?: boolean;
  virtualRowHeight?: number;
  containerHeight?: number;
}

export interface UseDataTableReturn<T> {
  // Data
  processedData: T[];
  originalData: T[];
  totalCount: number;
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Sort
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  setSortField: (field: string | null) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  handleSort: (field: string) => void;
  
  // Column visibility
  visibleColumns: string[];
  setVisibleColumns: (columns: string[]) => void;
  toggleColumnVisibility: (columnId: string) => void;
  allColumns: string[];
  
  // Virtualization
  virtualItems?: any[];
  totalSize?: number;
  parentRef?: React.RefObject<HTMLElement>;
  isVirtualized: boolean;
  
  // States
  isEmpty: boolean;
  hasResults: boolean;
}

export const useDataTable = <T extends Record<string, any>>({
  data,
  columns,
  searchFields,
  defaultSortField = null,
  defaultSortDirection = 'asc',
  maxRows = 1000,
  enableVirtualization = false,
  virtualRowHeight = 50,
  containerHeight = 400
}: UseDataTableConfig<T>): UseDataTableReturn<T> => {
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string | null>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(col => col.visible !== false).map(col => col.id)
  );
  
  const allColumns = useMemo(() => columns.map(col => col.id), [columns]);
  
  // Search logic
  const searchedData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data;
    
    return data.filter(item => {
      // Search in specified fields or all searchable columns
      const fieldsToSearch = searchFields || 
        columns.filter(col => col.searchable !== false).map(col => col.accessor as keyof T);
      
      return fieldsToSearch.some(field => {
        let value: any;
        
        if (typeof field === 'function') {
          value = field(item);
        } else {
          value = item[field];
        }
        
        return String(value || '').toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields, columns]);
  
  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortField) return searchedData;
    
    const column = columns.find(col => col.id === sortField);
    if (!column || column.sortable === false) return searchedData;
    
    return [...searchedData].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      if (column.accessor) {
        if (typeof column.accessor === 'function') {
          aValue = column.accessor(a);
          bValue = column.accessor(b);
        } else {
          aValue = a[column.accessor];
          bValue = b[column.accessor];
        }
      } else {
        aValue = a[column.id as keyof T];
        bValue = b[column.id as keyof T];
      }
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
      if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
      
      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchedData, sortField, sortDirection, columns]);
  
  // Apply row limit
  const processedData = useMemo(() => {
    return sortedData.slice(0, maxRows);
  }, [sortedData, maxRows]);
  
  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };
  
  // Virtualization setup
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = enableVirtualization ? useVirtualizer({
    count: processedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => virtualRowHeight,
    overscan: 5,
  }) : null;
  
  return {
    // Data
    processedData,
    originalData: data,
    totalCount: data.length,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Sort
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    handleSort,
    
    // Column visibility
    visibleColumns,
    setVisibleColumns,
    toggleColumnVisibility,
    allColumns,
    
    // Virtualization
    virtualItems: virtualizer?.getVirtualItems(),
    totalSize: virtualizer?.getTotalSize(),
    parentRef,
    isVirtualized: enableVirtualization,
    
    // States
    isEmpty: data.length === 0,
    hasResults: processedData.length > 0,
  };
};