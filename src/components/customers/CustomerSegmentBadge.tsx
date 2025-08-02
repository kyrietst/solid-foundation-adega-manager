/**
 * Componente badge de segmento de cliente
 * Extraído do CustomersNew.tsx para reutilização
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CustomerSegmentBadgeProps } from './types';
import { useCustomerSegmentation } from '@/hooks/customers/useCustomerSegmentation';

export const CustomerSegmentBadge: React.FC<CustomerSegmentBadgeProps> = ({
  segment,
  className = '',
}) => {
  // Hook para lógica de segmentação (apenas para cor)
  const { getSegmentColor } = useCustomerSegmentation([]);

  if (!segment) {
    return (
      <Badge 
        className={`bg-gray-500/20 text-gray-400 border-gray-500/30 ${className}`}
        variant="outline"
      >
        Sem segmento
      </Badge>
    );
  }

  return (
    <Badge 
      className={`${getSegmentColor(segment)} ${className}`}
      variant="outline"
    >
      {segment}
    </Badge>
  );
};