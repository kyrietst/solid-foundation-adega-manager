/**
 * Hook para cálculos automáticos de produto - História 1.4
 * Versão simplificada sem loops infinitos
 */

import { useMemo } from 'react';
import { ProductFormData } from '@/types/inventory.types';
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';

export const useProductCalculations = (
  formData: Partial<ProductFormData>,
  updateFormData: (updates: Partial<ProductFormData>) => void
) => {
  const { calculations, calculatePriceWithMargin, calculateRequiredMargin, validateProductData } = useInventoryCalculations(formData);

  // História 1.4: Handler para mudança de margem (calcula preço de venda)
  const handleMarginChange = (margin: number) => {
    if (formData.cost_price && formData.cost_price > 0) {
      const newPrice = calculatePriceWithMargin(formData.cost_price, margin);
      updateFormData({
        margin_percent: margin,
        price: newPrice
      });
    } else {
      updateFormData({
        margin_percent: margin
      });
    }
  };

  // História 1.4: Handler para mudança de preço de custo
  const handleCostPriceChange = (costPrice: number) => {
    if (formData.margin_percent && formData.margin_percent > 0) {
      // Se há margem definida, recalcular preço de venda
      const newPrice = calculatePriceWithMargin(costPrice, formData.margin_percent);
      updateFormData({
        cost_price: costPrice,
        price: newPrice
      });
    } else if (formData.price && formData.price > 0) {
      // Se há preço definido, recalcular margem
      const newMargin = calculateRequiredMargin(costPrice, formData.price);
      updateFormData({
        cost_price: costPrice,
        margin_percent: newMargin
      });
    } else {
      // Só atualizar custo
      updateFormData({ cost_price: costPrice });
    }
  };

  // História 1.4: Handler para mudança de preço de venda
  const handlePriceChange = (price: number) => {
    const updates: Partial<ProductFormData> = { price };
    
    // Recalcular margem se há preço de custo
    if (formData.cost_price && formData.cost_price > 0) {
      updates.margin_percent = calculateRequiredMargin(formData.cost_price, price);
    }
    
    // Recalcular preço de pacote se aplicável
    if (formData.is_package && formData.units_per_package && formData.units_per_package > 0) {
      updates.package_price = price * formData.units_per_package;
    }
    
    updateFormData(updates);
  };

  const validation = useMemo(() => validateProductData(formData), [formData, validateProductData]);

  return {
    calculations,
    validation,
    handleMarginChange,
    handleCostPriceChange,
    handlePriceChange,
    calculatePriceWithMargin,
    calculateRequiredMargin
  };
};