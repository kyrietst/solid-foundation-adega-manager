/**
 * useCustomerSearchData.ts - Hook especializado para Customer Search (REFATORADO)
 * Context7 Pattern: Separação de lógica de negócio do componente de apresentação
 * Extrai toda a lógica de busca e gerenciamento de estado do CustomerSearch
 *
 * REFATORAÇÃO APLICADA:
 * - Business logic isolada em hook
 * - Debounce logic separada
 * - Estado de popover gerenciado
 * - Callbacks estabilizados
 * - Real-time search otimizada
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import { useState, useEffect, useCallback } from 'react';
import { useCustomers, CustomerProfile } from '@/features/customers/hooks/use-crm';
import { useDebounce } from '@/shared/hooks/common/use-debounce';

export interface UseCustomerSearchDataOptions {
  enabled?: boolean;
  limit?: number;
  debounceMs?: number;
}

export interface UseCustomerSearchDataReturn {
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  debouncedSearchTerm: string;

  // Popover state
  open: boolean;
  setOpen: (open: boolean) => void;

  // Data
  customers: CustomerProfile[];
  isLoading: boolean;
  error: Error | null;

  // Handlers
  handleSelect: (customer: CustomerProfile, onSelect: (customer: CustomerProfile | null) => void) => void;
  handleRefresh: () => void;

  // Computed values
  hasCustomers: boolean;
  shouldShowEmpty: boolean;
}

/**
 * Hook especializado para gerenciar busca de clientes
 * Separa toda a lógica de estado e dados do componente de UI
 */
export const useCustomerSearchData = (options: UseCustomerSearchDataOptions = {}): UseCustomerSearchDataReturn => {
  const { enabled = true, limit = 50, debounceMs = 300 } = options;

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Data fetching
  const { data: customers = [], isLoading, error, refetch } = useCustomers({
    search: debouncedSearchTerm,
    limit,
    enabled,
  });

  // Stable refetch handler
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // When the popover opens, ensure fresh data
  useEffect(() => {
    if (open) {
      handleRefresh();
    }
  }, [open, handleRefresh]);

  // Selection handler
  const handleSelect = useCallback((
    customer: CustomerProfile,
    onSelect: (customer: CustomerProfile | null) => void
  ) => {
    onSelect(customer);
    setOpen(false);
    setSearchTerm('');
  }, []);

  // Computed values
  const hasCustomers = customers.length > 0;
  const shouldShowEmpty = !isLoading && !hasCustomers;

  return {
    // Search state
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,

    // Popover state
    open,
    setOpen,

    // Data
    customers,
    isLoading,
    error,

    // Handlers
    handleSelect,
    handleRefresh,

    // Computed values
    hasCustomers,
    shouldShowEmpty,
  };
};