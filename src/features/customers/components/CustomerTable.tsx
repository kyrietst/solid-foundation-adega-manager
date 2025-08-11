/**
 * Componente de visualização em tabela dos clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { CustomerRow } from './CustomerRow';
import { EmptyCustomers } from '@/shared/ui/composite/empty-state';
import { LoadingScreen } from '@/shared/ui/composite/loading-spinner';
import { CustomerTableProps } from '../types/types';
import { useVirtualizedCustomerTable } from '@/hooks/common/useVirtualizedTable';

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onSelectCustomer,
  onEditCustomer,
  canEdit = false,
  isLoading = false,
}) => {
  const { parentRef, virtualItems, totalSize } = useVirtualizedCustomerTable(customers);

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
          {/* Header fixo da tabela */}
          <table className="w-full" role="table" aria-label="Lista de clientes">
            <caption className="sr-only">
              Tabela de clientes com {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'}. 
              Use as setas para navegar e Enter para selecionar.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-white/10 bg-adega-charcoal/30 backdrop-blur-sm">
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Cliente
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Segmento
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Contato
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  LTV
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum" aria-sort="none">
                  Última Compra
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Categoria Favorita
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Tags
                </th>
                <th scope="col" className="text-left p-4 font-medium text-adega-platinum">
                  Ações
                </th>
              </tr>
            </thead>
          </table>
          
          {/* Container virtualizado */}
          <div
            ref={parentRef}
            className="h-[500px] overflow-auto"
            style={{ contain: 'strict' }}
            role="region"
            aria-label="Lista de clientes virtualizados"
            aria-live="polite"
          >
            <div style={{ height: totalSize, position: 'relative' }}>
              <table className="w-full">
                <tbody>
                  {virtualItems.map((virtualItem) => {
                    const customer = customers[virtualItem.index];
                    return (
                      <tr
                        key={customer.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <td colSpan={8} className="p-0">
                          <CustomerRow
                            customer={customer}
                            onSelect={onSelectCustomer}
                            onEdit={onEditCustomer}
                            canEdit={canEdit}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};