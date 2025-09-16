/**
 * CustomerSearchContainer.tsx - Container com lógica de negócio (REFATORADO)
 * Context7 Pattern: Container gerencia estado, lógica e dados
 * Separa completamente a lógica de busca da apresentação visual
 *
 * REFATORAÇÃO APLICADA:
 * - Container/Presentational pattern
 * - Hook especializado para busca
 * - Estados de popover gerenciados
 * - Search logic isolada
 * - Debounce strategy centralizada
 *
 * @version 2.0.0 - Container Component (Context7)
 */

import React from 'react';
import { CustomerProfile } from '@/features/customers/hooks/use-crm';
import { useCustomerSearchData } from '../hooks/useCustomerSearchData';
import { CustomerSearchPresentation } from './CustomerSearchPresentation';

export interface CustomerSearchContainerProps {
  selectedCustomer: CustomerProfile | null;
  onSelect: (customer: CustomerProfile | null) => void;
  onAddNew?: () => void;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  className?: string;
}

/**
 * Container component que gerencia toda a lógica de busca de clientes
 * Delega a apresentação para CustomerSearchPresentation
 */
export const CustomerSearchContainer: React.FC<CustomerSearchContainerProps> = ({
  selectedCustomer,
  onSelect,
  onAddNew,
  variant = 'default',
  glassEffect = true,
  className = '',
}) => {
  // Hook especializado para busca de clientes
  const searchData = useCustomerSearchData({
    enabled: true,
    limit: 50,
    debounceMs: 300,
  });

  // Handler para seleção de cliente
  const handleSelect = (customer: CustomerProfile) => {
    searchData.handleSelect(customer, onSelect);
  };

  // Passa todos os dados e handlers para o componente de apresentação
  return (
    <CustomerSearchPresentation
      // Data props
      customers={searchData.customers}
      isLoading={searchData.isLoading}
      error={searchData.error}
      hasCustomers={searchData.hasCustomers}
      shouldShowEmpty={searchData.shouldShowEmpty}

      // Search state props
      searchTerm={searchData.searchTerm}
      onSearchTermChange={searchData.setSearchTerm}

      // Popover state props
      open={searchData.open}
      onOpenChange={searchData.setOpen}

      // Selection props
      selectedCustomer={selectedCustomer}
      onSelect={handleSelect}

      // Configuration props
      onAddNew={onAddNew}
      variant={variant}
      glassEffect={glassEffect}
      className={className}
    />
  );
};

// Export do Container como padrão para uso externo
export default CustomerSearchContainer;