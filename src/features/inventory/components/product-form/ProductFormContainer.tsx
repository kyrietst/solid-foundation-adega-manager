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
  const {
    form,
    calculations,
    handleSubmit,
    isSubmitting
  } = useProductFormLogic({
    initialData,
    onSubmit: onSubmit as any, // Type assertion might be needed if signatures differ slightly
    onClose: onCancel,
    mode: isEdit ? 'edit' : 'create'
  });

  return (
    <ProductFormPresentation
      form={form}
      calculations={calculations}
      isLoading={isLoading || isSubmitting}
      isEdit={isEdit}
      variant={variant}
      glassEffect={glassEffect}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
};