/**
 * Container do ProductForm - Coordena dados e lógica
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { ProductFormData } from '@/core/types/inventory.types';
import { useProductFormLogic } from '@/features/inventory/hooks/useProductFormLogic';
import { ProductFormPresentation } from './ProductFormPresentation';

interface ProductFormContainerProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const ProductFormContainer: React.FC<ProductFormContainerProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
  variant = 'default',
  glassEffect = true
}) => {
  // Lógica centralizada
  const {
    formData,
    calculations,
    validation,
    categories,
    handleInputChange,
    handleSubmit,
    handleCancel,
    handleBarcodeScanned,
    handleMarginChange,
    // História 1.4: Novos handlers para cálculos
    handleCostPriceChange,
    handlePriceChange,
  } = useProductFormLogic({
    initialData,
    onSubmit,
    onCancel
  });

  // Preparar props para apresentação
  const presentationProps = {
    // Dados processados
    formData,
    calculations,
    validation,
    categories,

    // Estados
    isLoading,
    isEdit,
    variant,
    glassEffect,

    // Handlers
    onInputChange: handleInputChange,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onBarcodeScanned: handleBarcodeScanned,
    onMarginChange: handleMarginChange,
    // História 1.4: Handlers de cálculos em tempo real
    onCostPriceChange: handleCostPriceChange,
    onPriceChange: handlePriceChange,
  };

  return <ProductFormPresentation {...presentationProps} />;
};