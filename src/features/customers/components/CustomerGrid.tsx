/**
 * Componente de visualização em grid dos clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import React from 'react';
import { CustomerCard } from './CustomerCard';
import { EmptyCustomers } from '@/shared/ui/composite/empty-state';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { CustomerGridProps } from './types';

export const CustomerGrid: React.FC<CustomerGridProps> = ({
  customers,
  onSelectCustomer,
  onEditCustomer,
  canEdit = false,
  isLoading = false,
}) => {
  if (isLoading) {
    return <LoadingScreen text="Carregando clientes..." />;
  }

  if (customers.length === 0) {
    return <EmptyCustomers />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onSelect={onSelectCustomer}
          onEdit={onEditCustomer}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
};