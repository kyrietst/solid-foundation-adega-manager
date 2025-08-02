/**
 * Componente de visualização em tabela dos clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerRow } from './CustomerRow';
import { EmptyCustomers } from '@/components/ui/empty-state';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { CustomerTableProps } from './types';

export const CustomerTable: React.FC<CustomerTableProps> = ({
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
    <Card className="bg-adega-charcoal/20 border-white/10">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-adega-charcoal/30">
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Cliente
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Segmento
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Contato
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  LTV
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Última Compra
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Categoria Favorita
                </th>
                <th className="text-left p-4 font-medium text-adega-platinum">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onSelect={onSelectCustomer}
                  onEdit={onEditCustomer}
                  canEdit={canEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};