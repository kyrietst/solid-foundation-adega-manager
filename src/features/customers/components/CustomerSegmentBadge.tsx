/**
 * Componente badge de segmento de cliente
 * Extraído do CustomersNew.tsx para reutilização
 */

import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { CustomerSegmentBadgeProps } from './types';
import { useCustomerSegmentation } from '@/features/customers/hooks/useCustomerSegmentation';
import { Crown, Users, UserCheck, UserPlus, CircleHelp } from 'lucide-react';

// Mapeamento de ícones por segmento para indicação visual além da cor
const getSegmentIcon = (segment: string) => {
  switch (segment.toLowerCase()) {
    case 'vip':
    case 'alto valor':
      return Crown;
    case 'regular':
    case 'frequente':
      return Users;
    case 'ativo':
    case 'recorrente':
      return UserCheck;
    case 'novo':
    case 'potencial':
      return UserPlus;
    default:
      return CircleHelp;
  }
};

// Mapeamento de padrões visuais por segmento
const getSegmentPattern = (segment: string) => {
  switch (segment.toLowerCase()) {
    case 'vip':
    case 'alto valor':
      return 'font-bold border-2'; // Borda dupla para VIP
    case 'regular':
    case 'frequente':
      return 'font-semibold'; // Negrito para regular
    case 'ativo':
    case 'recorrente':
      return 'font-medium'; // Médio para ativo
    case 'novo':
    case 'potencial':
      return 'font-normal border-dashed'; // Tracejado para novo
    default:
      return 'font-light opacity-75'; // Transparente para indefinido
  }
};

export const CustomerSegmentBadge: React.FC<CustomerSegmentBadgeProps> = ({
  segment,
  className = '',
}) => {
  // Hook para lógica de segmentação (cores)
  const { getSegmentColor } = useCustomerSegmentation([]);
  
  if (!segment) {
    const Icon = CircleHelp;
    return (
      <Badge 
        className={`bg-gray-500/20 text-gray-400 border-gray-500/30 font-light opacity-75 ${className}`}
        variant="outline"
        aria-label="Segmento não definido"
      >
        <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
        Sem segmento
      </Badge>
    );
  }

  const Icon = getSegmentIcon(segment);
  const pattern = getSegmentPattern(segment);
  
  return (
    <Badge 
      className={`${getSegmentColor(segment)} ${pattern} ${className}`}
      variant="outline"
      aria-label={`Segmento do cliente: ${segment}`}
    >
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {segment}
    </Badge>
  );
};