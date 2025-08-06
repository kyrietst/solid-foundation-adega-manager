/**
 * Hook para cálculos automáticos de produto
 * Centraliza lógica de cálculos de preços e margens
 */

import { useEffect } from 'react';
import { ProductFormData } from '@/types/inventory.types';
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';

export const useProductCalculations = (
  formData: Partial<ProductFormData>,
  updateFormData: (updates: Partial<ProductFormData>) => void
) => {
  const { calculations, calculatePriceWithMargin, validateProductData } = useInventoryCalculations(formData);

  // Atualizar preço por pacote automaticamente quando necessário
  useEffect(() => {
    if (formData.price && formData.package_size && !formData.package_price) {
      updateFormData({
        package_price: (formData.price || 0) * (formData.package_size || 1)
      });
    }
  }, [formData.price, formData.package_size, formData.package_price, updateFormData]);

  const handleMarginChange = (margin: number) => {
    if (formData.cost_price) {
      const newPrice = calculatePriceWithMargin(formData.cost_price, margin);
      updateFormData({
        margin_percent: margin,
        price: newPrice
      });
    }
  };

  const validation = validateProductData(formData);

  return {
    calculations,
    validation,
    handleMarginChange,
    calculatePriceWithMargin
  };
};