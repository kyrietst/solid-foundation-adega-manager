/**
 * CustomerEntityCard - Specialized EntityCard for Customers
 * Uses Context7 patterns for type-safe customer-specific functionality
 * Maintains compatibility with existing CustomerCard usage patterns
 */

import React, { useMemo } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Eye, Edit, DollarSign } from 'lucide-react';
import { EntityCard, EntityCardProps, BaseEntityProps } from '../EntityCard';
import { formatCurrency } from '@/core/config/utils';
import { Badge } from '@/shared/ui/primitives/badge';

// Context7 Pattern: Extend base entity for type safety
interface CustomerEntity extends BaseEntityProps {
  email?: string;
  phone?: string;
  address?: string;
  segment?: string;
  lifetime_value?: number;
  first_purchase_date?: string;
  last_purchase_date?: string;
  birthday?: string;
  favorite_category?: string;
}

interface CustomerEntityCardProps {
  customer: CustomerEntity & { id: string; name: string };
  onSelect: (customer: CustomerEntity & { id: string; name: string }) => void;
  onEdit?: (customer: CustomerEntity & { id: string; name: string }) => void;
  canEdit?: boolean;
  variant?: EntityCardProps<CustomerEntity>['variant'];
  size?: EntityCardProps<CustomerEntity>['size'];
  glassEffect?: boolean;
  className?: string;
}

export const CustomerEntityCard: React.FC<CustomerEntityCardProps> = ({
  customer,
  onSelect,
  onEdit,
  canEdit = false,
  variant = 'default',
  size = 'md',
  glassEffect = true,
  className,
}) => {
  // Context7 Pattern: Memoize computed values for performance
  const customerEntity = useMemo<CustomerEntity>(() => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    segment: customer.segment,
    lifetime_value: customer.lifetime_value,
    first_purchase_date: customer.first_purchase_date,
    last_purchase_date: customer.last_purchase_date,
    birthday: customer.birthday,
    favorite_category: customer.favorite_category,
    className,
  }), [customer, className]);

  // Context7 Pattern: Memoize formatted dates to avoid recalculations
  const formattedDates = useMemo(() => {
    const formatDate = (dateString?: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return {
      firstPurchase: formatDate(customerEntity.first_purchase_date),
      lastPurchase: formatDate(customerEntity.last_purchase_date),
      birthday: formatDate(customerEntity.birthday),
    };
  }, [customerEntity.first_purchase_date, customerEntity.last_purchase_date, customerEntity.birthday]);

  // Context7 Pattern: Memoize segment badge configuration
  const segmentBadge = useMemo(() => {
    if (!customerEntity.segment) return null;

    const getSegmentConfig = (segment: string) => {
      switch (segment.toLowerCase()) {
        case 'high_value':
          return { label: 'Alto Valor', className: 'bg-purple-500/20 text-purple-200 border-purple-400/50' };
        case 'regular':
          return { label: 'Regular', className: 'bg-blue-500/20 text-blue-200 border-blue-400/50' };
        case 'occasional':
          return { label: 'Ocasional', className: 'bg-green-500/20 text-green-200 border-green-400/50' };
        case 'new':
          return { label: 'Novo', className: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/50' };
        default:
          return { label: segment, className: 'bg-gray-500/20 text-gray-200 border-gray-400/50' };
      }
    };

    const config = getSegmentConfig(customerEntity.segment);
    return {
      label: config.label,
      variant: 'outline' as const,
      className: config.className,
    };
  }, [customerEntity.segment]);

  // Context7 Pattern: Memoize badges configuration
  const badges = useMemo(() => {
    const badgeList = [];
    if (segmentBadge) {
      badgeList.push(segmentBadge);
    }
    return badgeList;
  }, [segmentBadge]);

  // Context7 Pattern: Memoize fields configuration
  const fields = useMemo(() => {
    const fieldsList = [];

    // Contact information
    if (customerEntity.email) {
      fieldsList.push({
        label: 'Email',
        value: (
          <span className="truncate" title={customerEntity.email}>
            {customerEntity.email}
          </span>
        ),
        icon: Mail,
      });
    }

    if (customerEntity.phone) {
      fieldsList.push({
        label: 'Telefone',
        value: customerEntity.phone,
        icon: Phone,
      });
    }

    if (customerEntity.address) {
      fieldsList.push({
        label: 'Endereço',
        value: (
          <span className="truncate" title={customerEntity.address}>
            {customerEntity.address}
          </span>
        ),
        icon: MapPin,
      });
    }

    // Purchase information
    fieldsList.push({
      label: 'LTV',
      value: (
        <span className="font-semibold text-primary-yellow">
          {formatCurrency(customerEntity.lifetime_value || 0)}
        </span>
      ),
      icon: DollarSign,
      className: 'font-bold',
    });

    fieldsList.push({
      label: 'Primeira compra',
      value: formattedDates.firstPurchase,
      className: 'text-gray-300',
    });

    fieldsList.push({
      label: 'Última compra',
      value: formattedDates.lastPurchase,
      className: 'text-gray-300',
    });

    if (customerEntity.favorite_category) {
      fieldsList.push({
        label: 'Categoria favorita',
        value: (
          <span className="truncate" title={customerEntity.favorite_category}>
            {customerEntity.favorite_category}
          </span>
        ),
        className: 'text-gray-300',
      });
    }

    if (customerEntity.birthday) {
      fieldsList.push({
        label: 'Aniversário',
        value: formattedDates.birthday,
        icon: Calendar,
        className: 'text-gray-300',
      });
    }

    return fieldsList;
  }, [customerEntity, formattedDates]);

  // Context7 Pattern: Memoize actions configuration
  const actions = useMemo(() => {
    const actionsList = [
      {
        icon: Eye,
        label: `Ver detalhes do cliente ${customerEntity.name}`,
        onClick: () => onSelect(customer),
        className: 'hover:bg-primary-yellow/20 text-gray-300 hover:text-primary-yellow',
      }
    ];

    if (canEdit && onEdit) {
      actionsList.push({
        icon: Edit,
        label: `Editar cliente ${customerEntity.name}`,
        onClick: () => onEdit(customer),
        className: 'hover:bg-accent-blue/20 text-gray-300 hover:text-accent-blue',
      });
    }

    return actionsList;
  }, [customerEntity.name, onSelect, customer, canEdit, onEdit]);

  // Context7 Pattern: Custom memo comparison for customer-specific optimization
  const customMemoComparison = useMemo(() => (
    (prevProps: EntityCardProps<CustomerEntity>, nextProps: EntityCardProps<CustomerEntity>) => {
      return prevProps.entity.id === nextProps.entity.id &&
             prevProps.entity.name === nextProps.entity.name &&
             prevProps.entity.segment === nextProps.entity.segment &&
             prevProps.entity.lifetime_value === nextProps.entity.lifetime_value;
    }
  ), []);

  return (
    <EntityCard
      entity={customerEntity}
      variant={variant}
      size={size}
      glassEffect={glassEffect}
      badges={badges}
      fields={fields}
      actions={actions}
      headerIcon={User}
      onSelect={() => onSelect(customer)}
      customMemoComparison={customMemoComparison}
    />
  );
};

export default CustomerEntityCard;