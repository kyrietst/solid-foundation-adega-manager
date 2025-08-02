/**
 * Container do ProductForm - Coordena dados e lógica
 * Implementa padrão Container/Presentational
 */

import React from 'react';
import { ProductFormData } from '@/types/inventory.types';
import { useProductFormLogic } from '@/hooks/inventory/useProductFormLogic';
import { ProductFormPresentation } from './ProductFormPresentation';

interface ProductFormContainerProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const ProductFormContainer: React.FC<ProductFormContainerProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false
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

    // Handlers
    onInputChange: handleInputChange,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    onBarcodeScanned: handleBarcodeScanned,
    onMarginChange: handleMarginChange,
  };

  return <ProductFormPresentation {...presentationProps} />;
};