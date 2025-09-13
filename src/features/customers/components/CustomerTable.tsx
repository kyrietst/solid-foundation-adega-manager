/**
 * Componente de visualização em tabela dos clientes
 * Migrado para usar DataTable unificado com virtualização
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Eye, Edit, Phone, Mail } from 'lucide-react';
import { DataTable } from '@/shared/ui/composite/DataTable';
import { DataTableColumn } from '@/shared/hooks/common/useDataTable';
import { formatCurrency } from '@/core/config/utils';
import { CustomerTableProps } from '../types/types';
import { CustomerProfile } from '../hooks/use-crm';
import { CustomerSegmentBadge } from './CustomerSegmentBadge';
import { CustomerTagDisplay } from './CustomerTagDisplay';

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onSelectCustomer,
  onEditCustomer,
  canEdit = false,
  isLoading = false,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatContact = (customer: CustomerProfile) => {
    const contacts = [];
    if (customer.email) contacts.push(customer.email);
    if (customer.phone) contacts.push(customer.phone);
    return contacts.length > 0 ? contacts.join(', ') : '-';
  };

  const columns: DataTableColumn<CustomerProfile>[] = [
    {
      id: 'name',
      label: 'Cliente',
      accessor: 'name',
      searchable: true,
      width: '200px',
      render: (_, customer) => (
        <div>
          <div className="font-medium text-adega-platinum">{customer.name}</div>
          <div className="text-sm text-adega-platinum/60">
            ID: {customer.id.slice(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      id: 'segment',
      label: 'Segmento',
      accessor: 'segment',
      searchable: true,
      width: '120px',
      render: (_, customer) => (
        <CustomerSegmentBadge segment={customer.segment || ''} />
      ),
    },
    {
      id: 'contact',
      label: 'Contato',
      accessor: (customer) => formatContact(customer),
      searchable: true,
      width: '220px',
      render: (_, customer) => (
        <div className="space-y-1">
          {customer.email && (
            <div className="flex items-center gap-1 text-sm text-adega-platinum/80">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[150px]" title={customer.email}>
                {customer.email}
              </span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm text-adega-platinum/80">
              <Phone className="h-3 w-3" />
              <span>{customer.phone}</span>
            </div>
          )}
          {!customer.email && !customer.phone && (
            <span className="text-sm text-adega-platinum/40">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'lifetime_value',
      label: 'LTV',
      accessor: 'lifetime_value',
      width: '120px',
      align: 'right',
      render: (value) => (
        <span className="font-semibold text-adega-gold">
          {formatCurrency(value || 0)}
        </span>
      ),
    },
    {
      id: 'last_purchase_date',
      label: 'Última Compra',
      accessor: 'last_purchase_date',
      width: '140px',
      render: (value) => (
        <span className="text-adega-platinum/80">
          {formatDate(value)}
        </span>
      ),
    },
    {
      id: 'favorite_category',
      label: 'Categoria Favorita',
      accessor: 'favorite_category',
      width: '160px',
      render: (value) => (
        <span className="text-adega-platinum/60">
          {value || '-'}
        </span>
      ),
    },
    {
      id: 'tags',
      label: 'Tags',
      accessor: (customer: CustomerProfile & { tags?: string[] | string }) => customer.tags,
      searchable: false,
      sortable: false,
      width: '200px',
      render: (_, customer: CustomerProfile & { tags?: string[] | string }) => (
        <div className="max-w-[200px]">
          <CustomerTagDisplay tags={customer.tags} maxVisible={2} size="sm" />
        </div>
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      accessor: () => '',
      searchable: false,
      sortable: false,
      width: '100px',
      render: (_, customer) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectCustomer(customer)}
            className="h-8 w-8 p-0 hover:bg-adega-gold/20"
            aria-label={`Ver detalhes do cliente ${customer.name}`}
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
          </Button>
          {canEdit && onEditCustomer && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditCustomer(customer)}
              className="h-8 w-8 p-0 hover:bg-blue-500/20 text-blue-400"
              aria-label={`Editar cliente ${customer.name}`}
            >
              <Edit className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable<CustomerProfile>
      data={customers}
      columns={columns}
      loading={isLoading}
      empty={{
        title: 'Nenhum cliente encontrado',
        description: 'Não há clientes para exibir',
      }}
      searchPlaceholder="Buscar clientes..."
      searchFields={['name', 'email', 'phone', 'segment', 'favorite_category']}
      defaultSortField="name"
      enableVirtualization={true}
      virtualRowHeight={80}
      containerHeight={500}
      caption="Lista de clientes com informações de contato e histórico"
      className="bg-adega-charcoal/20 border-white/10"
    />
  );
};