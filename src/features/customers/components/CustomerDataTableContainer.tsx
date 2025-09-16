/**
 * CustomerDataTableContainer.tsx - Container com lógica de negócio (REFATORADO)
 * Context7 Pattern: Container gerencia estado, lógica e dados
 * Separa completamente a lógica de tabela da apresentação visual
 *
 * REFATORAÇÃO APLICADA:
 * - Container/Presentational pattern
 * - Hook especializado para table state
 * - Data computations isoladas
 * - Column management centralizado
 * - Search and sort logic isolada
 *
 * @version 2.0.0 - Container Component (Context7)
 */

import React from 'react';
import { useCustomerTableState } from '../hooks/useCustomerTableState';
import { CustomerDataTablePresentation } from './CustomerDataTablePresentation';
import { TableColumn } from '../types/customer-table.types';

export interface CustomerDataTableContainerProps {
  className?: string;
  initialSearchTerm?: string;
  initialSortColumn?: TableColumn;
  onCustomerSelect?: (customerId: string) => void;
}

/**
 * Container component que gerencia toda a lógica da tabela de clientes
 * Delega a apresentação para CustomerDataTablePresentation
 */
export const CustomerDataTableContainer: React.FC<CustomerDataTableContainerProps> = ({
  className,
  initialSearchTerm,
  initialSortColumn,
  onCustomerSelect,
}) => {
  // Hook especializado para estado da tabela
  const tableState = useCustomerTableState({
    initialSearchTerm,
    initialSortColumn,
  });

  // Handler para seleção de cliente
  const handleCustomerClick = (customerId: string) => {
    onCustomerSelect?.(customerId);
  };

  // Passa todos os dados e handlers para o componente de apresentação
  return (
    <CustomerDataTablePresentation
      // Table state
      searchTerm={tableState.searchTerm}
      onSearchChange={tableState.setSearchTerm}
      sortColumn={tableState.sortColumn}
      sortDirection={tableState.sortDirection}
      onSort={tableState.handleSort}

      // Column visibility
      visibleColumns={tableState.visibleColumns}
      onColumnToggle={tableState.toggleColumn}

      // Data
      customers={tableState.sortedCustomers}
      isLoading={tableState.isLoading}
      error={tableState.error}
      completenessData={tableState.completenessData}

      // Computed values
      hasCustomers={tableState.hasCustomers}
      totalCustomers={tableState.totalCustomers}

      // Handlers
      onCustomerClick={handleCustomerClick}
      onRefresh={tableState.handleRefresh}

      // Configuration
      className={className}
    />
  );
};

// Export do Container como padrão para uso externo
export default CustomerDataTableContainer;