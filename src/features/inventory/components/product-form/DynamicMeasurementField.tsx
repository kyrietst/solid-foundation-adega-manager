/**
 * Campo dinâmico de medição que se adapta à categoria do produto
 * Implementa História 1.2: campos "Volume" ou "Unidade" baseados na categoria
 */

import React, { useEffect } from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { cn } from '@/core/config/utils';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';
import {
  isBeverageCategory,
  getMeasurementLabel,
  getMeasurementPlaceholder,
  getMeasurementUnit,
  getMeasurementTypeForCategory
} from '@/features/inventory/utils/categoryUtils';

interface DynamicMeasurementFieldProps {
  variant?: 'default' | 'premium' | 'subtle' | 'strong' | 'yellow';
  glassEffect?: boolean;
}

export const DynamicMeasurementField: React.FC<DynamicMeasurementFieldProps> = ({
  variant = 'default',
  glassEffect = true,
}) => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<ProductFormValues>();

  const category = watch('category');
  const isBeverage = isBeverageCategory(category);

  // Updates measurement_type when category changes
  useEffect(() => {
    if (category) {
      const type = getMeasurementTypeForCategory(category);
      setValue('measurement_type', type);
    }
  }, [category, setValue]);

  if (!category) {
    return null; // Don't render if no category selected
  }

  const label = getMeasurementLabel(category);
  const placeholder = getMeasurementPlaceholder(category);
  const unit = getMeasurementUnit(category);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = Number(value);

    // If beverage, sync volume_ml
    if (isBeverage && !isNaN(numericValue)) {
      setValue('volume_ml', numericValue);
    }
  };

  return (
    <div>
      <Label htmlFor="dynamic-measurement" className="text-gray-200">
        {label} {isBeverage ? '*' : ''}
      </Label>
      <div className="relative">
        <Input
          id="dynamic-measurement"
          type="number"
          step="any"
          {...register('measurement_value', {
            onChange: handleValueChange
          })}
          placeholder={placeholder}
          className={cn(
            'pr-12 bg-gray-800/50 border-primary-yellow/30 text-gray-200 focus:border-primary-yellow placeholder:text-gray-400',
            (errors.volume_ml || errors.measurement_value) && 'border-accent-red'
          )}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm">{unit}</span>
        </div>
      </div>
      {(errors.volume_ml || errors.measurement_value) && (
        <p className="text-accent-red text-sm mt-1">
          {(errors.volume_ml?.message || errors.measurement_value?.message) as string}
        </p>
      )}
    </div>
  );
};