/**
 * Utilities para cálculos de estoque dinâmico
 * Implementa a exibição de pacotes/unidades conforme SPRINT 3
 * Baseado na documentação docs/limpeza/prompt.md
 */

import { useMemo } from 'react';

export interface PackageDisplay {
  packages: number;
  units: number;
  total: number;
  formatted: string;
}

/**
 * Calcula a exibição dinâmica de pacotes e unidades
 * Fórmula (Pacotes): Math.floor(stock_quantity / units_per_package)
 * Fórmula (Unidades Soltas): stock_quantity % units_per_package
 */
export const calculatePackageDisplay = (
  stock_quantity: number,
  units_per_package: number
): PackageDisplay => {
  if (!units_per_package || units_per_package <= 0) {
    return {
      packages: 0,
      units: stock_quantity,
      total: stock_quantity,
      formatted: `${stock_quantity} unidades`
    };
  }

  const packages = Math.floor(stock_quantity / units_per_package);
  const units = stock_quantity % units_per_package;

  let formatted = '';
  if (packages > 0 && units > 0) {
    formatted = `${packages} pacotes e ${units} unidades`;
  } else if (packages > 0) {
    formatted = `${packages} pacotes`;
  } else {
    formatted = `${units} unidades`;
  }

  return {
    packages,
    units,
    total: stock_quantity,
    formatted
  };
};

/**
 * Hook para usar cálculos de estoque em componentes
 * Otimizado com useMemo para performance
 */
export const useStockDisplay = (stock_quantity: number, units_per_package?: number) => {
  return useMemo(() => {
    if (!units_per_package) return { formatted: `${stock_quantity} unidades` };
    return calculatePackageDisplay(stock_quantity, units_per_package);
  }, [stock_quantity, units_per_package]);
};

/**
 * Utility para determinar status do estoque
 */
export const getStockStatus = (stock_quantity: number, minimum_stock?: number) => {
  if (stock_quantity === 0) return 'out_of_stock';
  if (minimum_stock && stock_quantity <= minimum_stock) return 'low_stock';
  return 'adequate';
};

/**
 * Utility para cores do status do estoque
 */
export const getStockStatusColor = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'text-red-600';
    case 'low_stock':
      return 'text-yellow-600';
    case 'adequate':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Utility para labels do status do estoque
 */
export const getStockStatusLabel = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'Sem estoque';
    case 'low_stock':
      return 'Estoque baixo';
    case 'adequate':
      return 'Estoque adequado';
    default:
      return 'Status desconhecido';
  }
};