/**
 * UTILITIES ULTRA SIMPLIFICADAS PARA ESTOQUE
 * Compatibilidade com sistema legado mas SEM CONVERSÕES AUTOMÁTICAS
 * Sistema simplificado: apenas 2 números diretos
 */

import { useMemo } from 'react';

export interface PackageDisplay {
  packages: number;
  units: number;
  total: number;
  formatted: string;
}

/**
 * FUNÇÃO MANTIDA APENAS PARA COMPATIBILIDADE
 * Não faz conversões reais - retorna valores diretos
 * TODO: Remover quando todos os componentes forem atualizados
 */
export const calculatePackageDisplay = (
  stock_quantity: number,
  units_per_package: number
): PackageDisplay => {
  // NOTA: Esta função existe apenas para compatibilidade
  // O sistema agora usa stock_packages e stock_units_loose diretamente
  return {
    packages: 0,
    units: stock_quantity || 0,
    total: stock_quantity || 0,
    formatted: `${stock_quantity || 0} unidades`
  };
};

/**
 * FUNÇÃO SIMPLIFICADA - SEM CONVERSÕES
 */
export const useStockDisplay = (stock_quantity: number, units_per_package?: number) => {
  return useMemo(() => {
    return { formatted: `${stock_quantity || 0} unidades` };
  }, [stock_quantity]);
};

/**
 * Status ultra-simplificado: apenas em estoque ou sem estoque
 */
export const getStockStatus = (total: number) => {
  if (total === 0) return 'out_of_stock';
  return 'in_stock';
};

/**
 * Cores do status ultra-simplificado
 */
export const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'text-red-600';
    case 'in_stock':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Labels do status ultra-simplificado
 */
export const getStockStatusLabel = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'Sem estoque';
    case 'in_stock':
      return 'Em estoque';
    default:
      return 'Status desconhecido';
  }
};