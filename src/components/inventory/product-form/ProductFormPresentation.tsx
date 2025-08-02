/**
 * Apresentação pura do ProductForm
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { ProductFormData, UnitType } from '@/types/inventory.types';
import { ProductValidationResult } from '@/hooks/inventory/useProductValidation';
import { ProductBasicInfoCard } from './ProductBasicInfoCard';
import { ProductPricingCard } from './ProductPricingCard';
import { ProductStockCard } from './ProductStockCard';
import { ProductAdditionalInfoCard } from './ProductAdditionalInfoCard';
import { ProductFormActions } from './ProductFormActions';

export interface ProductFormPresentationProps {
  // Dados processados
  formData: Partial<ProductFormData>;
  calculations: any;
  validation: ProductValidationResult;
  categories: string[];

  // Estados
  isLoading: boolean;
  isEdit: boolean;

  // Handlers
  onInputChange: (field: keyof ProductFormData, value: string | number | UnitType) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onBarcodeScanned: (barcode: string) => void;
  onMarginChange: (margin: number) => void;
}

export const ProductFormPresentation: React.FC<ProductFormPresentationProps> = ({
  formData,
  calculations,
  validation,
  categories,
  isLoading,
  isEdit,
  onInputChange,
  onSubmit,
  onCancel,
  onBarcodeScanned,
  onMarginChange,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <ProductBasicInfoCard
        formData={formData}
        categories={categories}
        fieldErrors={validation.fieldErrors}
        onInputChange={onInputChange}
        onBarcodeScanned={onBarcodeScanned}
      />

      {/* Preços e Margens */}
      <ProductPricingCard
        formData={formData}
        calculations={calculations}
        fieldErrors={validation.fieldErrors}
        onInputChange={onInputChange}
        onMarginChange={onMarginChange}
      />

      {/* Controle de Estoque */}
      <ProductStockCard
        formData={formData}
        fieldErrors={validation.fieldErrors}
        onInputChange={onInputChange}
      />

      {/* Informações Adicionais */}
      <ProductAdditionalInfoCard
        formData={formData}
        fieldErrors={validation.fieldErrors}
        onInputChange={onInputChange}
      />

      {/* Ações do Formulário */}
      <ProductFormActions
        isLoading={isLoading}
        isEdit={isEdit}
        isValid={validation.isValid}
        errors={validation.errors}
        onCancel={onCancel}
      />
    </form>
  );
};