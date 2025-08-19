/**
 * Apresentação pura do ProductForm
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { ProductFormData, UnitType } from '@/types/inventory.types';
import { ProductValidationResult } from '@/features/inventory/hooks/useProductValidation';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { ProductBasicInfoCard } from './ProductBasicInfoCard';
import { BarcodeHierarchySection } from './BarcodeHierarchySection';
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
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;

  // Handlers
  onInputChange: (field: keyof ProductFormData, value: string | number | UnitType | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onBarcodeScanned: (barcode: string) => void;
  onMarginChange: (margin: number) => void;
  // História 1.4: Novos handlers para cálculos em tempo real
  onCostPriceChange?: (costPrice: number) => void;
  onPriceChange?: (price: number) => void;
}

export const ProductFormPresentation: React.FC<ProductFormPresentationProps> = ({
  formData,
  calculations,
  validation,
  categories,
  isLoading,
  isEdit,
  variant = 'default',
  glassEffect = true,
  onInputChange,
  onSubmit,
  onCancel,
  onBarcodeScanned,
  onMarginChange,
  onCostPriceChange,
  onPriceChange,
}) => {
  const glassClasses = glassEffect ? getGlassCardClasses(variant) : '';

  return (
    <div className={cn('p-6 rounded-lg', glassClasses)}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <ProductBasicInfoCard
          formData={formData}
          categories={categories}
          fieldErrors={validation.fieldErrors}
          onInputChange={onInputChange}
          variant={variant}
          glassEffect={glassEffect}
        />

        {/* Controle de Códigos Hierárquicos - Sistema de Validade */}
        <BarcodeHierarchySection
          formData={formData}
          fieldErrors={validation.fieldErrors}
          onInputChange={onInputChange}
          variant={variant}
          glassEffect={glassEffect}
        />

        {/* Preços e Margens */}
        <ProductPricingCard
          formData={formData}
          calculations={calculations}
          fieldErrors={validation.fieldErrors}
          onInputChange={onInputChange}
          onMarginChange={onMarginChange}
          onCostPriceChange={onCostPriceChange}
          onPriceChange={onPriceChange}
          variant={variant}
          glassEffect={glassEffect}
        />

        {/* Controle de Estoque */}
        <ProductStockCard
          formData={formData}
          fieldErrors={validation.fieldErrors}
          onInputChange={onInputChange}
          variant={variant}
          glassEffect={glassEffect}
        />

        {/* Informações Adicionais */}
        <ProductAdditionalInfoCard
          formData={formData}
          fieldErrors={validation.fieldErrors}
          onInputChange={onInputChange}
          variant={variant}
          glassEffect={glassEffect}
        />

        {/* Ações do Formulário */}
        <ProductFormActions
          isLoading={isLoading}
          isEdit={isEdit}
          isValid={validation.isValid}
          errors={validation.errors}
          onCancel={onCancel}
          variant={variant}
          glassEffect={glassEffect}
        />
      </form>
    </div>
  );
};