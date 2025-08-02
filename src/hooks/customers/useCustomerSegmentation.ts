/**
 * Hook para lógica de segmentação de clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import { useMemo } from 'react';
import { CustomerProfile } from '@/hooks/use-crm';
import { CustomerSegmentation } from '@/components/customers/types';

export const useCustomerSegmentation = (customers: CustomerProfile[]): CustomerSegmentation => {
  // Segmentos únicos
  const segments = useMemo(() => {
    return [...new Set(customers.map(c => c.segment).filter(Boolean))];
  }, [customers]);

  // Função para obter cor do segmento  
  const getSegmentColor = (segment: string): string => {
    switch (segment) {
      case 'VIP':
      case 'Fiel - VIP':
        return 'bg-adega-gold/20 text-adega-gold border-adega-gold/30';
      case 'Regular':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Ocasional':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Novo':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Inativo':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Em risco':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Função para obter contagem por segmento
  const getSegmentCount = (segment: string): number => {
    return customers.filter(c => c.segment === segment).length;
  };

  return {
    segments: segments as string[],
    getSegmentColor,
    getSegmentCount
  };
};