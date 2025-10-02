/**
 * Componente card individual de cliente
 * Extraído do CustomersNew.tsx para reutilização
 */

import React, { useMemo } from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Phone, Mail, MapPin, Calendar, Eye, Edit } from 'lucide-react';
import { formatCurrency, cn, formatAddress } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { CustomerCardProps } from './types';
import { CustomerSegmentBadge } from './CustomerSegmentBadge';

interface ModernCustomerCardProps extends CustomerCardProps {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const CustomerCard = React.memo<ModernCustomerCardProps>(({
  customer,
  onSelect,
  onEdit,
  canEdit = false,
  variant = 'default',
  glassEffect = true,
}) => {
  // Memoizar formatação de datas para evitar recriações desnecessárias
  const formattedFirstPurchase = useMemo(() => {
    if (!customer.first_purchase_date) return 'N/A';
    return new Date(customer.first_purchase_date).toLocaleDateString('pt-BR');
  }, [customer.first_purchase_date]);

  const formattedLastPurchase = useMemo(() => {
    if (!customer.last_purchase_date) return 'N/A';
    return new Date(customer.last_purchase_date).toLocaleDateString('pt-BR');
  }, [customer.last_purchase_date]);

  const formattedBirthday = useMemo(() => {
    if (!customer.birthday) return 'N/A';
    return new Date(customer.birthday).toLocaleDateString('pt-BR');
  }, [customer.birthday]);

  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <Card className={cn(
      glassClasses,
      'hover:border-primary-yellow/60 transition-all duration-300 hover:scale-[1.02]'
    )}>
      <CardContent className="p-4">
        {/* Header do Card */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-100 truncate" title={customer.name}>
              {customer.name}
            </h3>
            <div className="mt-1">
              <CustomerSegmentBadge 
                segment={customer.segment || ''} 
                variant={variant}
                glassEffect={glassEffect}
              />
            </div>
          </div>
          
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelect(customer)}
              className="h-8 w-8 p-0 hover:bg-primary-yellow/20 text-gray-300 hover:text-primary-yellow"
              aria-label={`Ver detalhes do cliente ${customer.name}`}
              title="Ver detalhes"
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
            </Button>
            {canEdit && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(customer)}
                className="h-8 w-8 p-0 hover:bg-accent-blue/20 text-gray-300 hover:text-accent-blue"
                aria-label={`Editar cliente ${customer.name}`}
                title="Editar cliente"
              >
                <Edit className="h-3 w-3" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-2 mb-3">
          {customer.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span className="text-gray-200 truncate" title={customer.email}>
                {customer.email}
              </span>
            </div>
          )}
          
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span className="text-gray-200">
                {customer.phone}
              </span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span className="text-gray-200 truncate" title={formatAddress(customer.address)}>
                {formatAddress(customer.address)}
              </span>
            </div>
          )}
        </div>

        {/* Informações de Compra */}
        <div className="space-y-2 pt-2 border-t border-primary-yellow/20">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">LTV:</span>
            <span className="font-semibold text-primary-yellow">
              {formatCurrency(customer.lifetime_value || 0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Primeira compra:</span>
            <span className="text-sm text-gray-200">
              {formattedFirstPurchase}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Última compra:</span>
            <span className="text-sm text-gray-200">
              {formattedLastPurchase}
            </span>
          </div>

          {customer.favorite_category && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Categoria favorita:</span>
              <span className="text-sm text-gray-200 truncate">
                {customer.favorite_category}
              </span>
            </div>
          )}
        </div>

        {/* Data de Aniversário */}
        {customer.birthday && (
          <div className="mt-2 pt-2 border-t border-primary-yellow/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-gray-400" aria-hidden="true" />
              <span className="text-sm text-gray-400">Aniversário:</span>
              <span className="text-sm text-gray-200">
                {formattedBirthday}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para otimizar re-renders
  return prevProps.customer.id === nextProps.customer.id &&
         prevProps.customer.name === nextProps.customer.name &&
         prevProps.customer.segment === nextProps.customer.segment &&
         prevProps.customer.lifetime_value === nextProps.customer.lifetime_value &&
         prevProps.canEdit === nextProps.canEdit;
});