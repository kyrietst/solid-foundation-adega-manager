/**
 * Componente linha da tabela de cliente
 * Extraído do CustomersNew.tsx para reutilização
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Eye, Edit, Phone, Mail } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';
import { CustomerRowProps } from './types';
import { CustomerSegmentBadge } from './CustomerSegmentBadge';
import { CustomerTagDisplay } from './CustomerTagDisplay';

export const CustomerRow: React.FC<CustomerRowProps> = ({
  customer,
  onSelect,
  onEdit,
  canEdit = false,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatContact = () => {
    const contacts = [];
    if (customer.email) contacts.push(customer.email);
    if (customer.phone) contacts.push(customer.phone);
    return contacts.length > 0 ? contacts.join(', ') : '-';
  };

  return (
    <tr className="border-b border-white/10 hover:bg-adega-charcoal/20 transition-colors">
      {/* Nome do Cliente */}
      <td className="p-4">
        <div>
          <div className="font-medium text-adega-platinum">{customer.name}</div>
          <div className="text-sm text-adega-platinum/60">
            ID: {customer.id.slice(0, 8)}...
          </div>
        </div>
      </td>

      {/* Segmento */}
      <td className="p-4">
        <CustomerSegmentBadge segment={customer.segment || ''} />
      </td>

      {/* Contato */}
      <td className="p-4">
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
      </td>

      {/* LTV */}
      <td className="p-4">
        <span className="font-semibold text-adega-gold">
          {formatCurrency(customer.lifetime_value || 0)}
        </span>
      </td>

      {/* Última Compra */}
      <td className="p-4">
        <span className="text-adega-platinum/80">
          {formatDate(customer.last_purchase_date)}
        </span>
      </td>

      {/* Categoria Favorita */}
      <td className="p-4">
        <span className="text-adega-platinum/60">
          {customer.favorite_category || '-'}
        </span>
      </td>

      {/* Tags */}
      <td className="p-4">
        <div className="max-w-[200px]">
          <CustomerTagDisplay tags={customer.tags} maxVisible={2} size="sm" />
        </div>
      </td>

      {/* Ações */}
      <td className="p-4">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(customer)}
            className="h-8 w-8 p-0 hover:bg-adega-gold/20"
            aria-label={`Ver detalhes do cliente ${customer.name}`}
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
          </Button>
          {canEdit && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(customer)}
              className="h-8 w-8 p-0 hover:bg-blue-500/20 text-blue-400"
              aria-label={`Editar cliente ${customer.name}`}
            >
              <Edit className="h-3 w-3" aria-hidden="true" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};