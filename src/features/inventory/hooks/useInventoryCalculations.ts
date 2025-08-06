import { useMemo } from 'react';
import { ProductFormData, ProductCalculations, TurnoverRate } from '@/types/inventory.types';

export const useInventoryCalculations = (productData: Partial<ProductFormData>) => {
  const calculations = useMemo((): ProductCalculations => {
    const {
      price = 0,
      cost_price = 0,
      package_size = 1,
      package_price,
      unit_type = 'un'
    } = productData;

    // Cálculos de margem por unidade
    const unitProfitAmount = price - cost_price;
    const unitMargin = cost_price > 0 ? (unitProfitAmount / cost_price) * 100 : 0;

    // Cálculos para preço por pacote
    const calculatedPackagePrice = package_price || (price * package_size);
    const packageCostPrice = cost_price * package_size;
    const packageProfitAmount = calculatedPackagePrice - packageCostPrice;
    const packageMargin = packageCostPrice > 0 ? (packageProfitAmount / packageCostPrice) * 100 : 0;

    return {
      unitMargin: Math.round(unitMargin * 100) / 100,
      packageMargin: Math.round(packageMargin * 100) / 100,
      unitProfitAmount: Math.round(unitProfitAmount * 100) / 100,
      packageProfitAmount: Math.round(packageProfitAmount * 100) / 100,
      pricePerUnit: price,
      pricePerPackage: calculatedPackagePrice
    };
  }, [productData]);

  // Função para calcular preço com margem desejada
  const calculatePriceWithMargin = (costPrice: number, desiredMargin: number): number => {
    if (costPrice <= 0 || desiredMargin < 0) return 0;
    return Math.round(costPrice * (1 + desiredMargin / 100) * 100) / 100;
  };

  // Função para calcular margem necessária para atingir preço alvo
  const calculateRequiredMargin = (costPrice: number, targetPrice: number): number => {
    if (costPrice <= 0) return 0;
    return Math.round(((targetPrice - costPrice) / costPrice) * 100 * 100) / 100;
  };

  // Função para validar dados do produto
  const validateProductData = (data: Partial<ProductFormData>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Nome do produto é obrigatório');
    }

    if (!data.category?.trim()) {
      errors.push('Categoria é obrigatória');
    }

    if (typeof data.price !== 'number' || data.price < 0) {
      errors.push('Preço deve ser um valor positivo');
    }

    if (typeof data.stock_quantity !== 'number' || data.stock_quantity < 0) {
      errors.push('Quantidade em estoque deve ser um valor positivo');
    }

    if (typeof data.minimum_stock !== 'number' || data.minimum_stock < 0) {
      errors.push('Estoque mínimo deve ser um valor positivo');
    }

    if (data.package_size && (typeof data.package_size !== 'number' || data.package_size < 1)) {
      errors.push('Tamanho do pacote deve ser maior que 0');
    }

    if (data.cost_price && (typeof data.cost_price !== 'number' || data.cost_price < 0)) {
      errors.push('Preço de custo deve ser um valor positivo');
    }

    if (data.volume_ml && (typeof data.volume_ml !== 'number' || data.volume_ml <= 0)) {
      errors.push('Volume deve ser um valor positivo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Função para determinar taxa de giro baseada em vendas
  const calculateTurnoverRate = (salesLast30Days: number, averageStock: number): TurnoverRate => {
    if (averageStock <= 0) return 'slow';
    
    const turnoverRatio = salesLast30Days / averageStock;
    
    if (turnoverRatio >= 2) return 'fast';
    if (turnoverRatio >= 0.5) return 'medium';
    return 'slow';
  };

  return {
    calculations,
    calculatePriceWithMargin,
    calculateRequiredMargin,
    validateProductData,
    calculateTurnoverRate
  };
};

export default useInventoryCalculations;