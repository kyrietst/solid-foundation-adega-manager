/**
 * SupplierEntityCard - Specialized EntityCard for Suppliers
 * Uses Context7 patterns for type-safe supplier-specific functionality
 * Maintains compatibility with existing SupplierCard usage patterns
 */

import React, { useMemo } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { EntityCard, EntityCardProps, BaseEntityProps } from '../EntityCard';
import { formatCurrency } from '@/core/config/utils';
import { Badge } from '@/shared/ui/primitives/badge';

// Context7 Pattern: Extend base entity for type safety
interface SupplierEntity extends BaseEntityProps {
  company_name: string;
  is_active: boolean;
  contact_info?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  products_supplied?: string[];
  delivery_time?: string;
  minimum_order_value: number;
  payment_methods?: string[];
  notes?: string;
}

interface SupplierEntityCardProps {
  supplier: SupplierEntity & { id: string };
  onEdit?: (supplier: SupplierEntity & { id: string }) => void;
  onDelete?: (supplier: SupplierEntity & { id: string }) => void;
  onToggleStatus?: (supplier: SupplierEntity & { id: string }) => void;
  userRole?: string;
  variant?: EntityCardProps<SupplierEntity>['variant'];
  size?: EntityCardProps<SupplierEntity>['size'];
  glassEffect?: boolean;
  className?: string;
}

export const SupplierEntityCard: React.FC<SupplierEntityCardProps> = ({
  supplier,
  onEdit,
  onDelete,
  onToggleStatus,
  userRole,
  variant = 'default',
  size = 'md',
  glassEffect = true,
  className,
}) => {
  // Context7 Pattern: Memoize computed values for performance
  const supplierEntity = useMemo<SupplierEntity>(() => ({
    id: supplier.id,
    name: supplier.company_name,
    company_name: supplier.company_name,
    is_active: supplier.is_active,
    contact_info: supplier.contact_info,
    products_supplied: supplier.products_supplied,
    delivery_time: supplier.delivery_time,
    minimum_order_value: supplier.minimum_order_value,
    payment_methods: supplier.payment_methods,
    notes: supplier.notes,
    className,
  }), [supplier, className]);

  // Context7 Pattern: Memoize contact information
  const contactInfo = useMemo(() => {
    const contacts = [];
    if (supplierEntity.contact_info?.phone) {
      contacts.push({ type: 'phone', value: supplierEntity.contact_info.phone, icon: Phone });
    }
    if (supplierEntity.contact_info?.whatsapp) {
      contacts.push({ type: 'whatsapp', value: supplierEntity.contact_info.whatsapp, icon: MessageCircle });
    }
    if (supplierEntity.contact_info?.email) {
      contacts.push({ type: 'email', value: supplierEntity.contact_info.email, icon: Mail });
    }
    return contacts;
  }, [supplierEntity.contact_info]);

  // Context7 Pattern: Memoize status badge configuration
  const statusBadge = useMemo(() => ({
    label: supplierEntity.is_active ? 'Ativo' : 'Inativo',
    variant: 'outline' as const,
    icon: supplierEntity.is_active ? Eye : EyeOff,
    className: supplierEntity.is_active
      ? 'text-green-400 border-green-400/50 bg-green-500/10'
      : 'text-gray-400 border-gray-400/50 bg-gray-500/10',
  }), [supplierEntity.is_active]);

  // Context7 Pattern: Memoize product badges
  const productBadges = useMemo(() => {
    if (!supplierEntity.products_supplied?.length) return [];

    const maxVisible = 2;
    const badges = supplierEntity.products_supplied.slice(0, maxVisible).map(product => ({
      label: product,
      variant: 'secondary' as const,
      className: 'text-xs bg-purple-500/20 border-purple-400/30 text-purple-200',
    }));

    if (supplierEntity.products_supplied.length > maxVisible) {
      badges.push({
        label: `+${supplierEntity.products_supplied.length - maxVisible}`,
        variant: 'secondary' as const,
        className: 'text-xs bg-purple-500/20 border-purple-400/30 text-purple-200',
      });
    }

    return badges;
  }, [supplierEntity.products_supplied]);

  // Context7 Pattern: Memoize payment method badges
  const paymentBadges = useMemo(() => {
    if (!supplierEntity.payment_methods?.length) return [];

    const maxVisible = 2;
    const badges = supplierEntity.payment_methods.slice(0, maxVisible).map(method => ({
      label: method,
      variant: 'outline' as const,
      className: 'text-xs bg-black/60 border-gray-400/50 text-gray-200',
    }));

    if (supplierEntity.payment_methods.length > maxVisible) {
      badges.push({
        label: `+${supplierEntity.payment_methods.length - maxVisible}`,
        variant: 'outline' as const,
        className: 'text-xs bg-black/60 border-gray-400/50 text-gray-200',
      });
    }

    return badges;
  }, [supplierEntity.payment_methods]);

  // Context7 Pattern: Memoize all badges
  const badges = useMemo(() => [statusBadge], [statusBadge]);

  // Context7 Pattern: Memoize fields configuration
  const fields = useMemo(() => {
    const fieldsList = [];

    // Contact information (show first contact if available)
    if (contactInfo.length > 0) {
      fieldsList.push({
        label: 'Contato',
        value: (
          <span className="truncate" title={contactInfo[0].value}>
            {contactInfo[0].value}
          </span>
        ),
        icon: contactInfo[0].icon,
      });
    }

    // Delivery time
    if (supplierEntity.delivery_time) {
      fieldsList.push({
        label: 'Entrega',
        value: supplierEntity.delivery_time,
        icon: Clock,
      });
    }

    // Minimum order value
    fieldsList.push({
      label: 'Mín. Pedido',
      value: formatCurrency(supplierEntity.minimum_order_value),
      icon: DollarSign,
    });

    return fieldsList;
  }, [contactInfo, supplierEntity.delivery_time, supplierEntity.minimum_order_value]);

  // Context7 Pattern: Memoize actions configuration
  const actions = useMemo(() => {
    if (userRole !== 'admin') return [];

    const actionsList = [];

    if (onEdit) {
      actionsList.push({
        icon: Edit,
        label: `Editar fornecedor ${supplierEntity.name}`,
        onClick: () => onEdit(supplier),
        className: 'hover:bg-purple-500/20 text-gray-300 hover:text-purple-400',
      });
    }

    return actionsList;
  }, [userRole, onEdit, supplierEntity.name, supplier]);

  // Context7 Pattern: Custom content for products and payments
  const customContent = useMemo(() => (
    <div className="space-y-3">
      {/* Products Section */}
      {productBadges.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Package className="h-3 w-3" />
            Produtos
          </div>
          <div className="flex flex-wrap gap-1">
            {productBadges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant}
                className={badge.className}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods Section */}
      {paymentBadges.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <CreditCard className="h-3 w-3" />
            Pagamento
          </div>
          <div className="flex flex-wrap gap-1">
            {paymentBadges.map((badge, index) => (
              <Badge
                key={index}
                variant={badge.variant}
                className={badge.className}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {supplierEntity.notes && (
        <div className="space-y-1">
          <p className="text-xs text-gray-300 truncate" title={supplierEntity.notes}>
            💡 {supplierEntity.notes}
          </p>
        </div>
      )}

      {/* Admin Actions */}
      {userRole === 'admin' && onDelete && (
        <div className="pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDelete(supplier)}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="h-3 w-3 mr-1 inline" />
            Remover
          </button>
        </div>
      )}
    </div>
  ), [productBadges, paymentBadges, supplierEntity.notes, userRole, onDelete, supplier]);

  // Context7 Pattern: Custom memo comparison for supplier-specific optimization
  const customMemoComparison = useMemo(() => (
    (prevProps: EntityCardProps<SupplierEntity>, nextProps: EntityCardProps<SupplierEntity>) => {
      return prevProps.entity.id === nextProps.entity.id &&
             prevProps.entity.name === nextProps.entity.name &&
             prevProps.entity.is_active === nextProps.entity.is_active;
    }
  ), []);

  return (
    <EntityCard
      entity={supplierEntity}
      variant={variant}
      size={size}
      glassEffect={glassEffect}
      badges={badges}
      fields={fields}
      actions={actions}
      headerIcon={Building2}
      customMemoComparison={customMemoComparison}
    >
      {customContent}
    </EntityCard>
  );
};

export default SupplierEntityCard;