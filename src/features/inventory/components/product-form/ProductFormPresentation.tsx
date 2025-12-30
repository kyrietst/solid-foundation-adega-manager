/**
 * Apresentação pura do ProductForm
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { UseFormReturn, FormProvider } from 'react-hook-form';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';
import { ProductBasicInfoCard } from './ProductBasicInfoCard';
import { BarcodeHierarchySection } from './BarcodeHierarchySection';
import { ProductPricingCard } from './ProductPricingCard';
import { ProductStockCard } from './ProductStockCard';
import { ProductFormActions } from './ProductFormActions';
import { ProductFiscalCard } from './ProductFiscalCard';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

export interface ProductFormPresentationProps {
  form: UseFormReturn<ProductFormValues>;
  calculations: any;

  // Estados
  isLoading: boolean;
  isEdit: boolean;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;

  // Handlers
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ProductFormPresentation: React.FC<ProductFormPresentationProps> = ({
  form,
  calculations,
  isLoading,
  isEdit,
  variant = 'default',
  glassEffect = true,
  onSubmit,
  onCancel,
}) => {
  // Map semantic variants to visual style variants for Glass components
  const glassVariant = React.useMemo<'default' | 'premium' | 'subtle' | 'strong' | 'yellow'>(() => {
    const mapping: Record<string, 'default' | 'premium' | 'subtle' | 'strong' | 'yellow'> = {
      default: 'default',
      premium: 'premium',
      success: 'subtle', // Success -> Subtle (Clean)
      warning: 'yellow', // Warning -> Yellow
      error: 'strong'    // Error -> Strong (High contrast)
    };
    return mapping[variant] || 'default';
  }, [variant]);

  const glassClasses = glassEffect ? getGlassCardClasses(glassVariant) : '';

  return (
    <div className={cn('p-6 rounded-lg', glassClasses)}>
      <FormProvider {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <ProductBasicInfoCard
            variant={glassVariant}
            glassEffect={glassEffect}
          />

          {/* Controle de Códigos Hierárquicos - Sistema de Validade */}
          <BarcodeHierarchySection
            variant={glassVariant}
            glassEffect={glassEffect}
          />

          {/* Preços e Margens */}
          <ProductPricingCard
            calculations={calculations}
            variant={glassVariant}
            glassEffect={glassEffect}
          />

          {/* Fiscal (NCM, CEST, CFOP) */}
          <ProductFiscalCard
            glassEffect={glassEffect}
          />

          {/* Estoque */}
          <ProductStockCard
            variant={glassVariant}
            glassEffect={glassEffect}
          />

          {/* Ações */}
          <ProductFormActions
            onCancel={onCancel}
            isLoading={isLoading}
            isEdit={isEdit}
            isValid={form.formState.isValid}
            errors={Object.keys(form.formState.errors).map(key => {
              const err = form.formState.errors[key as keyof ProductFormValues];
              return typeof err === 'string' ? err : err?.message || 'Erro desconhecido';
            }).filter(Boolean) as string[]}
          />
        </form>
      </FormProvider>
    </div>
  );
};