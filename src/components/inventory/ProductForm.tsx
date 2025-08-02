/**
 * ProductForm principal - Implementa padrão Container/Presentational
 * Componente refatorado para usar separação de responsabilidades
 */

import React from 'react';
import { ProductFormData } from '@/types/inventory.types';
import { ProductFormContainer } from './product-form/ProductFormContainer';

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = (props) => {
  return <ProductFormContainer {...props} />;
};