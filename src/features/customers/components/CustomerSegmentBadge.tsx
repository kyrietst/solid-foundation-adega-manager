/**
 * Componente badge de segmento de cliente
 * Extraído do CustomersNew.tsx para reutilização
 */

import React from 'react';
import { Badge } from '@/shared/ui/primitives/badge';
import { CustomerSegmentBadgeProps } from './types';
import { useCustomerSegmentation } from '@/features/customers/hooks/useCustomerSegmentation';
import { Crown, Users, UserCheck, UserPlus, CircleHelp } from 'lucide-react';
import { cn } from '@/core/config/utils';

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

// Mapeamento de padrões visuais modernos por segmento
const getSegmentPattern = (segment: string, glassEffect: boolean) => {
  const basePattern = glassEffect ? 'glass-subtle' : '';
  
  switch (segment.toLowerCase()) {
    case 'vip':
    case 'alto valor':
      return cn(basePattern, 'font-bold border-2 border-primary-yellow/60 text-primary-yellow bg-primary-yellow/10');
    case 'regular':
    case 'frequente':
      return cn(basePattern, 'font-semibold border-accent-green/60 text-accent-green bg-accent-green/10');
    case 'ativo':
    case 'recorrente':
      return cn(basePattern, 'font-medium border-accent-blue/60 text-accent-blue bg-accent-blue/10');
    case 'novo':
    case 'potencial':
      return cn(basePattern, 'font-normal border-dashed border-gray-400 text-gray-300 bg-gray-400/10');
    default:
      return cn(basePattern, 'font-light opacity-75 border-gray-500 text-gray-400 bg-gray-500/10');
  }
};

interface ModernCustomerSegmentBadgeProps extends CustomerSegmentBadgeProps {
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const CustomerSegmentBadge: React.FC<ModernCustomerSegmentBadgeProps> = ({
  segment,
  className = '',
  variant = 'default',
  glassEffect = true,
}) => {
  // Hook para lógica de segmentação (cores)
  const { getSegmentColor } = useCustomerSegmentation([]);
  
  if (!segment) {
    const Icon = CircleHelp;
    const glassClasses = glassEffect ? 'glass-subtle' : '';
    
    return (
      <Badge 
        className={cn(
          'bg-gray-500/20 text-gray-400 border-gray-500/30 font-light opacity-75',
          glassClasses,
          className
        )}
        variant="outline"
        aria-label="Segmento não definido"
      >
        <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
        Sem segmento
      </Badge>
    );
  }

  const Icon = getSegmentIcon(segment);
  const pattern = getSegmentPattern(segment, glassEffect);
  
  return (
    <Badge 
      className={cn(
        pattern,
        className
      )}
      variant="outline"
      aria-label={`Segmento do cliente: ${segment}`}
    >
      <Icon className="h-3 w-3 mr-1" aria-hidden="true" />
      {segment}
    </Badge>
  );
};